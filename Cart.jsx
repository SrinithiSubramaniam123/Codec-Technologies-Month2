import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('kiln_cart')) || []; } catch { return []; } });
  const [open, setOpen] = useState(false);
  useEffect(() => localStorage.setItem('kiln_cart', JSON.stringify(items)), [items]);

  const add = (p, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === p._id);
      if (found) return cur.map((i) => (i.id === p._id ? { ...i, qty: Math.min(p.stock, i.qty + qty) } : i));
      return [...cur, { id: p._id, name: p.name, price: p.price, image: p.image, category: p.category, stock: p.stock, qty }];
    });
    setOpen(true);
  };
  const setQty = (id, qty) => setItems((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) } : i)));
  const remove = (id) => setItems((c) => c.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);
  return <Ctx.Provider value={{ items, add, setQty, remove, clear, count, total, open, setOpen }}>{children}</Ctx.Provider>;
}
