const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) =>
  t ? localStorage.setItem('token', t) : localStorage.removeItem('token');

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

// One place attaches the token and handles errors, so pages never do.
async function request(path, { method = 'GET', body, form, blob } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form; // browser sets multipart boundary itself
  else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  if (res.status === 401 && !path.startsWith('/auth/')) onUnauthorized();
  if (!res.ok) {
    let msg = res.statusText || 'Request failed';
    try {
      const j = await res.json();
      msg = Array.isArray(j.message) ? j.message.join(', ') : j.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return blob ? res.blob() : res.json();
}

const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o || {}).forEach(([k, v]) => v && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  me: () => request('/auth/me'),
  myComplaints: () => request('/complaints/my'),
  allComplaints: (filters) => request('/complaints' + qs(filters)),
  complaint: (id) => request(`/complaints/${id}`),
  createComplaint: (form) => request('/complaints', { method: 'POST', form }),
  image: (id) => request(`/complaints/${id}/image`, { blob: true }),
  updateStatus: (id, body) => request(`/complaints/${id}/status`, { method: 'PATCH', body }),
  addResponse: (id, body) => request(`/complaints/${id}/responses`, { method: 'POST', body }),
  rate: (id, rating) => request(`/complaints/${id}/rating`, { method: 'POST', body: { rating } }),
  summary: () => request('/analytics/summary'),
};
