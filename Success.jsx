import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/Cart.jsx';

export default function Success() {
  const [sp] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const { clear } = useCart();
  useEffect(() => {
    api(`/orders/verify?order=${sp.get('order')}&session_id=${sp.get('session_id') || ''}`)
      .then((o) => { setOrder(o); if (o.status !== 'pending') clear(); }).catch((e) => setErr(e.message));
  }, []);
  if (err) return <div className="page"><h1>{err}</h1></div>;
  if (!order) return <div className="page muted">Confirming your payment…</div>;
  return (
    <div className="page narrow">
      <h1>{order.status === 'pending' ? 'Payment still processing' : 'Thank you, your order is in'}</h1>
      <p className="lead">Order <code>{order._id.slice(-8)}</code> · {money(order.total)}. We’ll pack it within two working days.</p>
      <div className="row gap"><Link className="btn" to="/orders">View your orders</Link><Link className="btn ghost" to="/shop">Keep shopping</Link></div>
    </div>
  );
}
