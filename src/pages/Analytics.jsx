import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { DEPTS, Err } from '../ui.jsx';

const Stat = ({ label, value, tone }) => (
  <div className={`card stat ${tone || ''}`}><div className="muted">{label}</div><div className="num">{value ?? '—'}</div></div>
);

const Bars = ({ items, label, value }) => {
  const max = Math.max(1, ...items.map(value));
  return items.map((it, i) => (
    <div className="bar" key={i}>
      <span>{label(it)}</span>
      <div><i style={{ width: `${(value(it) / max) * 100}%` }} /></div>
      <b>{value(it)}</b>
    </div>
  ));
};

export default function Analytics() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.summary().then(setD).catch((e) => setErr(e.message)); }, []);
  if (!d) return err ? <Err msg={err} /> : <p className="muted">Loading…</p>;
  const t = d.totals;
  const max = Math.max(1, ...d.trend.map((x) => x.count));

  return (
    <>
      <h1>Analytics</h1>
      <div className="stats">
        <Stat label="Total" value={t.total} />
        <Stat label="Pending" value={t.pending} />
        <Stat label="In progress" value={t.inProgress} />
        <Stat label="Resolved" value={t.resolved} />
        <Stat label="Rejected" value={t.rejected} />
        <Stat label="Overdue" value={t.overdue} tone="warn" />
        <Stat label="Avg resolution (h)" value={t.avgResolutionHours} />
        <Stat label="Avg rating" value={t.avgRating} />
      </div>

      <div className="cols2">
        <div className="card">
          <h3>Complaints per day (14 days)</h3>
          <div className="trend">
            {d.trend.map((x) => (
              <div key={x.date} title={`${x.date}: ${x.count}`}>
                <i style={{ height: `${(x.count / max) * 100}%` }} />
                <small>{x.date.slice(8)}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Top issues</h3>
          {d.topIssues.length ? <Bars items={d.topIssues} label={(x) => x.issueType} value={(x) => x.count} /> : <p className="muted">No data yet.</p>}
        </div>
      </div>

      <div className="card table-wrap">
        <h3>By department</h3>
        <table>
          <thead><tr><th>Department</th><th>Total</th><th>Pending</th><th>In progress</th><th>Resolved</th><th>Rejected</th><th>Avg hours</th><th>Avg rating</th></tr></thead>
          <tbody>
            {d.byDepartment.map((r) => (
              <tr key={r.department}>
                <td>{DEPTS[r.department]}</td><td>{r.total}</td><td>{r.pending}</td><td>{r.inProgress}</td>
                <td>{r.resolved}</td><td>{r.rejected}</td><td>{r.avgResolutionHours ?? '—'}</td>
                <td>{r.avgRating ?? '—'}{r.ratingCount ? ` (${r.ratingCount})` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
