import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyComplaints from './pages/MyComplaints.jsx';
import NewComplaint from './pages/NewComplaint.jsx';
import AdminComplaints from './pages/AdminComplaints.jsx';
import ComplaintDetail from './pages/ComplaintDetail.jsx';
import Analytics from './pages/Analytics.jsx';
import { DEPTS } from './ui.jsx';

const home = (u) => (u.role === 'STUDENT' ? '/my' : '/admin');

// Role-based route guard (the server enforces the same rules; this is UX only)
function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={home(user)} replace />;
  return children;
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  const student = user.role === 'STUDENT';
  return (
    <>
      <header className="nav">
        <Link to={home(user)} className="brand">📣 Campus Complaints</Link>
        <nav>
          {student ? (
            <>
              <NavLink to="/my">My complaints</NavLink>
              <NavLink to="/new">New complaint</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/admin">Complaints</NavLink>
              <NavLink to="/analytics">Analytics</NavLink>
            </>
          )}
        </nav>
        <div className="who">
          <span>{user.name || user.email}
            <small> · {user.role === 'DEPT_ADMIN' ? `${DEPTS[user.department]} admin` : user.role.replace('_', ' ').toLowerCase()}</small>
          </span>
          <button className="btn ghost" onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  const wrap = (el, roles) => <Protected roles={roles}><Shell>{el}</Shell></Protected>;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home(user)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={home(user)} replace /> : <Register />} />
      <Route path="/my" element={wrap(<MyComplaints />, ['STUDENT'])} />
      <Route path="/new" element={wrap(<NewComplaint />, ['STUDENT'])} />
      <Route path="/admin" element={wrap(<AdminComplaints />, ['DEPT_ADMIN', 'SUPER_ADMIN'])} />
      <Route path="/analytics" element={wrap(<Analytics />, ['DEPT_ADMIN', 'SUPER_ADMIN'])} />
      <Route path="/complaints/:id" element={wrap(<ComplaintDetail />)} />
      <Route path="*" element={<Navigate to={user ? home(user) : '/login'} replace />} />
    </Routes>
  );
}
