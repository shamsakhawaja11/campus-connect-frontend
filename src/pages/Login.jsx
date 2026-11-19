import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Err } from '../ui.jsx';

export default function Login() {
  const { startSession } = useAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { startSession(await api.login(f)); } catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <div className="auth">
      <form className="card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to track or manage complaints.</p>
        <Err msg={err} />
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required value={f.password} onChange={set('password')} /></label>
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="muted">New student? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
