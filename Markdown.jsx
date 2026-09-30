import { Media } from './Media.jsx'

function inline(t) {
  const out = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0, m, i = 0
  while ((m = re.exec(t))) {
    if (m.index > last) out.push(t.slice(last, m.index))
    const s = m[0]
    if (s.startsWith('**')) out.push(<strong key={i++}>{s.slice(2, -2)}</strong>)
    else if (s[0] === '*') out.push(<em key={i++}>{s.slice(1, -1)}</em>)
    else if (s[0] === '`') out.push(<code key={i++}>{s.slice(1, -1)}</code>)
    else {
      const [, txt, url] = /\[([^\]]+)\]\(([^)]+)\)/.exec(s)
      out.push(/^(https?:|mailto:|\/)/.test(url) ? <a key={i++} href={url} rel="noopener noreferrer">{txt}</a> : txt)
    }
    last = re.lastIndex
  }
  if (last < t.length) out.push(t.slice(last))
  return out
}

// Minimal, XSS-safe markdown: #/##/### headings, lists, code blocks, **bold**, *italic*, `code`, [links](url), ![alt](idb:image:id | url)
export default function Markdown({ text = '' }) {
  return text.split(/\n{2,}/).map((raw, i) => {
    const b = raw.trim()
    let m
    if (!b) return null
    if ((m = /^(#{1,3}) (.*)/.exec(b))) { const H = `h${m[1].length + 1}`; return <H key={i}>{inline(m[2])}</H> }
    if ((m = /^!\[([^\]]*)\]\((.+)\)$/.exec(b))) return <Media key={i} src={m[2]} alt={m[1]} className="inline-media" />
    if (b.startsWith('```')) return <pre key={i}><code>{b.replace(/^```.*\n?/, '').replace(/```$/, '')}</code></pre>
    if (/^[-*] /.test(b)) return <ul key={i}>{b.split('\n').map((l, j) => <li key={j}>{inline(l.replace(/^[-*] /, ''))}</li>)}</ul>
    return <p key={i}>{inline(b)}</p>
  })
}
