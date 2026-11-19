# Campus Complaints – React frontend

Frontend for the NestJS complaint-management backend (roles: STUDENT, DEPT_ADMIN, SUPER_ADMIN).

```bash
npm install
cp .env.example .env     # VITE_API_URL = your backend URL
npm run dev              # http://localhost:3001  (matches backend CORS_ORIGIN)
```

Deploying the backend elsewhere? Add this frontend's URL to the backend `CORS_ORIGIN` (comma-separated).

| Role | Pages |
|---|---|
| Student | register/login, my complaints, submit (with photo), detail, rate resolved |
| Dept admin | filtered complaint list, update status / reply, analytics (own dept) |
| Super admin | all departments (read), analytics (all) |

Admin accounts must be created in the database (registration always creates STUDENTs).
