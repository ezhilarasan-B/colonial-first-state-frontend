# Colonial First State — Enterprise Directory & Client Management Console

A production-quality **Enterprise Staff Directory & Client Management Console** built with **React 19, Vite 8, and TypeScript**, featuring Redux Toolkit client-side caching with zero-refetch policy, automated JWT expiry validation with proactive refresh and concurrent queueing via Axios interceptors, persistent nested layout, role-based access control (RBAC), and a decoupled reusable UI component package.

---

## 1. Project Overview

The **Colonial First State (CFS) Management Console** is an enterprise single-page application (SPA) designed to maintain corporate personnel records and client portfolio assignments:

* **Staff Directory**: Complete management of internal personnel records (Name, Age, City, State, Pincode) with pagination, multi-select bulk operations, and relational integrity safeguards.
* **Client Management**: Management of client accounts (Name, Email, Phone, Company) mapped directly to designated staff members with dynamic staff assignment dropdowns.
* **Executive Dashboard**: High-level overview displaying aggregate directory metrics and quick action pathways.
* **Authentication & RBAC**: Standalone authentication portal supporting JWT-based session management, proactive token refresh before expiration, automatic 401 retry with token rotation, and granular role/permission checks (`staff:read`, `staff:write`, `client:read`, `client:write`).
* **Zero-Refetch Caching**: Redux Toolkit acts as the local entity cache; navigation to edit pages populates immediately from the cache without dispatching redundant network calls.
* **Dual Backend Modes**: Configurable to run against an asynchronous, in-memory **Mock API** with simulated latency or connect directly to a live **.NET 8 Web API with Entity Framework Core and SQLite**.

---

## 2. Technology Stack

* **UI Framework**: React 19 (`react`, `react-dom`) — Strict TypeScript, TSX only (zero JavaScript source files)
* **Build Tool & Bundler**: Vite 8 (`vite`) — High-speed Hot Module Replacement (HMR) and optimized rollup production builds
* **Language & Type System**: TypeScript 6 (`typescript`) — Configured with strict type checking (`strict: true`, no implicit `any`)
* **Routing**: React Router 7 (`react-router-dom`) — Protected/public route guards, persistent nested layout, and URL parameter handling
* **State Management**: Redux Toolkit 2 (`@reduxjs/toolkit`) & React Redux 9 (`react-redux`) — Typed slices, entity caching, and global toast notifications
* **HTTP Client**: Axios (`axios`) — Custom interceptors for token injection, proactive expiry validation, request queueing, and retry handling
* **Linter**: Oxlint (`oxlint`) — High-performance Rust-based JavaScript/TypeScript linter
* **Styling**: Native modular CSS with CSS variables, responsive design, and zero heavyweight third-party CSS dependencies

---

## 3. Project Structure

The project follows a clean architectural boundary separating generic UI primitives, domain APIs, global app configuration, and domain UI components:

