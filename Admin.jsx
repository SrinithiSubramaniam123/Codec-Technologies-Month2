import { useState } from 'react'
import { useStore, slugify, uid } from '../store.jsx'
import { Uploader } from '../components/Media.jsx'
import { saveMedia, deleteMedia } from '../media.js'
import { buildSitemap, useSEO } from '../seo.js'

const AUTH = 'pfcms-auth'
const csv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)

function PostEditor({ post, onDone }) {
  const { upsert, posts } = useStore()
  const [p, setP] = useState(post)
  const [tags, setTags] = useState(post.tags.join(', '))
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value })
  const insert = async (e) => {
    const f = e.target.files[0]; e.target.value = ''
    if (!f) return
    const ref = await saveMedia(f)
    setP((x) => ({ ...x, body: `${x.body}\n\n![${f.name}](${ref})\n\n` }))
  }
  const save = (e) => {
    e.preventDefault()
    let slug = slugify(p.slug || p.title)
    if (posts.some((x) => x.slug === slug && x.id !== p.id)) slug += '-' + uid().slice(-3)
    upsert('posts', { ...p, slug, tags: csv(tags) }); onDone()
  }
  return (
    <form onSubmit={save} className="panel">
      <label>Title<input required value={p.title} onChange={set('title')} /></label>
      <label>URL slug<input value={p.slug} onChange={set('slug')} placeholder="auto from title" /></label>
      <label>Excerpt (used for SEO description)<input maxLength={160} value={p.excerpt} onChange={set('excerpt')} /></label>
      <label>Tags (comma separated)<input value={tags} onChange={(e) => setTags(e.target.value)} /></label>
      <label>Cover</label><Uploader value={p.cover} onChange={(cover) => setP({ ...p, cover })} label="Upload cover" />
      <label>Body (Markdown: ## heading, **bold**, - list, [link](url), ![alt](url))<textarea required rows={14} value={p.body} onChange={set('body')} /></label>
      <label className="btn ghost inline">Insert image/video into body<input type="file" accept="image/*,video/*" onChange={insert} hidden /></label>
      <label>Status<select value={p.status} onChange={set('status')}><option value="draft">Draft</option><option value="published">Published</option></select></label>
      <div className="row"><button className="btn">Save post</button><button type="button" className="btn ghost" onClick={onDone}>Cancel</button></div>
    </form>
  )
}

function ProjectEditor({ project, onDone }) {
  const { upsert } = useStore()
  const [p, setP] = useState(project), [tags, setTags] = useState(project.tags.join(', '))
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value })
  return (
    <form onSubmit={(e) => { e.preventDefault(); upsert('projects', { ...p, tags: csv(tags) }); onDone() }} className="panel">
      <label>Title<input required value={p.title} onChange={set('title')} /></label>
      <label>Description<textarea rows={4} value={p.description} onChange={set('description')} /></label>
      <label>Tags<input value={tags} onChange={(e) => setTags(e.target.value)} /></label>
      <label>Link<input type="url" value={p.link} onChange={set('link')} placeholder="https://…" /></label>
      <label>Screenshot or demo video</label><Uploader value={p.media} onChange={(media) => setP({ ...p, media })} />
      <div className="row"><button className="btn">Save project</button><button type="button" className="btn ghost" onClick={onDone}>Cancel</button></div>
    </form>
  )
}

function Settings() {
  const { profile, password, posts, patch, reset } = useStore()
  const [pr, setPr] = useState(profile), [pw, setPw] = useState('')
  const set = (k) => (e) => setPr({ ...pr, [k]: e.target.value })
  const exportSitemap = () => {
    if (!pr.siteUrl) return alert('Set your Site URL first (e.g. https://yourname.com).')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([buildSitemap(pr.siteUrl, posts)], { type: 'application/xml' }))
    a.download = 'sitemap.xml'; a.click()
  }
  return (
    <form className="panel" onSubmit={(e) => { e.preventDefault(); patch({ profile: pr, ...(pw.length >= 6 ? { password: pw } : {}) }); setPw(''); alert('Saved') }}>
      {['name', 'role', 'tagline', 'email', 'github', 'linkedin', 'siteUrl'].map((k) => <label key={k}>{k === 'siteUrl' ? 'Site URL (for canonical links & sitemap)' : k}<input value={pr[k]} onChange={set(k)} /></label>)}
      <label>Bio<textarea rows={4} value={pr.bio} onChange={set('bio')} /></label>
      <label>Avatar</label><Uploader value={pr.avatar} onChange={(avatar) => setPr({ ...pr, avatar })} label="Upload avatar" />
      <label>New admin password (min 6 chars, leave blank to keep)<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
      <div className="row"><button className="btn">Save settings</button><button type="button" className="btn ghost" onClick={exportSitemap}>Export sitemap.xml</button>
        <button type="button" className="btn ghost" onClick={() => confirm('Reset ALL content to demo data?') && reset()}>Reset demo data</button></div>
    </form>
  )
}

