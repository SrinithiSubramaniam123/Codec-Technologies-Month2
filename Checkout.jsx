import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/Cart.jsx';
import { useAuth } from '../context/Auth.jsx';

export default function Checkout() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const [a, setA] = useState({ name: user?.name || '', line1: '', city: '', postal: '', country: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setA({ ...a, [k]: e.target.value });

  if (!items.length) return <div className="page"><h1>Your cart is empty</h1><Link className="btn" to="/shop">Browse the shop</Link></div>;

  const pay = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const { url } = await api('/orders/checkout', { method: 'POST', body: { items: items.map((i) => ({ productId: i.id, qty: i.qty })), address: a } });
      window.location.href = url;
    } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <div className="page checkout">
      <form onSubmit={pay} className="form">
        <h1>Shipping details</h1>
        <label>Full name<input required value={a.name} onChange={on('name')} autoComplete="name" /></label>
        <label>Address<input required value={a.line1} onChange={on('line1')} autoComplete="address-line1" /></label>
        <div className="row gap">
          <label className="grow">City<input required value={a.city} onChange={on('city')} autoComplete="address-level2" /></label>
          <label className="grow">Postal code<input required value={a.postal} onChange={on('postal')} autoComplete="postal-code" /></label>
        </div>
        <label>Country<input required value={a.country} onChange={on('country')} autoComplete="country-name" /></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn block" disabled={busy}>{busy ? 'Redirecting to payment…' : `Pay ${money(total)}`}</button>
        <p className="muted">You’ll finish payment on Stripe’s secure page.</p>
      </form>
      <aside className="summary">
        <h2>Order summary</h2>
        <ul>{items.map((i) => <li key={i.id}><span>{i.qty} × {i.name}</span><strong>{money(i.qty * i.price)}</strong></li>)}</ul>
        <div className="row between total"><span>Total</span><strong>{money(total)}</strong></div>
      </aside>
    </div>
  );
}
