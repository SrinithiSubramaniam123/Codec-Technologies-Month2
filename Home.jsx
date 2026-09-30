import { Link } from 'react-router-dom';
import Glaze from '../components/Glaze.jsx';
import Recommendations from '../components/Recommendations.jsx';
import { useAuth } from '../context/Auth.jsx';

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Ceramics made to be used every morning.</h1>
          <p>Mugs, bowls and vases thrown in small batches, finished in glazes we mix ourselves. Each piece is food-safe and dishwasher-safe.</p>
          <div className="row gap"><Link className="btn" to="/shop">Shop the collection</Link><Link className="btn ghost" to="/shop?category=Mugs">Start with mugs</Link></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="t1"><Glaze name="Tidewater Mug" category="Mugs" /></div>
          <div className="t2"><Glaze name="Celadon Noodle Bowl" category="Bowls" /></div>
          <div className="t3"><Glaze name="Harbor Floor Vase" category="Vases" /></div>
        </div>
      </section>
      <div className="page">
        <Recommendations title={user ? 'Picked for you' : 'Customer favourites'} />
      </div>
    </>
  );
}
