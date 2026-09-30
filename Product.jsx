import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, money } from '../api.js';
import Glaze from '../components/Glaze.jsx';
import Recommendations from '../components/Recommendations.jsx';
import { useCart } from '../context/Cart.jsx';

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  useEffect(() => { setP(null); setQty(1); api(`/products/${id}`).then(setP).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <div className="page"><h1>{err}</h1><Link className="btn" to="/shop">Back to the shop</Link></div>;
  if (!p) return <div className="page muted">Loading…</div>;
  return (
    <div className="page">
      <nav className="crumbs"><Link to="/shop">Shop</Link> / <Link to={`/shop?category=${p.category}`}>{p.category}</Link></nav>
      <div className="detail">
        <div className="detail-art"><Glaze name={p.name} category={p.category} image={p.image} /></div>
        <div>
          <h1>{p.name}</h1>
          <p className="price">{money(p.price)}</p>
          <p className="muted">★ {p.rating.toFixed(1)} · {p.numReviews} reviews</p>
          <p className="lead">{p.description}</p>
          <div className="tags">{p.tags.map((t) => <Link key={t} to={`/shop?q=${t}`}>{t}</Link>)}</div>
          {p.stock > 0 ? (
            <div className="row gap buy">
              <div className="stepper big">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button><span>{qty}</span>
                <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase">+</button>
              </div>
              <button className="btn" onClick={() => add(p, qty)}>Add to cart</button>
            </div>
          ) : <p className="notice">This piece is sold out. Check back soon or browse similar pieces below.</p>}
          {p.stock > 0 && p.stock <= 5 && <p className="warn-text">Only {p.stock} left in stock.</p>}
        </div>
      </div>
      <Recommendations productId={p._id} title="You might also like" />
    </div>
  );
}