```text
src/
├── constants/                    # Centralized single-source-of-truth constants
│   ├── api.ts                    # API base URL, timeout, endpoints, versioning
│   ├── auth.ts                   # Token storage keys, buffer seconds, session messages
│   ├── routes.ts                 # Centralized route definitions
│   └── index.ts                  # Barrel export
│
├── api/                          # Data access and caching layer
│   ├── common/                   # Shared networking and authentication infrastructure
│   │   ├── apiClient.ts          # Configured Axios instance with interceptors
│   │   ├── apiTypes.ts           # Shared API response interfaces and token types
│   │   ├── authInterceptor.ts    # Request/response interceptors with mutex refresh
│   │   └── tokenHelper.ts        # JWT decoder, expiry validator, and claim extractors
│   │
│   ├── staff/                    # Staff domain API and cache slice
│   │   ├── staffApi.ts           # Staff CRUD and bulk delete endpoints
│   │   ├── staffSlice.ts         # Redux Toolkit cache slice with zero-refetch policy
│   │   ├── staffTypes.ts         # Staff models, payloads, and state interfaces
│   │   └── staffMockApi.ts       # In-memory dataset & Axios mock adapter
│   │
│   └── client/                   # Client domain API and cache slice
│       ├── clientApi.ts          # Client CRUD and bulk delete endpoints
│       ├── clientSlice.ts        # Redux Toolkit cache slice with zero-refetch policy
│       └── clientTypes.ts        # Client models, payloads, and state interfaces
│
├── app/                          # Core application orchestration
│   ├── store.ts                  # Redux Toolkit store setup
│   ├── hooks.ts                  # Typed Redux hooks (useAppDispatch, useAppSelector)
│   ├── toastSlice.ts             # Global notification state slice
│   └── routes.tsx                # Route tree, route guards, and persistent Layout
│
├── components/                   # Domain-specific UI assemblies
│   ├── Auth/                     # Standalone authentication components
│   │   ├── LoginPage.tsx         # Standalone login form (isolated from Layout)
│   │   └── login.css             # Dedicated login styling
│   │
│   ├── Layout/                   # Persistent layout shells
│   │   ├── Layout.tsx            # Shell with Header, Sidebar, Outlet, and Toast
│   │   ├── Header.tsx            # Header with user profile, role badge, session status
│   │   ├── Sidebar.tsx           # Persistent active-route navigation
│   │   └── layout.css            # Responsive layout styling and mobile drawer
│   │
│   ├── Staff/                    # Staff Directory views
│   │   ├── StaffList.tsx         # Staff directory list with pagination & bulk actions
│   │   ├── StaffForm.tsx         # Add / Edit form (reads cached staff on edit)
│   │   ├── StaffTable.tsx        # Staff table with select-all checkbox support
│   │   ├── StaffRow.tsx          # Individual staff row with actions dropdown
│   │   └── staff.css             # Staff-specific styling
│   │
│   └── Client/                   # Client Management views
│       ├── ClientList.tsx        # Client list with assigned staff badges & pagination
│       ├── ClientForm.tsx        # Add / Edit form with staff assignment dropdown
│       ├── ClientTable.tsx       # Client table coordination
│       ├── ClientRow.tsx         # Individual client row with actions dropdown
│       └── client.css            # Client-specific styling
│
├── package/                      # Generic reusable UI component library
│   └── UI/                       # Completely decoupled UI components
│       ├── Button/               # Action buttons with variants and loading state
│       ├── Input/                # Accessible form inputs with inline error validation
│       ├── Checkbox/             # Checkbox supporting checked & indeterminate states
│       ├── Table/                # Responsive table primitives
│       ├── Modal/                # Accessible confirmation dialog with keyboard support
│       ├── Toast/                # Auto-dismissing floating alert notifications
│       ├── Pagination/           # Reusable pagination controls with page jump
│       ├── Spinner/              # Circular loading indicators
│       ├── EmptyState/           # Clean empty collection placeholder
│       ├── ErrorMessage/         # Error banner with optional retry callback
│       └── index.ts              # Barrel export
│
├── App.tsx                       # Root component with Redux Provider & Router
├── main.tsx                      # Application DOM entry point
└── index.css                     # Global design tokens, reset, and typography
```

---

## 4. Application Architecture & Data Flow

```text
                           UI Components (Staff / Client / Dashboard)
                                              │
                                              ▼
                                     Redux Toolkit Store
                               (staffSlice / clientSlice / toastSlice)
                                              │
                                              ▼
                                    Domain API Layer
                                (staffApi.ts / clientApi.ts)
                                              │
                                              ▼
                                      apiClient (Axios)
                                              │
                                              ▼
                                  Auth Interceptor Pipeline
                                              │
                  ┌───────────────────────────┴───────────────────────────┐
                  ▼                                                       ▼
        Token Valid (>60s left)                                Token Expired / Expiring
                  │                                                       │
                  │                                            Check In-Flight Refresh:
                  │                                            - If running: await queue
                  │                                            - If none: fire refresh POST
                  │                                                       │
                  └───────────────────────────┬───────────────────────────┘
                                              ▼
                                  Authorization: Bearer <token>
                                              │
                                              ▼
                                 Backend Request Handled
                     (Mock Adapter OR Live .NET 8 Web API Service)
```

---

## 5. Application Routes & Navigation

Application routes are declared centrally in `src/constants/routes.ts` and managed in `src/app/routes.tsx`:

| Route Path | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public Redirect | Evaluates session state; redirects to `/dashboard` if logged in, `/login` otherwise |
| `/login` | Public Only | Standalone authentication view (no sidebar/header); redirects to `/dashboard` if already authenticated |
| `/dashboard` | Protected | Executive dashboard displaying total counts for staff and client records with quick links |
| `/staff` | Protected | Staff Directory view with 10-item pagination, multi-select, and bulk delete actions |
| `/staff/add` | Protected (`staff:write`) | Create Staff form (restricted to users with staff write permissions) |
| `/staff/edit/:id` | Protected (`staff:write`) | Edit Staff form (prefilled instantly from Redux cache, no GET-by-id) |
| `/client` | Protected | Client Accounts view with assigned staff metadata, pagination, and bulk delete actions |
| `/client/add` | Protected | Create Client form with dynamic staff assignment dropdown |
| `/client/edit/:id` | Protected | Edit Client form (prefilled instantly from Redux cache) |
| `/user/*` | Protected Redirect | Backward compatibility aliases seamlessly redirecting `/user` routes to `/staff` |

---

## 6. Persistent Layout & User Experience

The application layout (`src/components/Layout/Layout.tsx`) encapsulates the primary authenticated workspace:

* **Persistent Mounting**: The `<Layout />` (including `<Header />` and `<Sidebar />`) remains mounted across all protected page transitions, avoiding full-page rerenders or visual flicker.
* **Active Menu Tracking**: The navigation links highlight accurately based on the active route:
  * **Staff** remains active on `/staff`, `/staff/add`, and `/staff/edit/:id` (as well as legacy `/user` paths).
  * **Clients** remains active on `/client`, `/client/add`, and `/client/edit/:id`.
  * **Dashboard** remains active on `/dashboard`.
* **Header Controls**:
  * Displays user profile details, email, and current role badge derived from JWT claims.
  * Shows real-time connection mode badge (`Live API` vs `Mock API`).
  * Provides **Clear Session** (clears tokens and redirects with a session expiration warning) and **Logout** options.
* **Mobile Responsiveness**: Sidebar includes responsive drawer toggling with backdrop dismissal for smaller viewports.

---

## 7. Authentication, JWT Refresh & RBAC

The application includes robust client-side authentication mechanisms:

### Proactive JWT Refresh & Concurrent Queueing
1. **Expiry Detection**: Prior to dispatching an outgoing request, `authInterceptor` inspects the access token in `localStorage`.
2. **Buffer Check**: If the token is expired or within the `TOKEN_EXPIRY_BUFFER_SECONDS` (60s) window, proactive refresh is initiated before the request leaves the client.
3. **Concurrency Locking**: If multiple API requests trigger refresh simultaneously, a shared `refreshPromise` ensures only **one** refresh network request is dispatched. All pending requests await the same promise and proceed with the new token.
4. **401 Response Retry**: If an unhandled 401 error occurs, the response interceptor marks `_retry = true`, refreshes the token, and replays the original request.
5. **Session Recovery**: Valid refresh tokens restore authenticated sessions on browser refresh without kicking the user back to the login screen.

### Role-Based Access Control (RBAC)
User permissions are extracted from JWT claims (`role`, `permission`, `permissions`):
* **Admin**: Possesses full administrative rights (`staff:read`, `staff:write`, `client:read`, `client:write`). Can view, create, edit, and delete staff and clients.
* **StaffReadOnly / ReadOnly**: Can view directory lists and client records (`staff:read`, `client:read`). Prevented from creating, editing, or deleting staff records. Guarded both in the UI (buttons hidden) and at the route level via `<StaffWriteGuard />`.

---

## 8. Client-Side Caching & Zero-Refetch Policy

Redux Toolkit manages state to minimize redundant network traffic and maximize responsiveness:

* **Initial Load**:
  * Directory views dispatch `fetchStaff` and `fetchClients` with pagination parameters (`pageNumber: 1, pageSize: 10`).
  * Subsequent navigations back to the list retain existing cached data while `initialLoaded` is true.
* **Zero-Refetch on Edit**:
  * Navigating to `/staff/edit/:id` or `/client/edit/:id` **does not call `GET /:id`** when the record is present in the Redux store.
  * The form populates synchronously from the cache via `selectStaffById(id)` or `selectClientById(id)`.
  * If the user accesses an edit URL directly via bookmark or page reload, the form cleanly falls back to fetching the individual record from the API.
* **In-Place Updates**:
  * Successful creation (`POST`) prepends the new entity to the Redux collection.
  * Successful update (`PUT`) updates the entity in-place inside the Redux collection.
  * Deletions (`DELETE` or bulk delete) remove entities directly from the Redux state and adjust counts without refetching the entire list.

---

## 9. Business Logic & Relational Integrity

