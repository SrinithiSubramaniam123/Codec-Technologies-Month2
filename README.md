# Personal Portfolio with Blog & CMS (Topic 8)

React 18 + Vite + React Router. No backend or database: content is saved in the browser (`localStorage`), uploaded images/videos in IndexedDB.

## Features
- **Portfolio showcase** – hero, about, featured projects (with screenshot or demo video), projects page.
- **Blog** – posts with tags, search, tag filter, reading time, cover image, share links, draft/published status.
- **Contact form** – validation, honeypot spam trap, messages land in the admin inbox (plus a mailto fallback).
- **Admin CMS** (`/admin`) – create/edit/delete posts and projects, inbox, profile & site settings, change password.
- **Image/video uploads** – cover images, project media, avatar, and inline media inside blog posts (max 60 MB each).
- **SEO** – per-page title/description, Open Graph & Twitter tags, canonical URLs, JSON-LD (`Person`, `BlogPosting`), `robots.txt`, sitemap export (Admin → Settings), noindex for admin.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```
Admin demo password: `admin123` (change it in Settings).

## Important limitations (read before deploying)
- Data is stored **per browser**: content you write on your laptop is not visible to visitors. To publish for the public you need to swap `src/store.jsx` and `src/media.js` for a real backend (e.g. Supabase, Firebase, Node + database + S3/Cloudinary).
- The admin login is client-side only and is **not real security**; it is a demo gate until a backend handles auth.
- Meta tags are set in the browser, so crawlers that do not run JavaScript will not see them. For production SEO use pre-rendering/SSR (e.g. Next.js) once content is on a server.
- Host must serve `index.html` for all routes (SPA fallback).
