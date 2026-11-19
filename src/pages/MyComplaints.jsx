import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { ComplaintTable, Err } from '../ui.jsx';

export default function MyComplaints() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.myComplaints().then(setRows).catch((e) => setErr(e.message)); }, []);
  return (
    <>
      <div className="head"><h1>My complaints</h1><Link className="btn" to="/new">+ New complaint</Link></div>
      <Err msg={err} />
      {rows ? <ComplaintTable rows={rows} /> : !err && <p className="muted">Loading…</p>}
    </>
  );
}
