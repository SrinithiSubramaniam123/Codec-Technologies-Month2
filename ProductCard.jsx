import { Link } from 'react-router-dom';
import Glaze from './Glaze.jsx';
import { useCart } from '../context/Cart.jsx';
import { money } from '../api.js';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const out = p.stock <= 0;
  return (
    <article className="card">
      <Link to={`/product/${p._id}`} className="card-art" aria-label={p.name}>
        <Glaze name={p.name} category={p.category} image={p.image} />
        {out && <span className="badge">Sold out</span>}
        {!out && p.stock <= 5 && <span className="badge warn">Only {p.stock} left</span>}
      </Link>
      <div className="card-body">
        <div>
          <Link to={`/product/${p._id}`} className="card-name">{p.name}</Link>
          <p className="muted">{p.category}</p>
        </div>
        <div className="card-buy">
          <strong>{money(p.price)}</strong>
          <button className="btn small" disabled={out} onClick={() => add(p)}>{out ? 'Sold out' : 'Add to cart'}</button>
        </div>
      </div>
    </article>
  );
}
