import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ProductCard from './ProductCard.jsx';
import { useAuth } from '../context/Auth.jsx';

// productId => "similar pieces"; no productId => personalised for the signed-in user
export default function Recommendations({ productId, title }) {
  const [items, setItems] = useState([]);
  const { user } = useAuth();
  useEffect(() => {
    api(productId ? `/products/${productId}/recommendations` : '/products/recommendations/me').then(setItems).catch(() => setItems([]));
  }, [productId, user?.id]);
  if (!items.length) return null;
  return (
    <section className="section">
      <h2>{title}</h2>
      <div className="grid four">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
    </section>
  );
}
