# IMPORTANT — Frontend integration rules (read before building any page/feature)

This is a **mandatory checklist** for adding any page, feature, or component to
`medical_frontend`. It exists so role-based access, reuse, and consistency are never
skipped. Read it fully before writing code, and verify against the checklist at the end.

Stack: React 19 + Vite + TypeScript + Tailwind v4 + TanStack Query + Zustand + React Router v7.
API base: `VITE_API_URL` + `/api/v1`. Roles: **ADMIN, USER only** (no SUPER_ADMIN / MANAGER).

---

## 1. Role-based access (NON-NEGOTIABLE)

There are two roles only: `ADMIN`, `USER`. Source of truth is `src/config/roles.ts`.
**Never hardcode role strings** (`'ADMIN'`, `'USER'`) in components — use the helpers.

- **Whole route** → wrap with `RoleRoute` in `src/routes/AppRouter.tsx`:
  ```tsx
  <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.adminOnly} />}>
    <Route path="/admin/users" element={<UsersPage />} />
  </Route>
  ```
  Use `ROLE_GROUPS.adminOnly` / `ROLE_GROUPS.userOnly` / `ROLE_GROUPS.everyone`.
- **Part of a page (buttons, sections, columns)** → wrap with `<RoleGate>`:
  ```tsx
  <RoleGate allow="ADMIN"> <DeleteButton/> </RoleGate>
  <RoleGate allow={['ADMIN','USER']} fallback={<Locked/>}> ... </RoleGate>
  ```
- **Imperative checks** → `const { isAdmin, isUser, can } = useAuthRole();` then `can('ADMIN')`.
- **Sidebar nav** → add the item to `src/components/layout/Sidebar.tsx` with a `roles: [...]`
  array so it only shows to permitted roles.
- Every protected page must sit under `ProtectedRoute` (auth gate) AND, if role-specific,
  `RoleRoute` (RBAC gate). Frontend gating is UX only — the **backend guard is the real
  enforcement**, so the API must also restrict the same way.

Key files: `config/roles.ts`, `hooks/useAuthRole.ts`, `components/auth/RoleGate.tsx`,
`routes/RoleRoute.tsx`, `routes/ProtectedRoute.tsx`.

---

## 2. Folder structure (follow exactly)

- Page component → `src/pages/{area}/XxxPage.tsx`
- Feature code → `src/features/{feature}/components/` and `src/features/{feature}/hooks/`
- Shared API client → `src/services/{thing}.service.ts`
- Shared types → `src/types/{thing}.types.ts`
- Reusable UI → `src/components/ui/` (only if truly generic)
- Constants/option lists → `src/features/{feature}/{feature}.constants.ts`

Never put data-fetching logic directly in a page — it goes in a service + a hook.

---

## 3. API layer & data fetching

- All HTTP goes through `src/api/axios.instance.ts` (auto-attaches JWT, auto-logout on 401).
  Never create a new axios instance or call `fetch` directly.
- **Response envelope**: backend wraps everything as `{ statusCode, data, timestamp }`.
  Services MUST unwrap `res.data.data`.
- Reads → `useQuery`; writes → `useMutation` and **invalidate** the relevant query on success.
- Query keys live in `src/api/queryKeys.ts` — add new keys there, don't inline arrays.
- Dependent/cascading queries → use `enabled: !!parentId` (see `useOrgCascade.ts`).

Pattern:
```ts
// services/foo.service.ts
export const fooService = {
  getAll: async () => (await api.get<ApiResponse<Foo[]>>('/foo')).data.data,
};
// features/foo/hooks/useFoo.ts
export const useFoo = () => useQuery({ queryKey: queryKeys.foo.all, queryFn: fooService.getAll });
```

---

## 4. Reuse the UI kit — do NOT reinvent

Use these from `src/components/ui/` (match their props/styling, don't build new variants):
`Button, Input, Select, DatePicker, Modal, Card, Badge, Avatar, SearchInput, Pagination,
Skeleton/SkeletonTable, EmptyState, Tabs, Dropdown, StatsCard, OtpInput`.

- Form text → `Input`; dropdown → `Select` (has label/error/required); dates → `DatePicker`.
- Dialogs → `Modal` (`size="sm|md|lg|xl"`, scrollable body). Forms submit via the footer
  `Button` with `form="form-id"` + `type="submit"`.
- Lists: loading → `SkeletonTable`; empty → `EmptyState`; errors → red `Card` banner.
- If a generic component is missing, add it to `components/ui/` (styled to match the kit),
  don't hand-roll one-off markup inside a page.

---

## 5. Forms & validation

- Validate on the client (instant UX) AND rely on backend validation (real enforcement).
  Keep field rules in sync with the DTO (e.g. mobile = 10 digits, pincode = 6, PAN regex,
  age 18–100, required vs optional).
- Mark required fields with the `required` prop (renders the `*`).
- Show API errors via `getApiErrorMessage(err)` from `src/lib/apiError.ts` (handles the
  `{ message: string | string[] }` shape).
- Reset form + errors on close.

---

## 6. Types & contract

- Mirror the backend contract in `src/types/*.types.ts`. Keep enums as string unions that
  match Prisma enums exactly (`'NEW_JOINER' | 'EXISTING' | 'ANNUAL'`, etc.).
- When the backend adds/renames a field, update the type, service, and any form/table in the
  same change — never leave stale field names (`mobileNumber`, `dateOfJoining`, …).

---

## 7. Styling consistency

- Tailwind v4 tokens only (`text-slate-900`, `bg-primary-600`, `border-border`, `rounded-xl`,
  `shadow-card`). No arbitrary hex unless matching an existing token.
- Page shell: `space-y-6 animate-fade-in`, header row with title + actions, then content.
- Keep spacing/typography consistent with existing pages (`UsersPage`, `CandidatesPage`).

---

## 8. Pre-merge checklist (verify every item)

- [ ] Route added under `ProtectedRoute` (+ `RoleRoute` if role-specific) in `AppRouter.tsx`.
- [ ] Sidebar nav item added with correct `roles`.
- [ ] No hardcoded role strings — used `useAuthRole` / `RoleGate` / `ROLE_GROUPS`.
- [ ] Role-restricted UI also restricted on the backend (guard + `@Roles`).
- [ ] Data via service (`res.data.data`) + TanStack hook; query key in `queryKeys.ts`; mutations invalidate.
- [ ] Reused the UI kit; any new generic piece lives in `components/ui/`.
- [ ] Client validation matches the backend DTO; errors shown via `getApiErrorMessage`.
- [ ] Types in `src/types` match the API; no stale field names.
- [ ] `npm run build` passes (tsc + vite) with no type errors.
- [ ] Loading / empty / error states handled.
