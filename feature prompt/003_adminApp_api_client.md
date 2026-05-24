# adminApp — API Client, Endpoints & Hooks

## Overview
Thin axios + helper layer used by every page. Centralizes the JWT header injection, the `{success, data}` unwrap, debounced inputs, and async/mutation state.

## Files
1. **`src/api/client.js`**
   - `axios.create({ baseURL: '/api', headers: {'Content-Type':'application/json'} })`.
   - Request interceptor: read token from `localStorage('naga_admin_token')`, inject `Authorization: Bearer <token>` when present.
   - Response interceptor: on 401 → clear token + `location.href = '/login'` (unless already on it).
   - Helpers: `setToken`, `getToken`, `unwrap(res) = res.data?.data ?? res.data`.

2. **`src/api/endpoints.js`** — one object per surface area:
   ```js
   export const Auth = {
     login: (username, password) =>
       api.post('/auth/login', { username, password }).then(unwrap),
   };

   export const Admin = {
     dashboard:           ()              => api.get('/admin/dashboard').then(unwrap),
     filterOptions:       ()              => api.get('/admin/filter-options').then(unwrap),
     accounts:            (params = {})   => api.get('/admin/accounts',  { params: { role: 'resident', ...params } }).then(unwrap),
     approve:             (id)            => api.patch(`/admin/accounts/${id}/approve`).then(unwrap),
     bulkApprove:         (ids)           => api.patch('/admin/accounts/bulk-approve', { ids }).then(unwrap),
     reject:              (id)            => api.patch(`/admin/accounts/${id}/reject`).then(unwrap),
     setActive:           (id, is_active) => api.patch(`/admin/accounts/${id}/active`,   { is_active }).then(unwrap),
     resetPassword:       (id, password)  => api.patch(`/admin/accounts/${id}/password`, { password }).then(unwrap),
     residents:           (params = {})   => api.get('/admin/residents',  { params }).then(unwrap),
     residentsByBarangay: ()              => api.get('/admin/analytics/residents-by-barangay').then(unwrap),
     sos:                 (params = {})   => api.get('/admin/sos',        { params }).then(unwrap),
   };
   ```

3. **`src/hooks/useAsync.js`** — fetch on dep-change; race-safe via a `reqIdRef` counter; returns `{ data, error, loading, reload, setData }`.

4. **`src/hooks/useMutation.js`** — wraps an async fn with `{ run, busy, error }` for click handlers.

5. **`src/hooks/useDebounced.js`** — `useDebounced(value, ms = 300)`; used by search inputs.

## Vite proxy
`vite.config.js` proxies `/api/*` → `http://localhost:5000` in dev. In production, build a same-origin deployment or set the API base URL via an env var.

## Acceptance criteria
- A failing request never reaches the page if it's a 401 — interceptor handles redirect.
- Every page uses `useAsync` for reads and `useMutation` for writes — no raw `useState + useEffect + axios`.
- The `unwrap` helper handles both wrapped (`{success, data}`) and bare responses.
