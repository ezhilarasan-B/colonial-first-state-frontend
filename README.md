# Colonial First State — User Directory Web Application

A production-quality **User Directory Web Application** built with **React, Vite, and TypeScript**, featuring Redux Toolkit client-side caching, automated JWT expiry validation and refresh via Axios interceptors, persistent nested layout, and a decoupled reusable UI package.

---

## 1. Project Overview

The **Colonial First State (CFS) User Directory** is an enterprise management application for maintaining user and personnel records. The frontend currently operates against an asynchronous, in-memory **Mock API** that runs through genuine Axios request and response interceptors. The codebase is strictly architected to transition to a **.NET 8 Web API with Entity Framework Core and SQLite** with zero component rewrites.

---

## 2. Technology Stack

* **React 19** (`react`, `react-dom`) — Strict TypeScript, TSX only (zero JavaScript source files)
* **Vite 8** (`vite`) — Next-generation frontend tooling and bundler
* **TypeScript** (`typescript`) — Strict type system (`strict: true`, no unnecessary `any`)
* **React Router 7** (`react-router-dom`) — Client-side SPA routing with persistent nested layouts
* **Redux Toolkit 2** (`@reduxjs/toolkit`) & **React Redux 9** (`react-redux`) — Client-side caching and state management
* **Axios** (`axios`) — Promise-based HTTP client with request/response interceptors
* **CSS** — Modular, responsive stylesheets with zero heavy CSS framework bloat
* **Mock API** — In-memory dataset running via Axios custom adapter with simulated network latency

---

## 3. Folder Structure

The project strictly follows the requested architectural rules (no `pages` folder, no `features` folder, generic UI under `package/UI/`, API under `api/`):

```text
src/
│
├── constants/             # Centralized single-source-of-truth constants
│   ├── api.ts             # API base URL, timeout, endpoints
│   ├── auth.ts            # Token storage keys, expiry buffer seconds
│   ├── routes.ts          # Centralized route strings
│   └── index.ts           # Barrel export
│
├── api/                   # Replaces features directory
│   ├── common/            # Shared networking and auth
│   │   ├── apiClient.ts       # Centralized Axios instance
│   │   ├── apiTypes.ts        # Common API response & auth types
│   │   ├── authInterceptor.ts # JWT request/response interceptors
│   │   └── tokenHelper.ts     # JWT decoding and expiry validation
│   │
│   └── user/              # User resource API & state
│       ├── userApi.ts         # User CRUD endpoints
│       ├── userSlice.ts       # Redux Toolkit cache slice (zero-refetch)
│       ├── userTypes.ts       # User models and payload interfaces
│       └── userMockApi.ts     # Mock data and Axios adapter
│
├── app/                   # App-level orchestration
│   ├── store.ts           # Redux store configuration
│   ├── hooks.ts           # Typed useAppDispatch & useAppSelector
│   ├── toastSlice.ts      # Global toast notification slice
│   └── routes.tsx         # Route tree and persistent Layout
│
├── components/            # Domain-specific UI
│   ├── Layout/            # Persistent Layout, Header, Sidebar
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── layout.css
│   │
│   └── User/              # User Directory views
│       ├── UserList.tsx
│       ├── UserForm.tsx
│       ├── UserTable.tsx
│       ├── UserRow.tsx
│       └── user.css
│
├── package/               # Generic UI library
│   └── UI/                # Completely decoupled components
│       ├── Button/            # Action button with variants & loading state
│       ├── Input/             # Accessible input with inline errors
│       ├── Checkbox/          # Checkbox with indeterminate support
│       ├── Table/             # Responsive table primitives
│       ├── Modal/             # Accessible confirmation dialog
│       ├── Toast/             # Floating auto-dismiss alerts
│       ├── Spinner/           # Circular loading indicator
│       ├── EmptyState/        # Placeholder for empty collections
│       ├── ErrorMessage/      # Error banner with retry callback
│       └── index.ts           # Barrel export
│
├── App.tsx                # Redux Provider & BrowserRouter
├── main.tsx               # Entry point
└── index.css              # Global styles & resets
```

---

## 4. Application Architecture

The system enforces a clean, unidirectional separation of responsibilities:

```text
                            User Components
                           (List, Form, Table)
                                   │
                                   ▼
                          Redux Toolkit Cache
                                   │
                                   ▼
                             User API Layer
                                   │
                                   ▼
                           Axios Client Core
                                   │
                                   ▼
                         Auth Interceptor Chain
                                   │
                   ┌───────────────┴───────────────┐
                   │                               │
             Token Valid                     Token Expired
                   │                               │
                   │                         Refresh Token
                   │                               │
                   │                        New Access Token
                   │                               │
                   └───────────────┬───────────────┘
                                   │
                                   ▼
                        Authorization Header (Bearer)
                                   │
                                   ▼
                    Backend API (.NET 8 Web API / Mock)
```

---

## 5. Routing

Application routes are centralized in `src/constants/routes.ts`:

* `/user` — User Directory List view
* `/user/add` — Add User view
* `/user/edit/:id` — Edit User view (reads cached user from Redux)
* `/dashboard` — Executive Overview Dashboard
* `/` — Automatically redirects to `/user`

---

## 6. Persistent Layout

The `<Layout />` component in `src/components/Layout/Layout.tsx` wraps the `<Outlet />`.
* Stays continuously mounted during navigation between `/user`, `/user/add`, and `/user/edit/:id`.
* The **User** menu in `<Sidebar />` remains highlighted across `/user`, `/user/add`, and `/user/edit/:id` via `location.pathname.startsWith('/user')`.
* Uses pure client-side SPA routing; never calls `window.location.reload()` or full page refreshes.

