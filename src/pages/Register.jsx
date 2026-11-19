import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Err } from '../ui.jsx';

export default function Register() {
  const { startSession } = useAuth();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    setBusy(true); setErr('');
    try {
      startSession(await api.register({ name: f.name, email: f.email, password: f.password }));
    } catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <div className="auth">
      <form className="card" onSubmit={submit}>
        <h1>Create account</h1>
        <Err msg={err} />
        <label>Full name<input required minLength={2} value={f.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={6} value={f.password} onChange={set('password')} /></label>
        <label>Confirm password<input type="password" required value={f.confirm} onChange={set('confirm')} /></label>
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
        <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
