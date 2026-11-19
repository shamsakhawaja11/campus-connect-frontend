import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { DEPTS, Err, ISSUES } from '../ui.jsx';

export default function NewComplaint() {
  const nav = useNavigate();
  const [f, setF] = useState({ title: '', description: '', category: 'CAFETERIA', issueType: ISSUES.CAFETERIA[0], priority: 'MEDIUM' });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  // Changing the category resets the issue type to that category's first option
  const setCategory = (e) => setF({ ...f, category: e.target.value, issueType: ISSUES[e.target.value][0] });

  const pickFile = (e) => {
    const x = e.target.files[0];
    if (x && x.size > 2 * 1024 * 1024) { setErr('Image must be under 2 MB'); e.target.value = ''; return; }
    setErr(''); setFile(x || null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => form.append(k, v));
    if (file) form.append('image', file); // field name must be "image"
    try {
      const c = await api.createComplaint(form);
      nav(`/complaints/${c.id}`);
    } catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Submit a complaint</h1>
      <Err msg={err} />
      <label>Title<input required minLength={3} value={f.title} onChange={set('title')} /></label>
      <div className="grid2">
        <label>Category (decides the department)
          <select value={f.category} onChange={setCategory}>
            {Object.entries(DEPTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Priority
          <select value={f.priority} onChange={set('priority')}>
            <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
          </select>
        </label>
      </div>
      <label>Issue type
        <select value={f.issueType} onChange={set('issueType')}>
          {ISSUES[f.category].map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </label>
      <label>Description<textarea required minLength={10} rows={5} value={f.description} onChange={set('description')} /></label>
      <label>Photo (optional, JPEG/PNG/WebP, max 2 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} />
      </label>
      <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Submit complaint'}</button>
    </form>
  );
}
