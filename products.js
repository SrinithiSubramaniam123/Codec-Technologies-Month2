import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import { similarTo, forUser, invalidate } from '../lib/recommend.js';
const r = Router();

r.get('/', async (req, res) => {
  const { q, category, min, max, sort = 'new', inStock, page = 1, limit = 12 } = req.query;
  const f = {};
  if (q) f.$text = { $search: q };
  if (category) f.category = { $in: category.split(',') };
  if (min || max) f.price = { ...(min && { $gte: +min }), ...(max && { $lte: +max }) };
  if (inStock === '1') f.stock = { $gt: 0 };
  const order = { new: { createdAt: -1 }, 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, rating: { rating: -1 } }[sort] || { createdAt: -1 };
  const [items, total] = await Promise.all([
    Product.find(f).sort(order).skip((page - 1) * +limit).limit(+limit),
    Product.countDocuments(f),
  ]);
  res.json({ items, total, pages: Math.ceil(total / limit) });
});

r.get('/categories', async (_req, res) => {
  const rows = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  res.json(rows.map((x) => ({ name: x._id, count: x.count })));
});

r.get('/recommendations/me', optionalAuth, async (req, res) => res.json(await forUser(req.user?._id, 4)));
r.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).catch(() => null);
  p ? res.json(p) : res.status(404).json({ message: 'We couldn’t find that piece.' });
});
r.get('/:id/recommendations', async (req, res) => res.json(await similarTo(req.params.id, 4)));

r.post('/', protect, adminOnly, async (req, res) => { const p = await Product.create(req.body); invalidate(); res.status(201).json(p); });
r.put('/:id', protect, adminOnly, async (req, res) => { const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); invalidate(); res.json(p); });
r.delete('/:id', protect, adminOnly, async (req, res) => { await Product.findByIdAndDelete(req.params.id); invalidate(); res.json({ ok: true }); });
export default r;