export default function Admin() {
  const { password, posts, projects, messages, remove, upsert } = useStore()
  const [authed, setAuthed] = useState(sessionStorage.getItem(AUTH) === '1')
  const [pw, setPw] = useState(''), [bad, setBad] = useState(false)
  const [tab, setTab] = useState('posts'), [edit, setEdit] = useState(null)
  useSEO({ title: 'Admin', description: 'Admin', path: '/admin', noindex: true })
  if (!authed) return (
    <section className="narrow"><h1>Admin login</h1>
      <form onSubmit={(e) => { e.preventDefault(); if (pw === password) { sessionStorage.setItem(AUTH, '1'); setAuthed(true) } else setBad(true) }}>
        <label>Password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
        {bad && <em>Wrong password</em>}<button className="btn">Log in</button>
        <p className="hint">Demo default password: <code>admin123</code></p>
      </form></section>)
  const del = async (col, item, refs) => { if (confirm('Delete this item?')) { for (const r of refs) await deleteMedia(r); remove(col, item.id) } }
  const newPost = { id: uid(), slug: '', title: '', excerpt: '', body: '', tags: [], cover: '', status: 'draft', date: new Date().toISOString() }
  const newProject = { id: uid(), title: '', description: '', tags: [], link: '', media: '' }
  const unread = messages.filter((m) => !m.read).length
  return (
    <section><div className="between"><h1>Admin CMS</h1><button className="btn ghost" onClick={() => { sessionStorage.removeItem(AUTH); setAuthed(false) }}>Log out</button></div>
      <div className="tabs">{[['posts', 'Posts'], ['projects', 'Projects'], ['messages', `Messages${unread ? ` (${unread})` : ''}`], ['settings', 'Settings']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setEdit(null) }}>{l}</button>)}</div>
      {tab === 'posts' && (edit ? <PostEditor post={edit} onDone={() => setEdit(null)} /> : <>
        <button className="btn" onClick={() => setEdit(newPost)}>+ New post</button>
        <ul className="list">{posts.map((p) => <li key={p.id}><div><strong>{p.title}</strong> <span className={`pill ${p.status}`}>{p.status}</span><br /><small>/blog/{p.slug}</small></div>
          <div className="row"><button className="btn ghost" onClick={() => setEdit(p)}>Edit</button><button className="btn ghost" onClick={() => del('posts', p, [p.cover])}>Delete</button></div></li>)}</ul></>)}
      {tab === 'projects' && (edit ? <ProjectEditor project={edit} onDone={() => setEdit(null)} /> : <>
        <button className="btn" onClick={() => setEdit(newProject)}>+ New project</button>
        <ul className="list">{projects.map((p) => <li key={p.id}><strong>{p.title}</strong>
          <div className="row"><button className="btn ghost" onClick={() => setEdit(p)}>Edit</button><button className="btn ghost" onClick={() => del('projects', p, [p.media])}>Delete</button></div></li>)}</ul></>)}
      {tab === 'messages' && <ul className="list">{messages.map((m) => <li key={m.id} className={m.read ? '' : 'unread'}><div><strong>{m.name}</strong> · <a href={`mailto:${m.email}`}>{m.email}</a> · <small>{new Date(m.date).toLocaleString()}</small><p>{m.message}</p></div>
        <div className="row">{!m.read && <button className="btn ghost" onClick={() => upsert('messages', { ...m, read: true })}>Mark read</button>}<button className="btn ghost" onClick={() => remove('messages', m.id)}>Delete</button></div></li>)}{!messages.length && <p>No messages yet.</p>}</ul>}
      {tab === 'settings' && <Settings />}
    </section>
  )
}
