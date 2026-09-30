import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(sp.get('q') || '');
  const [filters, setFilters] = useState(false);

  const set = (k, v) => setSp((prev) => { const n = new URLSearchParams(prev); v ? n.set(k, v) : n.delete(k); return n; }, { replace: true });
  const selected = (sp.get('category') || '').split(',').filter(Boolean);
  const toggleCat = (c) => set('category', (selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]).join(','));

  useEffect(() => { api('/products/categories').then(setCats); }, []);
  useEffect(() => { const t = setTimeout(() => q !== (sp.get('q') || '') && set('q', q), 350); return () => clearTimeout(t); }, [q]);
  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams(sp); p.set('limit', 9); p.set('page', 1);
    api('/products?' + p).then((d) => { setData(d); setPage(1); }).finally(() => setLoading(false));
  }, [sp]);

  const more = async () => {
    const p = new URLSearchParams(sp); p.set('limit', 9); p.set('page', page + 1);
    const d = await api('/products?' + p);
    setData((x) => ({ ...d, items: [...x.items, ...d.items] })); setPage(page + 1);
  };
  const clear = () => { setQ(''); setSp({}, { replace: true }); };
  const active = [...sp.keys()].length > 0;

  return (
    <div className="page shop">
      <div className="shop-head">
        <h1>Shop</h1>
        <input className="search" type="search" placeholder="Search mugs, bowls, “blue”, “gift”…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        <button className="btn ghost small only-mobile" onClick={() => setFilters(!filters)}>Filters</button>
      </div>
      <div className="shop-body">
        <aside className={`filters ${filters ? 'open' : ''}`}>
          <fieldset>
            <legend>Category</legend>
            {cats.map((c) => (
              <label key={c.name} className="check">
                <input type="checkbox" checked={selected.includes(c.name)} onChange={() => toggleCat(c.name)} />
                <span>{c.name}</span><em>{c.count}</em>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <div className="row gap">
              <input key={'min' + sp.get('min')} type="number" min="0" placeholder="Min" defaultValue={sp.get('min') || ''} onBlur={(e) => set('min', e.target.value)} aria-label="Minimum price" />
              <input key={'max' + sp.get('max')} type="number" min="0" placeholder="Max" defaultValue={sp.get('max') || ''} onBlur={(e) => set('max', e.target.value)} aria-label="Maximum price" />
            </div>
          </fieldset>
          <label className="check"><input type="checkbox" checked={sp.get('inStock') === '1'} onChange={(e) => set('inStock', e.target.checked ? '1' : '')} /><span>In stock only</span></label>
          {active && <button className="link" onClick={clear}>Clear all filters</button>}
        </aside>
        <section>
          <div className="row between">
            <p className="muted">{loading ? 'Loading…' : `${data.total} piece${data.total === 1 ? '' : 's'}`}</p>
            <select value={sp.get('sort') || 'new'} onChange={(e) => set('sort', e.target.value)} aria-label="Sort by">
              <option value="new">Newest</option><option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option><option value="rating">Top rated</option>
            </select>
          </div>
          {!loading && data.items.length === 0 ? (
            <div className="empty"><p>Nothing matches those filters.</p><button className="btn" onClick={clear}>Clear filters</button></div>
          ) : (
            <div className="grid three">{data.items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          )}
          {page < data.pages && <div className="center"><button className="btn ghost" onClick={more}>Show more</button></div>}
        </section>
      </div>
    </div>
  );
}
