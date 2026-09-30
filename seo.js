import { useEffect } from 'react'

const setMeta = (attr, key, content) => {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

// Sets title, description, Open Graph/Twitter tags, canonical URL and optional JSON-LD per page.
export function useSEO({ title, description, image, path = '/', type = 'website', siteUrl = '', jsonLd, noindex = false }) {
  useEffect(() => {
    document.title = title
    const url = (siteUrl || window.location.origin).replace(/\/$/, '') + path
    const img = image && /^https?:/.test(image) ? image : ''
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('name', 'twitter:card', img ? 'summary_large_image' : 'summary')
    setMeta('name', 'twitter:title', title)
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = url
    let ld = document.getElementById('ld-json')
    if (jsonLd) {
      if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.type = 'application/ld+json'; document.head.appendChild(ld) }
      ld.textContent = JSON.stringify(jsonLd)
    } else ld?.remove()
  }, [title, description, image, path, type, siteUrl, noindex, JSON.stringify(jsonLd)])
}

export const buildSitemap = (siteUrl, posts) => {
  const base = siteUrl.replace(/\/$/, '')
  const urls = ['/', '/projects', '/blog', '/contact', ...posts.filter((p) => p.status === 'published').map((p) => `/blog/${p.slug}`)]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`
}
