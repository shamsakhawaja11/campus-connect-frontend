import { useNavigate } from 'react-router-dom';

export const DEPTS = { CAFETERIA: 'Cafeteria', LIBRARY: 'Library', LAB_IT: 'Lab / IT', ACADEMIC: 'Academic' };
// Predefined issue types per category (from the problem statement; same strings as the backend seed)
export const ISSUES = {
  CAFETERIA: ['Poor food quality or hygiene', 'High food prices', 'Limited food variety', 'Unprofessional staff behaviour or poor service'],
  LIBRARY: ['Insufficient or outdated books and learning resources', 'Librarian availability or staff behaviour', 'Library opening and closing hours', 'Insufficient seating or study space'],
  LAB_IT: ['Non-functional computers', 'Internet connectivity issues', 'Projector or multimedia equipment problems', 'Missing or unavailable software'],
  ACADEMIC: ['Teachers arriving late to lectures', 'Unavailability of lecture notes or learning materials', 'Inadequate explanation of course topics', 'Classroom management or discipline issues'],
};
export const STATUS = { PENDING: 'Pending', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved', REJECTED: 'Rejected' };

export const Badge = ({ kind, children }) => <span className={`badge b-${kind}`}>{children}</span>;
export const StatusBadge = ({ s }) => <Badge kind={s}>{STATUS[s] || s}</Badge>;
export const PriorityBadge = ({ p }) => <Badge kind={p}>{p}</Badge>;
export const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');
export const Err = ({ msg }) => (msg ? <div className="alert">{msg}</div> : null);

export function ComplaintTable({ rows, admin }) {
  const nav = useNavigate();
  if (!rows.length) return <div className="empty">No complaints found.</div>;
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticket</th><th>Title</th>{admin && <th>Student</th>}<th>Dept</th>
            <th>Priority</th><th>Status</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} onClick={() => nav(`/complaints/${c.id}`)} className="row">
              <td>{c.ticketNumber}</td>
              <td>{c.title}{c.isOverdue && <span className="overdue"> overdue</span>}</td>
              {admin && <td>{c.student?.name}</td>}
              <td>{DEPTS[c.department]}</td>
              <td><PriorityBadge p={c.priority} /></td>
              <td><StatusBadge s={c.status} /></td>
              <td>{fmt(c.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