---

## 7. Reusable UI Package (`package/UI`)

All generic UI components live under `src/package/UI/` and are exported via `src/package/UI/index.ts`. None of these components have any knowledge of Users or business domains:

* **Button**: Supports `primary`, `secondary`, `danger`, `outline`, `ghost` variants, `sm`/`md`/`lg` sizes, and spinner loading state.
* **Input**: Fully accessible form input with label, required asterisk, description, and `role="alert"` inline validation error.
* **Checkbox**: Supports checked, unchecked, and **indeterminate** states with animated SVG indicators.
* **Table**: Responsive container enabling horizontal scroll on mobile with table headers, body, rows, and cells.
* **Modal**: Accessible modal dialog with backdrop dismissal, keyboard `Esc` listener, and action buttons.
* **Toast**: Floating alert notifications with auto-dismiss timer and dismissal trigger.
* **Spinner**: Accessible circular progress indicator for asynchronous loading states.
* **EmptyState**: Clean placeholder for empty datasets with call-to-action button.
* **ErrorMessage**: Distinct error notification with optional retry button.

---

## 8. Redux Caching & Zero-Refetch Policy

Redux acts as the local user cache to eliminate unnecessary network traffic:

* **Initial Fetch**: Dispatches `fetchUsers()` only once upon mounting `<UserList />` when `!initialLoaded`.
* **Add User**: `POST /api/users` returns the newly created record. Redux adds it to the cache via `addUser()`. The list updates immediately without calling `GET /api/users`.
* **Edit User**:
  * **Critical Requirement**: When opening `/user/edit/:id`, **no `GET /api/users/:id` is called**. The form is populated directly from the Redux cache using `selectUserById(id)`.
  * After saving with `PUT /api/users/:id`, Redux updates the user in-place via `updateUser()`. No `GET /api/users` is called.
* **Delete User**: After confirmation in `<Modal />`, `DELETE /api/users/:id` executes. Redux removes the user via `removeUser()`. The visible list updates immediately without calling `GET /api/users`.

---

## 9. API Architecture & Axios Interceptors

* **Centralized Base URL**: Sourced from `import.meta.env.VITE_API_BASE_URL` in `src/constants/api.ts`.
* **No Manual Headers**: Individual API methods in `src/api/user/userApi.ts` never manually attach `Authorization` headers.
* **Request Interceptor**:
  1. Inspects the access token in local storage via `tokenHelper`.
  2. Decodes the JWT payload to read the `exp` claim.
  3. Checks if the token is expired or within the `TOKEN_EXPIRY_BUFFER_SECONDS` (60s) buffer.
  4. If about to expire, proactively triggers `refreshAuthToken()`.
  5. Injects `Authorization: Bearer <token>` into `config.headers`.
* **Concurrent Refresh Queueing**:
  * If multiple requests trigger token refresh simultaneously, a shared `refreshPromise` ensures only **one** refresh network request is fired. All pending requests await the single promise and proceed with the new token.
* **Response Interceptor (401 Retry)**:
  * If an authenticated request encounters a `401 Unauthorized` response:
  * Checks if `originalRequest._retry` is already set. If not, marks `_retry = true`.
  * Refreshes the token and retries the original request once.
  * If the refresh token is expired or invalid, clears stored tokens and rejects cleanly.

---

## 10. Mock API

* Built into `src/api/user/userMockApi.ts`.
* Preloaded with realistic Australian corporate directory profiles.
* Integrated into Axios via custom `adapter: mockAxiosAdapter`, ensuring requests pass through the exact same interceptor chain as production requests.
* Simulates realistic network delay (200–300ms).

---

## 11. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configuration keys:

```env
# Base URL for .NET 8 Web API
VITE_API_BASE_URL=https://api.userdirectory.local/api

# Toggle mock API mode (true = mock adapter, false = real .NET 8 backend)
VITE_USE_MOCK_API=true
```

---

## 12. How to Run the Project

### Prerequisites
* Node.js (v18+ or v20+)
* npm (v9+)

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Type Check & Build
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```

---

## 13. Future .NET 8 Integration Plan

The frontend is ready for immediate integration with a .NET 8 Web API backend using SQLite and EF Core:

1. **Backend Contract**:
   * `GET    /api/users` — Returns `User[]`
   * `GET    /api/users/{id}` — Returns `User`
   * `POST   /api/users` — Accepts `UserPayload`, returns created `User`
   * `PUT    /api/users/{id}` — Accepts `UserPayload`, returns updated `User`
   * `DELETE /api/users/{id}` — Deletes user, returns 200 OK
   * `POST   /api/auth/refresh` — Accepts `{ refreshToken }`, returns `{ accessToken, refreshToken }`
2. **Switching Frontend**:
   * Set `VITE_USE_MOCK_API=false` in `.env`.
   * Set `VITE_API_BASE_URL=https://<your-dotnet-api-host>/api` in `.env`.
   * No component, slice, or service code modifications are required!

Consult `doc/BUSINESS_LOGIC_AND_IMPACT_ANALYSIS.md` for full impact checklists and domain rules.

---

## 14. AI Tools Disclosure

In accordance with transparency and documentation standards:
* **AI Tools Used**: Google DeepMind Antigravity / Gemini Advanced Agentic Coding System.
* **Scope of AI Assistance**: Architecture design, strict TypeScript typing, component scaffolding, Axios interceptor and concurrency queue implementation, Redux Toolkit cache design, CSS styling, lint verification, and comprehensive impact analysis documentation.
