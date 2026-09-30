import { Router } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { invalidate } from '../lib/recommend.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const CLIENT = () => process.env.CLIENT_URL || 'http://localhost:5173';
const r = Router();

async function markPaid(order) {
  if (order.status !== 'pending') return order;
  order.status = 'paid';
  await order.save();
  await Product.bulkWrite(order.items.map((i) => ({
    updateOne: { filter: { _id: i.product }, update: { $inc: { stock: -i.qty, numReviews: 1 } } },
  })));
  invalidate();
  return order;
}

// Stripe webhook (mounted with raw body in index.js)
export async function webhook(req, res) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.sendStatus(204);
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const order = await Order.findById(event.data.object.metadata.orderId);
      if (order) await markPaid(order);
    }
    res.json({ received: true });
  } catch (e) { res.status(400).send(`Webhook error: ${e.message}`); }
}

r.post('/checkout', protect, async (req, res) => {
  const { items = [], address = {} } = req.body;
  if (!items.length) return res.status(400).json({ message: 'Your cart is empty.' });
  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
  const lines = [];
  for (const i of items) {
    const p = products.find((x) => String(x._id) === String(i.productId));
    const qty = Math.max(1, parseInt(i.qty, 10) || 1);
    if (!p) return res.status(400).json({ message: 'An item in your cart is no longer available.' });
    if (p.stock < qty) return res.status(400).json({ message: `Only ${p.stock} of “${p.name}” left.` });
    lines.push({ product: p._id, name: p.name, price: p.price, qty, image: p.image });
  }
  const total = +lines.reduce((s, l) => s + l.price * l.qty, 0).toFixed(2);
  const order = await Order.create({ user: req.user._id, items: lines, total, address });

  if (!stripe) { // demo mode
    await markPaid(order);
    return res.json({ url: `${CLIENT()}/success?order=${order._id}` });
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: req.user.email,
    line_items: lines.map((l) => ({
      quantity: l.qty,
      price_data: { currency: 'usd', unit_amount: Math.round(l.price * 100), product_data: { name: l.name } },
    })),
    metadata: { orderId: String(order._id) },
    success_url: `${CLIENT()}/success?order=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT()}/shop`,
  });
  order.stripeSessionId = session.id;
  await order.save();
  res.json({ url: session.url });
});

// Called by the success page so local dev works without the Stripe CLI
r.get('/verify', protect, async (req, res) => {
  const order = await Order.findOne({ _id: req.query.order, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (stripe && req.query.session_id && order.status === 'pending') {
    const s = await stripe.checkout.sessions.retrieve(req.query.session_id);
    if (s.payment_status === 'paid') await markPaid(order);
  }
  res.json(order);
});

r.get('/mine', protect, async (req, res) => res.json(await Order.find({ user: req.user._id }).sort('-createdAt')));

// Admin
r.get('/stats/summary', protect, adminOnly, async (_req, res) => {
  const paid = await Order.aggregate([{ $match: { status: { $in: ['paid', 'shipped'] } } }, { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }]);
  const low = await Product.find({ stock: { $lte: 5 } }).select('name stock').sort('stock').limit(8);
  res.json({ revenue: paid[0]?.revenue || 0, orders: paid[0]?.orders || 0, products: await Product.countDocuments(), low });
});
r.get('/', protect, adminOnly, async (_req, res) => res.json(await Order.find().populate('user', 'name email').sort('-createdAt').limit(100)));
r.patch('/:id/status', protect, adminOnly, async (req, res) => res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })));
export default r;
