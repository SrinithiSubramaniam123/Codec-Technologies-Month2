import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api('/orders/mine').then(setOrders); }, []);
  if (!orders) return <div className="page muted">Loading…</div>;
  return (
    <div className="page narrow wide">
      <h1>Your orders</h1>
      {orders.length === 0 && <div className="empty"><p>You haven’t ordered yet.</p><Link className="btn" to="/shop">Browse the shop</Link></div>}
      {orders.map((o) => (
        <article key={o._id} className="order">
          <header><div><strong>#{o._id.slice(-8)}</strong><span className="muted"> · {new Date(o.createdAt).toLocaleDateString()}</span></div><span className={`status ${o.status}`}>{o.status}</span></header>
          <ul>{o.items.map((i, k) => <li key={k}><span>{i.qty} × {i.name}</span><span>{money(i.price * i.qty)}</span></li>)}</ul>
          <div className="row between total"><span>Total</span><strong>{money(o.total)}</strong></div>
        </article>
      ))}
    </div>
  );
}
