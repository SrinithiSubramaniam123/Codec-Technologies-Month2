import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useSEO } from '../seo.js'
import { Media } from '../components/Media.jsx'
import Markdown from '../components/Markdown.jsx'

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
const published = (posts) => posts.filter((p) => p.status === 'published').sort((a, b) => b.date.localeCompare(a.date))
const Tags = ({ tags = [] }) => <div className="tags">{tags.map((t) => <span key={t}>{t}</span>)}</div>

function ProjectCard({ p }) {
  return (
    <article className="card">
      {p.media ? <Media src={p.media} alt={p.title} className="card-media" /> : <div className="card-media ph" />}
      <div className="card-body"><h3>{p.title}</h3><p>{p.description}</p><Tags tags={p.tags} />{p.link && <a href={p.link} rel="noopener noreferrer" target="_blank">View project →</a>}</div>
    </article>
  )
}
function PostCard({ p }) {
  return (
    <article className="card">
      {p.cover ? <Media src={p.cover} alt="" className="card-media" /> : <div className="card-media ph" />}
      <div className="card-body"><small>{fmt(p.date)}</small><h3><Link to={`/blog/${p.slug}`}>{p.title}</Link></h3><p>{p.excerpt}</p><Tags tags={p.tags} /></div>
    </article>
  )
}

export function Home() {
  const { profile, projects, posts } = useStore()
  useSEO({ title: `${profile.name} — ${profile.role}`, description: profile.tagline, siteUrl: profile.siteUrl, path: '/',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Person', name: profile.name, jobTitle: profile.role, url: profile.siteUrl || undefined, email: profile.email, sameAs: [profile.github, profile.linkedin].filter(Boolean) } })
  return (
    <>
      <section className="hero">
        {profile.avatar && <Media src={profile.avatar} alt={profile.name} className="avatar" />}
        <div><p className="eyebrow">{profile.role}</p><h1>{profile.name}</h1><p className="lead">{profile.tagline}</p>
          <div className="row"><Link className="btn" to="/projects">See my work</Link><Link className="btn ghost" to="/contact">Get in touch</Link></div></div>
      </section>
      <section><h2>About</h2><p className="lead-sm">{profile.bio}</p></section>
      <section><div className="between"><h2>Featured projects</h2><Link to="/projects">All projects →</Link></div><div className="grid">{projects.slice(0, 3).map((p) => <ProjectCard key={p.id} p={p} />)}</div></section>
      <section><div className="between"><h2>Latest posts</h2><Link to="/blog">All posts →</Link></div><div className="grid">{published(posts).slice(0, 3).map((p) => <PostCard key={p.id} p={p} />)}</div></section>
    </>
  )
}

export function Projects() {
  const { profile, projects } = useStore()
  useSEO({ title: `Projects — ${profile.name}`, description: `Portfolio of ${profile.name}: selected projects and case studies.`, siteUrl: profile.siteUrl, path: '/projects' })
  return <section><h1>Projects</h1><div className="grid">{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div>{!projects.length && <p>No projects yet.</p>}</section>
}

export function Blog() {
  const { profile, posts } = useStore()
  const [q, setQ] = useState(''), [tag, setTag] = useState('')
  useSEO({ title: `Blog — ${profile.name}`, description: `Articles by ${profile.name}.`, siteUrl: profile.siteUrl, path: '/blog' })
  const list = published(posts)
  const tags = [...new Set(list.flatMap((p) => p.tags))]
  const shown = list.filter((p) => (!tag || p.tags.includes(tag)) && (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase()))
  return (
    <section><h1>Blog</h1>
      <div className="row"><input placeholder="Search posts…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={tag} onChange={(e) => setTag(e.target.value)}><option value="">All tags</option>{tags.map((t) => <option key={t}>{t}</option>)}</select></div>
      <div className="grid">{shown.map((p) => <PostCard key={p.id} p={p} />)}</div>{!shown.length && <p>No posts found.</p>}
    </section>
  )
}

export function Post() {
  const { slug } = useParams()
  const { profile, posts } = useStore()
  const p = posts.find((x) => x.slug === slug && x.status === 'published')
  useSEO({ title: p ? `${p.title} — ${profile.name}` : 'Post not found', description: p?.excerpt || '', image: p?.cover, siteUrl: profile.siteUrl, path: `/blog/${slug}`, type: 'article',
    jsonLd: p && { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt, datePublished: p.date, author: { '@type': 'Person', name: profile.name }, keywords: p.tags.join(', ') } })
  if (!p) return <NotFound />
  const mins = Math.max(1, Math.round(p.body.split(/\s+/).length / 200))
  const url = encodeURIComponent(window.location.href)
  return (
    <article className="post">
      <small>{fmt(p.date)} · {mins} min read</small><h1>{p.title}</h1><Tags tags={p.tags} />
      {p.cover && <Media src={p.cover} alt={p.title} className="cover" />}
      <Markdown text={p.body} />
      <div className="row"><a className="btn ghost" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(p.title)}`}>Share on X</a>
        <a className="btn ghost" target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}>Share on LinkedIn</a></div>
      <p><Link to="/blog">← Back to blog</Link></p>
    </article>
  )
}

export function Contact() {
  const { profile, upsert } = useStore()
  const [f, setF] = useState({ name: '', email: '', message: '', website: '' })
  const [err, setErr] = useState({}), [sent, setSent] = useState(false)
  useSEO({ title: `Contact — ${profile.name}`, description: `Get in touch with ${profile.name}.`, siteUrl: profile.siteUrl, path: '/contact' })
  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (f.name.trim().length < 2) er.name = 'Please enter your name'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Enter a valid email'
    if (f.message.trim().length < 10) er.message = 'Message must be at least 10 characters'
    setErr(er)
    if (Object.keys(er).length) return
    if (!f.website) upsert('messages', { id: Date.now().toString(36), name: f.name.trim(), email: f.email.trim(), message: f.message.trim(), date: new Date().toISOString(), read: false }) // honeypot: bots fill "website"
    setSent(true); setF({ name: '', email: '', message: '', website: '' })
  }
  const on = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) })
  return (
    <section className="narrow"><h1>Contact</h1>
      {sent ? <p className="ok">Thanks! Your message was sent.</p> : (
        <form onSubmit={submit} noValidate>
          <label>Name<input {...on('name')} />{err.name && <em>{err.name}</em>}</label>
          <label>Email<input type="email" {...on('email')} />{err.email && <em>{err.email}</em>}</label>
          <label>Message<textarea rows={6} {...on('message')} />{err.message && <em>{err.message}</em>}</label>
          <input {...on('website')} tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
          <button className="btn">Send message</button>
        </form>)}
      <p>Or email <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
    </section>
  )
}

export const NotFound = () => <section><h1>404</h1><p>Page not found. <Link to="/">Go home</Link></p></section>
