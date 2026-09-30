import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/Auth.jsx';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      mode === 'login' ? await login(f.email, f.password) : await register(f.name, f.email, f.password);
      nav(sp.get('next') || '/shop');
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="page narrow">
      <h1>{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
      <form onSubmit={submit} className="form">
        {mode === 'register' && <label>Full name<input required value={f.name} onChange={on('name')} autoComplete="name" /></label>}
        <label>Email<input required type="email" value={f.email} onChange={on('email')} autoComplete="email" /></label>
        <label>Password<input required type="password" minLength={6} value={f.password} onChange={on('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn block" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="muted">
        {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
        <button className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
          {mode === 'login' ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
