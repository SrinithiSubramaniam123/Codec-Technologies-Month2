import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/Cart.jsx';
import Glaze from './Glaze.jsx';
import { money } from '../api.js';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total } = useCart();
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [setOpen]);
  return (
    <>
      <div className={`scrim ${open ? 'on' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'on' : ''}`} aria-hidden={!open} aria-label="Cart">
        <header><h2>Your cart</h2><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart">✕</button></header>
        {items.length === 0 ? (
          <div className="empty"><p>Your cart is empty.</p><Link className="btn" to="/shop" onClick={() => setOpen(false)}>Browse the shop</Link></div>
        ) : (
          <>
            <ul className="lines">
              {items.map((i) => (
                <li key={i.id}>
                  <div className="thumb"><Glaze name={i.name} category={i.category} image={i.image} /></div>
                  <div className="grow">
                    <strong>{i.name}</strong>
                    <span className="muted">{money(i.price)}</span>
                    <div className="stepper">
                      <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease">−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase">+</button>
                      <button className="link" onClick={() => remove(i.id)}>Remove</button>
                    </div>
                  </div>
                  <strong>{money(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>
            <footer>
              <div className="row"><span>Subtotal</span><strong>{money(total)}</strong></div>
              <p className="muted">Shipping is free. Taxes are added at payment.</p>
              <Link className="btn block" to="/checkout" onClick={() => setOpen(false)}>Go to checkout</Link>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
