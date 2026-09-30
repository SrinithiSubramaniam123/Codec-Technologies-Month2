import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
async function load(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    return await User.findById(id);
  } catch { return null; }
}
export async function optionalAuth(req, _res, next) { req.user = await load(req); next(); }
export async function protect(req, res, next) {
  req.user = await load(req);
  if (!req.user) return res.status(401).json({ message: 'Please sign in to continue.' });
  next();
}
export const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only.' });