* **Staff-Client Association**:
  * Every client record must be assigned to an active staff member (`staffId`).
  * The Client form dynamically queries all available staff to populate the assignment selector.
* **Staff Deletion Protection**:
  * A staff member assigned to one or more clients cannot be deleted.
  * If an administrator attempts to delete an assigned staff member, the operation is blocked and a descriptive notification is surfaced to prevent orphaned client records.
  * Bulk staff deletion processes valid deletions and returns a detailed report of any records that could not be deleted due to active client assignments (`StaffAssignedClientFailure`).
* **Client-Side Form Validation**:
  * Comprehensive validation for required fields, min/max lengths, email formats, and Australian telephone numbers and postcodes before submission.

---

## 10. Reusable Generic UI Package (`package/UI`)

All generic UI primitives reside under `src/package/UI/` with zero business logic or domain coupling:

* **Button**: Supports `primary`, `secondary`, `danger`, `outline`, and `ghost` variants, multiple sizes (`sm`, `md`, `lg`), and integrated loading spinner state.
* **Input**: Fully accessible form input with label, required asterisk, description text, and `role="alert"` inline validation error feedback.
* **Checkbox**: Custom accessible checkbox with support for checked, unchecked, and **indeterminate** states.
* **Table**: Responsive table layout supporting clean headers, rows, cells, and custom actions.
* **Modal**: Accessible confirmation dialog with keyboard support (`Escape` dismissal), focus trap, and customizable action buttons.
* **Pagination**: Comprehensive pagination bar featuring page count indicators, previous/next controls, and direct page buttons.
* **Toast**: Global notification container dispatching auto-dismissing feedback banners (`success`, `error`, `warning`, `info`).
* **Spinner**: Circular animated loading indicator.
* **EmptyState**: Clean placeholder for empty datasets with optional call-to-action button.
* **ErrorMessage**: Distinct error display banner with optional retry trigger.

---

## 11. Environment Configuration

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Configuration variables:

```env
# Toggle mock API mode (true = in-memory mock adapter, false = live .NET 8 backend)
VITE_USE_MOCK_API=false

# Base URL for the .NET 8 Web API
VITE_API_BASE_URL=http://localhost:5200/api/v1
```

> [!NOTE]
> When `VITE_USE_MOCK_API=true`, the application intercepts network calls using an in-memory mock adapter preloaded with corporate profiles and client accounts, simulating realistic network latency (200–350ms).

---

## 12. Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher

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

### Preview Production Build
```bash
npm run preview
```

---

## 13. Backend Integration Contract (.NET 8 Web API)

When connecting the frontend to a live .NET 8 Web API backend (`VITE_USE_MOCK_API=false`), the backend should satisfy the following RESTful contract:

### Authentication Endpoints
* `POST /api/v1/auth/login` — Accepts `{ username, password }`, returns `{ accessToken, refreshToken, tokenType, expiresIn }`
* `POST /api/v1/auth/refresh-token` — Accepts `{ refreshToken }`, returns `{ accessToken, refreshToken, tokenType, expiresIn }`

### Staff Directory Endpoints
* `GET    /api/v1/staff?pageNumber=1&pageSize=10` — Returns `PaginatedResult<Staff>` (or `Staff[]`)
* `GET    /api/v1/staff/all` — Returns `Staff[]` without pagination (for assignment dropdowns)
* `GET    /api/v1/staff/{id}` — Returns `Staff`
* `POST   /api/v1/staff` — Accepts `StaffPayload`, returns created `Staff`
* `PUT    /api/v1/staff/{id}` — Accepts `StaffPayload`, returns updated `Staff`
* `DELETE /api/v1/staff/{id}` — Deletes staff record (rejects if assigned to clients)
* `POST   /api/v1/staff/bulk-delete` — Accepts `{ ids: number[] }`, returns `{ deletedIds, failedStaff, message }`

### Client Management Endpoints
* `GET    /api/v1/client?pageNumber=1&pageSize=10` — Returns `PaginatedResult<Client>` (or `Client[]`)
* `GET    /api/v1/client/{id}` — Returns `Client`
* `POST   /api/v1/client` — Accepts `ClientPayload`, returns created `Client`
* `PUT    /api/v1/client/{id}` — Accepts `ClientPayload`, returns updated `Client`
* `DELETE /api/v1/client/{id}` — Deletes client record
* `POST   /api/v1/client/bulk-delete` — Accepts `{ ids: number[] }`, returns `{ deletedIds, message }`
