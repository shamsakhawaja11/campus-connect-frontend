import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ComplaintTable, DEPTS, Err, STATUS } from '../ui.jsx';

export default function AdminComplaints() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ status: '', department: '', priority: '', overdue: '', sort: 'priority', search: '' });
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.type === 'checkbox' ? (e.target.checked ? 'true' : '') : e.target.value });

  useEffect(() => {
    setErr('');
    const t = setTimeout(() => api.allComplaints(filters).then(setRows).catch((e) => setErr(e.message)), 250); // debounce search
    return () => clearTimeout(t);
  }, [filters]);

  return (
    <>
      <div className="head"><h1>Complaints</h1></div>
      <div className="filters card">
        <input placeholder="Search title or description…" value={filters.search} onChange={set('search')} />
        <select value={filters.status} onChange={set('status')}>
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {user.role === 'SUPER_ADMIN' && (
          <select value={filters.department} onChange={set('department')}>
            <option value="">All departments</option>
            {Object.entries(DEPTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
        <select value={filters.priority} onChange={set('priority')}>
          <option value="">Any priority</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
        </select>
        <select value={filters.sort} onChange={set('sort')}>
          <option value="priority">Sort: priority</option><option value="newest">Sort: newest</option>
        </select>
        <label className="check"><input type="checkbox" checked={filters.overdue === 'true'} onChange={set('overdue')} /> Overdue only</label>
      </div>
      <Err msg={err} />
      {rows ? <ComplaintTable rows={rows} admin /> : !err && <p className="muted">Loading…</p>}
    </>
  );
}
