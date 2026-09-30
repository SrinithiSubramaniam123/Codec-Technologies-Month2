// AI-powered recommendations: TF-IDF content vectors + cosine similarity,
// blended with "bought together" signals from past orders.
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const STOP = new Set('the a an and of for with to in on is it this that your our from by at as or be are'.split(' '));
const tok = (s) => (s || '').toLowerCase().match(/[a-z]{2,}/g)?.filter((w) => !STOP.has(w)) || [];
let cache = null;

export const invalidate = () => { cache = null; };

async function build() {
  if (cache && Date.now() - cache.at < 5 * 60 * 1000) return cache;
  const products = await Product.find().lean();
  const docs = products.map((p) => [
    ...tok(p.name), ...tok(p.name), ...tok(p.description),
    ...tok(p.category), ...tok(p.category), ...(p.tags || []).flatMap(tok),
  ]);
  const df = new Map();
  docs.forEach((d) => new Set(d).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const N = products.length;
  const vecs = docs.map((d) => {
    const tf = new Map();
    d.forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));
    const v = new Map(); let norm = 0;
    tf.forEach((c, w) => { const x = (1 + Math.log(c)) * Math.log((N + 1) / (df.get(w) + 0.5)); v.set(w, x); norm += x * x; });
    norm = Math.sqrt(norm) || 1;
    v.forEach((x, w) => v.set(w, x / norm));
    return v;
  });
  const idx = new Map(products.map((p, i) => [String(p._id), i]));
  const orders = await Order.find({ status: { $in: ['paid', 'shipped'] } }).select('items.product').lean();
  const co = new Map();
  for (const o of orders) {
    const ids = [...new Set(o.items.map((i) => String(i.product)))];
    for (const a of ids) for (const b of ids) if (a !== b) co.set(`${a}|${b}`, (co.get(`${a}|${b}`) || 0) + 1);
  }
  cache = { at: Date.now(), products, vecs, idx, co };
  return cache;
}

const cos = (a, b) => {
  let s = 0;
  const [x, y] = a.size < b.size ? [a, b] : [b, a];
  x.forEach((v, w) => { const u = y.get(w); if (u) s += v * u; });
  return s;
};

export async function similarTo(id, limit = 4) {
  const c = await build();
  const i = c.idx.get(String(id));
  if (i == null) return [];
  return c.products
    .map((p, j) => {
      if (j === i || p.stock <= 0) return null;
      const together = c.co.get(`${id}|${p._id}`) || 0;
      return { p, score: 0.7 * cos(c.vecs[i], c.vecs[j]) + 0.3 * Math.min(together / 3, 1) };
    })
    .filter(Boolean).sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.p);
}

export async function forUser(userId, limit = 4) {
  const c = await build();
  const popular = () => c.products.filter((p) => p.stock > 0)
    .sort((a, b) => b.rating * Math.log(b.numReviews + 2) - a.rating * Math.log(a.numReviews + 2)).slice(0, limit);
  if (!userId) return popular();
  const orders = await Order.find({ user: userId }).select('items.product').lean();
  const owned = new Set(orders.flatMap((o) => o.items.map((i) => String(i.product))));
  if (!owned.size) return popular();
  const profile = new Map();
  owned.forEach((id) => { const i = c.idx.get(id); if (i != null) c.vecs[i].forEach((v, w) => profile.set(w, (profile.get(w) || 0) + v)); });
  return c.products
    .map((p, j) => (owned.has(String(p._id)) || p.stock <= 0 ? null : { p, score: cos(profile, c.vecs[j]) }))
    .filter(Boolean).sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.p);
}
