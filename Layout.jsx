import { NavLink, Link, Outlet } from 'react-router-dom'
import { useStore } from '../store.jsx'

export default function Layout() {
  const { profile } = useStore()
  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <Link to="/" className="logo">{profile.name}</Link>
          <nav>{[['/', 'Home'], ['/projects', 'Projects'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([to, l]) => <NavLink key={to} to={to} end={to === '/'}>{l}</NavLink>)}</nav>
        </div>
      </header>
      <main className="wrap"><Outlet /></main>
      <footer className="wrap foot">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>{profile.github && <a href={profile.github} rel="noopener noreferrer">GitHub</a>} {profile.linkedin && <a href={profile.linkedin} rel="noopener noreferrer">LinkedIn</a>} <Link to="/admin">Admin</Link></span>
      </footer>
    </>
  )
}
