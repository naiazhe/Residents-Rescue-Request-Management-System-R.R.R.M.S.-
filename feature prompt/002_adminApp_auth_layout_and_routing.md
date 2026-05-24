# adminApp — Auth Context, Route Guard, App Layout & Sidebar

## Overview
The shared scaffolding every authenticated page sits inside: an `AuthProvider` that holds the user, a `RequireAuth` HoC that wraps the layout, and an `AppLayout` with a fixed sidebar + main outlet.

## Components & files
1. **`src/auth/AuthContext.jsx`**
   - Provides `{ user, ready, error, login, logout }`.
   - On mount: hydrate user from `localStorage('naga_admin_user')` IF a token exists in `localStorage('naga_admin_token')`.
   - `login(username, password)` calls `Auth.login` and rejects any non-super-admin role.
   - `logout()` clears both localStorage keys and resets state.

2. **`src/auth/RequireAuth.jsx`**
   - Reads `user, ready` from context.
   - If `!ready` → render `null` (avoid redirect flicker on first paint).
   - If `!user || user.role !== 'super_admin'` → `<Navigate to="/login" replace state={{ from: location }} />`.

3. **`src/components/layout/AppLayout.jsx`**
   - Flex container: `<Sidebar />` + `<main><Outlet /></main>`.
   - Centered max-width content area with consistent padding.
   - Exports `PageHeader({ title, subtitle, action })` used by every page.

4. **`src/components/layout/Sidebar.jsx`**
   - Hidden on mobile (`hidden md:flex`).
   - NAV items:
     - `/` Dashboard (LayoutDashboard)
     - `/accounts` Resident Accounts (UserCog)
     - `/residents` Residents (Users)
     - `/sos` SOS Records (Siren)
   - Footer block: user full name, role, Sign-out button (LogOut icon).

5. **`src/App.jsx` route table**
   ```jsx
   <Routes>
     <Route path="/login" element={<Login />} />
     <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
       <Route path="/"          element={<Dashboard />} />
       <Route path="/accounts"  element={<Accounts />} />
       <Route path="/residents" element={<Residents />} />
       <Route path="/sos"       element={<SosRecords />} />
     </Route>
     <Route path="*" element={<Navigate to="/" replace />} />
   </Routes>
   ```

## Acceptance criteria
- The sidebar is the ONLY navigation surface — no top header tabs.
- Active route is highlighted (`bg-brand-50 text-brand-700`).
- Sign-out instantly redirects to `/login` and clears storage.
- Refreshing the browser while logged in keeps the user logged in until the JWT expires (`JWT_EXPIRES_IN=12h`).
- Any unknown URL routes back to `/`.
