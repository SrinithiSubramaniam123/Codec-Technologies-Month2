import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'pfcms-data-v1'
const now = () => new Date().toISOString()
export const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled'
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

const seed = {
  password: 'admin123',
  profile: { name: 'Alex Morgan', role: 'Full-Stack Developer', tagline: 'I design and build fast, accessible web apps.', bio: 'I am a developer who loves clean interfaces and dependable back-ends. Edit this text from Admin → Settings.', email: 'hello@example.com', github: '', linkedin: '', siteUrl: '', avatar: '' },
  posts: [
    { id: 'p1', slug: 'welcome-to-my-blog', title: 'Welcome to my blog', excerpt: 'Why I started writing, and what to expect.', tags: ['general'], status: 'published', cover: '', date: now(),
      body: '## Hello!\n\nThis blog is powered by the **built-in CMS**. Log in at /admin to write, edit, and publish posts.\n\n- Markdown-style formatting\n- Image and video uploads\n- Draft / published status\n\nHappy reading.' },
  ],
  projects: [
    { id: 'j1', title: 'Sample Project', description: 'A showcase project. Add screenshots or a demo video from the Admin panel.', tags: ['React', 'Node'], link: '', media: '' },
  ],
  messages: [],
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export default function StoreProvider({ children }) {
  const [data, setData] = useState(() => { try { return { ...seed, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return seed } })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { alert('Storage full — remove some content.') } }, [data])
  const upsert = (col, item) => setData((d) => ({ ...d, [col]: d[col].some((x) => x.id === item.id) ? d[col].map((x) => (x.id === item.id ? item : x)) : [item, ...d[col]] }))
  const remove = (col, id) => setData((d) => ({ ...d, [col]: d[col].filter((x) => x.id !== id) }))
  const patch = (obj) => setData((d) => ({ ...d, ...obj }))
  const reset = () => setData(seed)
  return <Ctx.Provider value={{ ...data, upsert, remove, patch, reset }}>{children}</Ctx.Provider>
}
