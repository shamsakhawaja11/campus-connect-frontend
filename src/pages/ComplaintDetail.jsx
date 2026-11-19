import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { DEPTS, Err, PriorityBadge, StatusBadge, fmt } from '../ui.jsx';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [img, setImg] = useState(null);
  const [err, setErr] = useState('');
  const [status, setStatus] = useState('IN_PROGRESS');
  const [msg, setMsg] = useState('');

  const run = async (fn) => {
    setErr('');
    try { setC(await fn()); setMsg(''); } catch (e) { setErr(e.message); }
  };

  useEffect(() => { api.complaint(id).then(setC).catch((e) => setErr(e.message)); }, [id]);

  // Image endpoint needs the auth header, so fetch as a blob instead of <img src>
  useEffect(() => {
    if (!c?.imageUrl) return;
    let url;
    api.image(id).then((b) => setImg((url = URL.createObjectURL(b)))).catch(() => {});
    return () => url && URL.revokeObjectURL(url);
  }, [id, c?.imageUrl]);

  if (!c) return err ? <Err msg={err} /> : <p className="muted">Loading…</p>;

  const open = c.status === 'PENDING' || c.status === 'IN_PROGRESS';
  const isDeptAdmin = user.role === 'DEPT_ADMIN';
  const canRate = user.role === 'STUDENT' && c.status === 'RESOLVED' && !c.satisfactionRating;

  return (
    <>
      <p className="muted">{c.ticketNumber} · {DEPTS[c.department]} · {c.issueType}</p>
      <div className="head"><h1>{c.title}</h1><div><StatusBadge s={c.status} /> <PriorityBadge p={c.priority} /></div></div>
      <Err msg={err} />
      <div className="cols">
        <div>
          <div className="card">
            <p className="pre">{c.description}</p>
            {img && <img className="attach" src={img} alt="Attachment" />}
            <p className="muted">
              {c.student && <>Submitted by {c.student.name} ({c.student.email}) · </>}
              {fmt(c.createdAt)}{c.isOverdue && <span className="overdue"> · overdue (&gt;48h open)</span>}
            </p>
          </div>

          <h2>Responses</h2>
          {c.responses.length === 0 && <div className="empty">No responses yet.</div>}
          {c.responses.map((r) => (
            <div className="card resp" key={r.id}>
              <strong>{r.admin.name}</strong> <small className="muted">{fmt(r.createdAt)}</small>
              <p className="pre">{r.message}</p>
            </div>
          ))}

          {isDeptAdmin && open && (
            <div className="card">
              <h3>Update this complaint</h3>
              <div className="grid2">
                <label>New status
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected (reason required)</option>
                  </select>
                </label>
              </div>
              <label>Message to student<textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
              <div className="row-gap">
                <button className="btn" onClick={() => run(() => api.updateStatus(id, { status, message: msg || undefined }))}>Update status</button>
                <button className="btn ghost" disabled={!msg.trim()} onClick={() => run(() => api.addResponse(id, { message: msg }))}>Reply only</button>
              </div>
            </div>
          )}

          {canRate && <Rate onRate={(r) => run(() => api.rate(id, r))} />}
          {c.satisfactionRating && <p className="muted">Satisfaction rating: {'★'.repeat(c.satisfactionRating)}{'☆'.repeat(5 - c.satisfactionRating)}</p>}
        </div>

        <aside>
          <h2>History</h2>
          <ol className="timeline">
            {c.history.map((h) => (
              <li key={h.id}>
                <strong>{h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}</strong>
                <div className="muted">{h.changedBy.name} · {fmt(h.createdAt)}</div>
                {h.note && <div>{h.note}</div>}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}

function Rate({ onRate }) {
  const [n, setN] = useState(0);
  return (
    <div className="card">
      <h3>How satisfied are you with the resolution?</h3>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} className={i <= n ? 'on' : ''} onClick={() => setN(i)} aria-label={`${i} stars`}>★</button>
        ))}
      </div>
      <button className="btn" disabled={!n} onClick={() => onRate(n)}>Submit rating</button>
    </div>
  );
}
