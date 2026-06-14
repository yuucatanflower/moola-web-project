# Project Requirements Explanation Guide

Use this as a click-through checklist for the presentation. Backend requirements link to the class or method you can open and explain. Frontend requirements link to the HTML, CSS, JS/JSX files and API helper functions that prove each requirement.

## MUST Requirements

### M1: Backend is an individual component
Status: fulfilled in this repository.

- [backend/pom.xml](backend/pom.xml): shows the backend is its own Maven/Spring Boot project.
- [Application#main](backend/src/main/java/com/moola/backend/Application.java): starts the Spring Boot backend.
- [TransactionController](backend/src/main/java/com/moola/backend/controllers/TransactionController.java), [CategoryController](backend/src/main/java/com/moola/backend/controllers/CategoryController.java), [AuthController](backend/src/main/java/com/moola/backend/controllers/AuthController.java), [FeatureController](backend/src/main/java/com/moola/backend/controllers/FeatureController.java), [WalletController](backend/src/main/java/com/moola/backend/controllers/WalletController.java), and [AdminController](backend/src/main/java/com/moola/backend/controllers/AdminController.java): show the backend HTTP layer.
- [TransactionService](backend/src/main/java/com/moola/backend/services/TransactionService.java), [CategoryService](backend/src/main/java/com/moola/backend/services/CategoryService.java), [AuthService](backend/src/main/java/com/moola/backend/services/AuthService.java), [CurrencyService](backend/src/main/java/com/moola/backend/services/CurrencyService.java), and [AIService](backend/src/main/java/com/moola/backend/services/AIService.java): show the backend business logic layer.

### M2: Frontend is an individual component implemented using HTML5, CSS and JS
Status: fulfilled in this repository.

- [frontend/package.json](frontend/package.json): shows the frontend is its own npm/Vite project, separate from `backend/`.
- [frontend/index.html](frontend/index.html): HTML5 entry point with `<!doctype html>`, `lang`, charset, viewport meta, and the React mount point.
- [frontend/src/index.css](frontend/src/index.css): global CSS loaded by the app.
- [frontend/src/main.jsx](frontend/src/main.jsx): JavaScript bootstrap that mounts the React app into the DOM.
- [frontend/src/App.jsx](frontend/src/App.jsx): main frontend application shell and routing between user views.
- [frontend/vite.config.js](frontend/vite.config.js): Vite build/dev config for the standalone frontend component.
- UI is built with React JSX, which compiles to HTML/CSS/JS for the browser. Key view files include [AuthPanel](frontend/src/components/auth/AuthPanel.jsx), [Home](frontend/src/components/dashboard/Home.jsx), [Dashboard](frontend/src/components/dashboard/Dashboard.jsx), [Settings](frontend/src/components/dashboard/Settings.jsx), and [AdminPanel](frontend/src/components/dashboard/AdminPanel.jsx).

### M3: FE and BE communicate using HTTP(S)
Status: fulfilled.

Backend side:
- [SecurityConfig#corsConfigurationSource](backend/src/main/java/com/moola/backend/config/SecurityConfig.java): allows browser origins and HTTP methods.
- [TransactionController](backend/src/main/java/com/moola/backend/controllers/TransactionController.java): exposes `/api/transactions`.
- [CategoryController](backend/src/main/java/com/moola/backend/controllers/CategoryController.java): exposes `/api/categories`.
- [AuthController](backend/src/main/java/com/moola/backend/controllers/AuthController.java): exposes `/api/auth`.
- [FeatureController](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): exposes `/api/features`.
- [WalletController](backend/src/main/java/com/moola/backend/controllers/WalletController.java): exposes `/api/wallet`.
- [AdminController](backend/src/main/java/com/moola/backend/controllers/AdminController.java): exposes `/api/admin`.

Frontend side:
- [vite.config.js proxy](frontend/vite.config.js): forwards browser requests from `/api` to `http://localhost:8081`.
- [api.jsx#request](frontend/src/services/api.jsx): sends HTTP requests to `/api/...` using the Fetch API.
- [App.jsx loadTransactions effect](frontend/src/App.jsx): loads data from the backend after login.
- [Home.jsx category load](frontend/src/components/dashboard/Home.jsx): calls the backend categories endpoint on page load.
- [AdvisorPanel.jsx handleAskAI](frontend/src/components/dashboard/AdvisorPanel.jsx): calls the backend AI advice endpoint.
- [AdminPanel.jsx handleLogin](frontend/src/components/dashboard/AdminPanel.jsx): calls the backend admin users endpoint.

### M4: FE and BE communicate using asynchronous data transfer (AJAX)
Status: fulfilled.

- [api.jsx#request](frontend/src/services/api.jsx): central async wrapper using `fetch(...)` and `await`.
- [loginUser](frontend/src/services/api.jsx): async POST to `/api/auth/login`.
- [registerUser](frontend/src/services/api.jsx): async POST to `/api/auth/register`.
- [fetchTransactions](frontend/src/services/api.jsx): async GET to `/api/transactions`.
- [fetchCategories](frontend/src/services/api.jsx): async GET to `/api/categories`.
- [createTransaction](frontend/src/services/api.jsx): async POST to `/api/transactions`.
- [updateTransaction](frontend/src/services/api.jsx): async PUT to `/api/transactions/{id}`.
- [deleteTransaction](frontend/src/services/api.jsx): async DELETE to `/api/transactions/{id}`.
- [fetchAiAdvice](frontend/src/services/api.jsx): async GET to `/api/features/advice`.
- [updateUserProfile](frontend/src/services/api.jsx): async PUT to `/api/auth/profile`.
- [fetchUsers](frontend/src/services/api.jsx), [deleteUser](frontend/src/services/api.jsx), and [updateUser](frontend/src/services/api.jsx): async admin calls to `/api/admin/users`.
- [App.jsx handleAuthSubmit](frontend/src/App.jsx): awaits login/register without reloading the page.
- [Home.jsx handleSubmit](frontend/src/components/dashboard/Home.jsx): awaits transaction creation and updates UI state locally.
- Backend endpoints return JSON and CORS is configured in [SecurityConfig#corsConfigurationSource](backend/src/main/java/com/moola/backend/config/SecurityConfig.java).

### M5: Backend endpoints return data as JSON or XML
Status: fulfilled as JSON, with selected endpoints also supporting XML.

- [AuthController#login](backend/src/main/java/com/moola/backend/controllers/AuthController.java): returns a `Map` with `accessToken` and user data, serialized as JSON.
- [AuthController#updateProfile](backend/src/main/java/com/moola/backend/controllers/AuthController.java): returns updated user data including `advisorTone`.
- [FeatureController#getAutomatedAdvice](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): returns JSON with an `advice` value.
- [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): returns JSON with converted currency data.
- [FeatureController#getAutomatedAdvice](backend/src/main/java/com/moola/backend/controllers/FeatureController.java) and [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): can also return XML when the request sends `Accept: application/xml`.
- [TransactionController#getAiAdvice](backend/src/main/java/com/moola/backend/controllers/TransactionController.java): also returns JSON with an `advice` value from transaction history.
- [TransactionController#getAll](backend/src/main/java/com/moola/backend/controllers/TransactionController.java): returns a JSON array of transactions.
- [CategoryController#getAllCategories](backend/src/main/java/com/moola/backend/controllers/CategoryController.java): returns a JSON array of categories.
- [WalletController#getWallet](backend/src/main/java/com/moola/backend/controllers/WalletController.java): returns wallet data as JSON.

Frontend consumption of JSON:
- [api.jsx#readResponseBody](frontend/src/services/api.jsx): parses JSON responses with `response.json()`.
- [App.jsx loadTransactions effect](frontend/src/App.jsx): stores the returned transaction array in React state.
- [AdvisorPanel.jsx handleAskAI](frontend/src/components/dashboard/AdvisorPanel.jsx): reads `aiResponse.advice` from the JSON payload.

### M6: Backend manages resources using GET, POST, PUT, and DELETE
Status: fulfilled.

- GET: [TransactionController#getAll](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `GET /api/transactions`.
- GET: [TransactionController#getAiAdvice](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `GET /api/transactions/advice`.
- POST: [TransactionController#create](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `POST /api/transactions`.
- PUT: [TransactionController#update](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `PUT /api/transactions/{id}`.
- DELETE: [TransactionController#delete](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `DELETE /api/transactions/{id}`.
- Another full CRUD example is [CategoryController](backend/src/main/java/com/moola/backend/controllers/CategoryController.java), which supports GET, POST, PUT, DELETE, and PATCH for `/api/categories`.

### M7: Frontend consumes resources using GET, POST, PUT, and DELETE
Status: fulfilled.

- GET: [fetchTransactions](frontend/src/services/api.jsx) calls `GET /api/transactions`, used in [App.jsx loadTransactions effect](frontend/src/App.jsx).
- GET: [fetchCategories](frontend/src/services/api.jsx) calls `GET /api/categories`, used in [Home.jsx loadCategories effect](frontend/src/components/dashboard/Home.jsx).
- GET: [fetchAiAdvice](frontend/src/services/api.jsx) calls `GET /api/features/advice`, used in [AdvisorPanel.jsx handleAskAI](frontend/src/components/dashboard/AdvisorPanel.jsx).
- GET: [fetchUsers](frontend/src/services/api.jsx) calls `GET /api/admin/users`, used in [AdminPanel.jsx handleLogin](frontend/src/components/dashboard/AdminPanel.jsx).
- POST: [loginUser](frontend/src/services/api.jsx) calls `POST /api/auth/login`, used in [App.jsx handleAuthSubmit](frontend/src/App.jsx).
- POST: [registerUser](frontend/src/services/api.jsx) calls `POST /api/auth/register`, used in [App.jsx handleAuthSubmit](frontend/src/App.jsx).
- POST: [createTransaction](frontend/src/services/api.jsx) calls `POST /api/transactions`, used in [Home.jsx handleSubmit](frontend/src/components/dashboard/Home.jsx).
- PUT: [updateTransaction](frontend/src/services/api.jsx) calls `PUT /api/transactions/{id}`, used in [App.jsx handleUpdateTransaction](frontend/src/App.jsx) and [TransactionList.jsx handleSave](frontend/src/components/dashboard/TransactionList.jsx).
- PUT: [updateUserProfile](frontend/src/services/api.jsx) calls `PUT /api/auth/profile`, used in [App.jsx handleUpdateProfile](frontend/src/App.jsx) and [Settings.jsx handleSaveProfile](frontend/src/components/dashboard/Settings.jsx).
- PUT: [updateUser](frontend/src/services/api.jsx) calls `PUT /api/admin/users/{id}`, used in [AdminPanel.jsx handleRename](frontend/src/components/dashboard/AdminPanel.jsx).
- DELETE: [deleteTransaction](frontend/src/services/api.jsx) calls `DELETE /api/transactions/{id}`, used in [App.jsx handleDeleteTransaction](frontend/src/App.jsx) and [TransactionList.jsx handleDelete](frontend/src/components/dashboard/TransactionList.jsx).
- DELETE: [deleteUser](frontend/src/services/api.jsx) calls `DELETE /api/admin/users/{id}`, used in [AdminPanel.jsx handleDelete](frontend/src/components/dashboard/AdminPanel.jsx).

### M8: System consumes at least one external REST web service
Status: fulfilled.

- [CurrencyService#convertCurrency](backend/src/main/java/com/moola/backend/services/CurrencyService.java): calls the external Frankfurter currency API.
- [CurrencyService RestTemplate call](backend/src/main/java/com/moola/backend/services/CurrencyService.java): uses `restTemplate.getForObject(...)`.
- [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): exposes the currency feature through `/api/features/convert`.

### M9: System implements session management
Status: fulfilled with JWT.

Backend:
- [AuthController#login](backend/src/main/java/com/moola/backend/controllers/AuthController.java): returns the JWT token to the client.
- [AuthController#updateProfile](backend/src/main/java/com/moola/backend/controllers/AuthController.java): updates user profile data while protected by JWT security.
- [AuthService#login](backend/src/main/java/com/moola/backend/services/AuthService.java): checks the username and password.
- [AuthService token creation](backend/src/main/java/com/moola/backend/services/AuthService.java): calls `jwtUtils.generateToken(...)`.
- [JwtUtils#generateToken](backend/src/main/java/com/moola/backend/security/JwtUtils.java): creates the JWT.
- [JwtUtils#getUsernameFromToken](backend/src/main/java/com/moola/backend/security/JwtUtils.java): reads the username from a JWT.
- [JwtUtils#validateToken](backend/src/main/java/com/moola/backend/security/JwtUtils.java): validates a JWT.
- [JwtRequestFilter](backend/src/main/java/com/moola/backend/security/JwtRequestFilter.java): reads the `Authorization: Bearer ...` header for protected requests.
- [SecurityConfig#securityFilterChain](backend/src/main/java/com/moola/backend/config/SecurityConfig.java): makes the backend stateless and protects non-auth endpoints.

Frontend:
- [App.jsx handleAuthSubmit](frontend/src/App.jsx): stores the token returned by login/register.
- [session.js#buildSession](frontend/src/utils/session.js): builds the client session object with `accessToken`.
- [session.js#saveSession](frontend/src/utils/session.js): persists the session in `localStorage`.
- [session.js#readStoredSession](frontend/src/utils/session.js): restores the session on page reload.
- [session.js#clearSession](frontend/src/utils/session.js): clears the session on logout.
- [api.jsx fetchTransactions](frontend/src/services/api.jsx): attaches `Authorization: Bearer ${token}` to protected requests.
- [App.jsx handleLogout](frontend/src/App.jsx): clears the stored session and returns the user to the auth screen.

## SHOULD Requirements

### S1: System consumes at least two external REST web services
Status: fulfilled.

- [CurrencyService#convertCurrency](backend/src/main/java/com/moola/backend/services/CurrencyService.java): uses the Frankfurter API.
- [AIService#getFinancialAdvice](backend/src/main/java/com/moola/backend/services/AIService.java): uses the Groq API.
- [AIService RestTemplate call](backend/src/main/java/com/moola/backend/services/AIService.java): calls Groq with `restTemplate.postForEntity(...)`.
- [FeatureController#getAutomatedAdvice](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): exposes AI advice through `/api/features/advice`.
- [TransactionController#getAiAdvice](backend/src/main/java/com/moola/backend/controllers/TransactionController.java): exposes AI advice through `/api/transactions/advice` and passes the user's `advisorTone`.
- [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): exposes currency conversion through `/api/features/convert`.
- Frontend trigger: [AdvisorPanel.jsx handleAskAI](frontend/src/components/dashboard/AdvisorPanel.jsx) consumes `/api/features/advice`.

### S2: System offers a second individual FE component
Status: fulfilled.

First frontend component:
- [App.jsx](frontend/src/App.jsx): main user app with auth, home, dashboard, and settings.
- [AuthPanel.jsx](frontend/src/components/auth/AuthPanel.jsx): login/register UI.
- [Home.jsx](frontend/src/components/dashboard/Home.jsx): transaction entry screen.
- [Dashboard.jsx](frontend/src/components/dashboard/Dashboard.jsx): overview, transaction list, and advisor panel.

Second frontend component:
- [AdminPanel.jsx](frontend/src/components/dashboard/AdminPanel.jsx): separate admin UI mounted at `/admin` from [App.jsx isAdminPage branch](frontend/src/App.jsx).
- It consumes at least three backend endpoints:
  - [fetchUsers](frontend/src/services/api.jsx) for `GET /api/admin/users`.
  - [updateUser](frontend/src/services/api.jsx) for `PUT /api/admin/users/{id}`.
  - [deleteUser](frontend/src/services/api.jsx) for `DELETE /api/admin/users/{id}`.

### S3: FE is W3C compliant
Status: structurally supported in source; validate the built HTML in the W3C validator before presenting.

Evidence in this repository:
- [frontend/index.html](frontend/index.html): valid HTML5 doctype, `lang="en"`, UTF-8 charset, and responsive viewport meta tag.
- [AuthPanel.jsx form](frontend/src/components/auth/AuthPanel.jsx): uses semantic `<section>`, `<form>`, and labeled inputs through [FormField.jsx](frontend/src/components/common/FormField.jsx).
- [Home.jsx](frontend/src/components/dashboard/Home.jsx): uses semantic `<header>`, `<main>`, and `<form>`.
- [Dashboard.jsx](frontend/src/components/dashboard/Dashboard.jsx): uses semantic `<header>` and `<main>`.
- [TransactionList.jsx](frontend/src/components/dashboard/TransactionList.jsx): uses semantic `<section>`, `<aside>`, and `<article>` for transaction rows.
- [TransactionList.jsx SpendingPie](frontend/src/components/dashboard/TransactionList.jsx): decorative chart uses `role="img"` and `aria-label`.
- [TransactionList.jsx edit/delete buttons](frontend/src/components/dashboard/TransactionList.jsx): action buttons include `aria-label`.
- [Settings.jsx](frontend/src/components/dashboard/Settings.jsx): form controls are wrapped in `<label>` elements.

Presentation note:
- Run the W3C Markup Validation Service against the served frontend page or built output from `npm run build` to show zero or fixed validation errors.

### S4: FE is responsive for mobile and desktop
Status: fulfilled.

- [frontend/index.html viewport meta](frontend/index.html): enables mobile scaling.
- [frontend/src/index.css](frontend/src/index.css): base full-height layout styles.
- Tailwind responsive utility classes are used throughout the UI, for example:
  - [App.jsx padding](frontend/src/App.jsx): `p-[clamp(18px,4vw,48px)]`.
  - [AuthPanel.jsx layout](frontend/src/components/auth/AuthPanel.jsx): `sm:p-10`, `lg:grid-cols-[...]`, and `text-[clamp(...)]`.
  - [Home.jsx typography and spacing](frontend/src/components/dashboard/Home.jsx): `sm:p-12`, `sm:mr-5`, `text-6xl sm:text-8xl md:text-9xl`.
  - [Dashboard.jsx grid](frontend/src/components/dashboard/Dashboard.jsx): `lg:grid-cols-3` and `xl:grid-cols-[...]`.
  - [TransactionList.jsx table layout](frontend/src/components/dashboard/TransactionList.jsx): desktop table header hidden on small screens with `max-md:hidden`, stacked mobile rows with `md:grid-cols-[...]`.
  - [Settings.jsx layout](frontend/src/components/dashboard/Settings.jsx): `max-md:flex-col`, `max-sm:flex-col`, and `lg:grid-cols-[...]`.

## COULD Requirements

### C1: System consumes at least three external REST web services
Status: not fulfilled in this repository.

- Current external REST service 1: [CurrencyService#convertCurrency](backend/src/main/java/com/moola/backend/services/CurrencyService.java) for Frankfurter.
- Current external REST service 2: [AIService#getFinancialAdvice](backend/src/main/java/com/moola/backend/services/AIService.java) for Groq.
- Frontend-only external request: [TransactionList.jsx BrandIcon](frontend/src/components/dashboard/TransactionList.jsx) loads favicons from `https://www.google.com/s2/favicons`, but this is a direct browser image request, not a backend-managed REST integration.
- I do not see a third backend-managed external REST service in the current repository.

### C2: Backend endpoints return data as JSON and XML
Status: fulfilled for selected feature endpoints.

- JSON is covered by controllers like [AuthController#login](backend/src/main/java/com/moola/backend/controllers/AuthController.java), [TransactionController#getAll](backend/src/main/java/com/moola/backend/controllers/TransactionController.java), and [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java).
- XML support is enabled by the `jackson-dataformat-xml` dependency in [backend/pom.xml](backend/pom.xml).
- [FeatureController#getAutomatedAdvice](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): declares both `application/json` and `application/xml` with `produces`.
- [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): declares both `application/json` and `application/xml` with `produces`.
- Test it with `Accept: application/json` and `Accept: application/xml` on `/api/features/advice` or `/api/features/convert`.
- Current frontend uses JSON only via [api.jsx#readResponseBody](frontend/src/services/api.jsx).

### C3: Backend provides a PATCH endpoint consumed by FE
Status: backend side is fulfilled; frontend consumption is not fulfilled.

Backend PATCH support:
- [TransactionController#patch](backend/src/main/java/com/moola/backend/controllers/TransactionController.java): handles `PATCH /api/transactions/{id}`.
- [TransactionService#patch](backend/src/main/java/com/moola/backend/services/TransactionService.java): applies partial transaction updates.
- [CategoryController#patchCategory](backend/src/main/java/com/moola/backend/controllers/CategoryController.java): handles `PATCH /api/categories/{id}`.
- [CategoryService#patchCategory](backend/src/main/java/com/moola/backend/services/CategoryService.java): applies partial category updates.

Frontend current behavior:
- [updateTransaction](frontend/src/services/api.jsx): uses `PUT /api/transactions/{id}`, not PATCH.
- [updateUserProfile](frontend/src/services/api.jsx): uses `PUT /api/auth/profile`, not PATCH.
- [updateUser](frontend/src/services/api.jsx): uses `PUT /api/admin/users/{id}`, not PATCH.
- No frontend function currently sends `method: "PATCH"`.

To fully satisfy this COULD requirement, add a frontend PATCH call for transaction tag toggles or category partial updates and wire it to the existing backend PATCH endpoints.

## Quick Presentation Route

### Backend route
1. Start at [Application#main](backend/src/main/java/com/moola/backend/Application.java).
2. Show [SecurityConfig#securityFilterChain](backend/src/main/java/com/moola/backend/config/SecurityConfig.java) and [JwtRequestFilter](backend/src/main/java/com/moola/backend/security/JwtRequestFilter.java) for login/session protection.
3. Show [AuthController#login](backend/src/main/java/com/moola/backend/controllers/AuthController.java), [AuthController#updateProfile](backend/src/main/java/com/moola/backend/controllers/AuthController.java), and [JwtUtils#generateToken](backend/src/main/java/com/moola/backend/security/JwtUtils.java).
4. Show [TransactionController](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) for GET, POST, PUT, DELETE, PATCH, and transaction AI advice.
5. Show [TransactionService](backend/src/main/java/com/moola/backend/services/TransactionService.java) for wallet and category business logic.
6. Show [CurrencyService#convertCurrency](backend/src/main/java/com/moola/backend/services/CurrencyService.java) and [AIService#getFinancialAdvice](backend/src/main/java/com/moola/backend/services/AIService.java) for external REST services and advisor tone support.

### Frontend route
1. Start at [frontend/index.html](frontend/index.html) and [frontend/src/main.jsx](frontend/src/main.jsx) to show the standalone HTML/CSS/JS frontend component.
2. Show [frontend/vite.config.js](frontend/vite.config.js) and [api.jsx#request](frontend/src/services/api.jsx) to prove HTTP communication and async `fetch` calls to `/api`.
3. Show [App.jsx handleAuthSubmit](frontend/src/App.jsx) and [session.js](frontend/src/utils/session.js) to prove JWT session handling in the browser.
4. Show [Home.jsx handleSubmit](frontend/src/components/dashboard/Home.jsx) for POST transaction creation and [App.jsx loadTransactions effect](frontend/src/App.jsx) for GET transaction loading.
5. Show [TransactionList.jsx handleSave](frontend/src/components/dashboard/TransactionList.jsx) and [TransactionList.jsx handleDelete](frontend/src/components/dashboard/TransactionList.jsx) for PUT and DELETE usage.
6. Show [AdvisorPanel.jsx handleAskAI](frontend/src/components/dashboard/AdvisorPanel.jsx) for AI advice consumption.
7. Show [AdminPanel.jsx](frontend/src/components/dashboard/AdminPanel.jsx) as the second frontend component calling admin endpoints.
8. Show responsive layout examples in [AuthPanel.jsx](frontend/src/components/auth/AuthPanel.jsx), [Home.jsx](frontend/src/components/dashboard/Home.jsx), and [TransactionList.jsx](frontend/src/components/dashboard/TransactionList.jsx).
