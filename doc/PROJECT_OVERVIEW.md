# Colonial First State — User Directory Frontend Architecture

## 1. Project Overview

The **Colonial First State (CFS) User Directory** is a production-quality, enterprise-grade single-page application built with **React, Vite, TypeScript, Redux Toolkit, React Router, and Axios**.

It is architected according to strict separation of concerns, featuring a client-side Redux cache with zero-unnecessary-refetch policies, an Axios request/response interceptor pipeline with proactive JWT expiry validation and concurrent token refresh queueing, and a completely decoupled generic UI component library.

Currently, the application operates against a high-fidelity **Mock API** that runs through the actual Axios interceptor chain. The system is designed to transition seamlessly to a **.NET 8 Web API with Entity Framework Core and SQLite** by updating configuration flags without requiring code refactoring.

---

## 2. Technology Stack

* **UI Framework**: React 19 (TypeScript, TSX only — zero JavaScript source files)
* **Build System**: Vite 8 with Strict TypeScript Compilation
* **State Management**: Redux Toolkit & React-Redux (Strongly typed hooks)
* **Routing**: React Router 7 with nested persistent layouts
* **HTTP Client**: Axios with custom interceptors and mock adapter
* **Styling**: Native modular CSS with responsive design principles
* **Validation**: Inline client-side validation engine

---

## 3. Architecture & Directory Structure

```text
src/
│
├── constants/             # Centralized single-source-of-truth constants
│   ├── api.ts             # API base URLs, timeouts, endpoint paths
│   ├── auth.ts            # Token storage keys, expiry buffer seconds, header configs
│   ├── routes.ts          # Application route definitions
│   └── index.ts           # Barrel export
│
├── api/                   # API & Data access layer (replaces legacy features folder)
│   ├── common/            # Shared networking and authentication infrastructure
│   │   ├── apiClient.ts       # Centralized Axios instance with interceptors
│   │   ├── apiTypes.ts        # Common API response, error, and token types
│   │   ├── authInterceptor.ts # Request & response JWT interceptors with lock
│   │   └── tokenHelper.ts     # JWT decoder, expiry validator, localStorage helper
│   │
│   └── user/              # User domain-specific API operations and state
│       ├── userApi.ts         # User CRUD endpoints using apiClient
│       ├── userSlice.ts       # Redux Toolkit cache slice with zero-refetch policy
│       ├── userTypes.ts       # Domain models, payload DTOs, and state interfaces
│       └── userMockApi.ts     # Constant dataset & Axios mock adapter
│
├── app/                   # Application wiring
│   ├── store.ts           # Redux Toolkit store setup
│   ├── hooks.ts           # Strongly typed Redux hooks (`useAppDispatch`, `useAppSelector`)
│   ├── toastSlice.ts      # Global notification state slice
│   └── routes.tsx         # Route tree and persistent Layout nesting
│
├── components/            # Domain-specific UI assemblies
│   ├── Layout/            # Persistent layout shells
│   │   ├── Layout.tsx         # Persistent Layout with Header, Sidebar, Outlet, and Toast
│   │   ├── Header.tsx         # Enterprise brand header with user status
│   │   ├── Sidebar.tsx        # Persistent active-route navigation
│   │   └── layout.css         # Layout styling and responsive breakpoints
│   │
│   └── User/              # User directory views and components
│       ├── UserList.tsx       # User list view with selection and modal triggers
│       ├── UserForm.tsx       # Reusable Add/Edit form using Redux cache for Edit
│       ├── UserTable.tsx      # Table coordination and header Select-All
│       ├── UserRow.tsx        # Individual row with actions and checkbox
│       └── user.css           # User table, form card, and modal styling
│
├── package/               # Generic UI component library
│   └── UI/                # Decoupled components with zero User business logic
│       ├── Button/            # Action buttons with variants and loading state
│       ├── Input/             # Accessible form input with inline error feedback
│       ├── Checkbox/          # Checkbox supporting checked and indeterminate states
│       ├── Table/             # Responsive table primitives
│       ├── Modal/             # Accessible confirmation dialog with keyboard support
│       ├── Toast/             # Auto-dismissing floating alert notifications
│       ├── Spinner/           # Circular progress indicator
│       ├── EmptyState/        # Clean empty list placeholder
│       ├── ErrorMessage/      # Error banner with retry callback
│       └── index.ts           # Barrel export for generic UI
│
├── App.tsx                # App root with Redux Provider & BrowserRouter
├── main.tsx               # DOM mounting entry point
└── index.css              # Global tokens, reset, and scrollbar styles
```

---

## 4. Persistent Layout & Routing

The application uses nested routes under `src/app/routes.tsx`:

```tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Navigate to="/user" replace />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/user" element={<UserList />} />
    <Route path="/user/add" element={<UserForm mode="add" />} />
    <Route path="/user/edit/:id" element={<UserForm mode="edit" />} />
    <Route path="*" element={<Navigate to="/user" replace />} />
  </Route>
</Routes>
```

### Key Guarantees:
1. **Zero Remounting**: The `<Layout />` (including `<Header />` and `<Sidebar />`) remains continuously mounted while navigating between `/user`, `/user/add`, and `/user/edit/:id`.
2. **Active State Retention**: The sidebar User navigation link stays highlighted across all child user routes by evaluating `location.pathname.startsWith('/user')`.
3. **No Browser Reloads**: Transitions occur exclusively via React Router's SPA navigation. `window.location.reload()` is never called.

---

## 5. Authentication & JWT Interceptors

### JWT Expiry & Proactive Refresh Flow
```text
Outgoing Request
       │
       ▼
Axios Request Interceptor
       │
       ├─► Check Token in Storage
       │
       ├─► Decode JWT (Reads 'exp' claim)
       │
       ├─► Is token expired OR expiring within TOKEN_EXPIRY_BUFFER_SECONDS (60s)?
       │      │
       │      ├─► [NO] ──► Inject 'Authorization: Bearer <token>' ──► Send Request
       │      │
       │      └─► [YES] ──► Check if refresh is already in-flight:
       │                      │
       │                      ├─► [In Flight] ──► Await existing refreshPromise
       │                      │
       │                      └─► [Not In Flight] ─► Create shared refreshPromise
       │                                              │
       │                                              ▼
       │                                     POST /api/auth/refresh
       │                                              │
       │                                              ▼
       │                                     Store new access token
       │                                              │
       │                                              ▼
       │                                     Inject refreshed Bearer token
       │                                              │
       │                                              ▼
       │                                         Send Request
```

### 401 Response Interceptor Flow
If the server returns `401 Unauthorized`:
1. Check `originalRequest._retry`. If already true, abort and clear tokens to avoid infinite retry loops.
2. Mark `originalRequest._retry = true`.
3. Invoke `refreshAuthToken()`.
4. Update `originalRequest.headers.Authorization = Bearer <newToken>`.
5. Re-dispatch the original request through `apiClient(originalRequest)`.
