// Procedural pottery art so the store looks finished without external images.
const PAL = {
  Mugs: ['#1F3B63', '#5B8CC0'], Bowls: ['#8DBFAE', '#E0EFE8'], Plates: ['#C9B48A', '#F1E7D0'],
  Vases: ['#2B4C7E', '#A7C1DE'], Planters: ['#57866A', '#BBD8C4'], Coffee: ['#F2B63D', '#FCE7AE'],
};
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const SHAPES = {
  Mugs: <><path d="M58 62h84v86q0 22-22 22H80q-22 0-22-22z" /><path d="M142 84h8q22 0 22 22t-22 22h-8" fill="none" strokeWidth="11" /></>,
  Bowls: <path d="M26 88h148q0 66-74 74-74-8-74-74z" />,
  Plates: <><ellipse cx="100" cy="124" rx="80" ry="24" /><ellipse cx="100" cy="122" rx="52" ry="12" fill="#fff" opacity=".22" /></>,
  Vases: <path d="M86 34h28v30c34 16 40 44 40 72 0 26-22 38-54 38s-54-12-54-38c0-28 6-56 40-72z" />,
  Planters: <><path d="M50 78h100l-12 86H62z" /><rect x="44" y="64" width="112" height="18" rx="4" /></>,
  Coffee: <><path d="M54 52h92l-28 54H82z" /><path d="M76 114h48v40q0 18-24 18t-24-18z" /></>,
};

export default function Glaze({ name = '', category = 'Mugs', image, className = '' }) {
  if (image) return <img className={`glaze ${className}`} src={image} alt={name} loading="lazy" />;
  const h = hash(name), [a, b] = PAL[category] || PAL.Mugs, id = `g${h}`;
  const tint = `hsl(${(h % 40) + 205} 25% ${92 - (h % 4)}%)`;
  return (
    <svg className={`glaze ${className}`} viewBox="0 0 200 200" role="img" aria-label={name}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2={(h % 7) / 10 + 0.3} y2="1">
          <stop offset="0" stopColor={b} /><stop offset=".55" stopColor={a} /><stop offset="1" stopColor={a} stopOpacity=".85" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={tint} />
      <ellipse cx="100" cy="176" rx="64" ry="7" fill="#0E1A2B" opacity=".12" />
      <g fill={`url(#${id})`} stroke={`url(#${id})`} strokeLinejoin="round">{SHAPES[category] || SHAPES.Mugs}</g>
      <path d={`M${40 + (h % 30)} ${96 + (h % 12)}q30 -14 64 -2`} stroke="#fff" strokeWidth="3" fill="none" opacity=".3" strokeLinecap="round" />
    </svg>
  );
}
