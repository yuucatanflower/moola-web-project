# Project Requirements Explanation Guide

Use this as a click-through checklist for the presentation. Backend requirements have direct links to the class or method you can open and explain. Frontend requirements are marked separately because this repository currently does not contain HTML, CSS, or JS frontend files.

## MUST Requirements

### M1: Backend is an individual component
Status: fulfilled in this repository.

- [backend/pom.xml](backend/pom.xml): shows the backend is its own Maven/Spring Boot project.
- [Application#main](backend/src/main/java/com/moola/backend/Application.java): starts the Spring Boot backend.
- [TransactionController](backend/src/main/java/com/moola/backend/controllers/TransactionController.java), [CategoryController](backend/src/main/java/com/moola/backend/controllers/CategoryController.java), [AuthController](backend/src/main/java/com/moola/backend/controllers/AuthController.java), [FeatureController](backend/src/main/java/com/moola/backend/controllers/FeatureController.java), [WalletController](backend/src/main/java/com/moola/backend/controllers/WalletController.java), and [AdminController](backend/src/main/java/com/moola/backend/controllers/AdminController.java): show the backend HTTP layer.

### M2: Frontend is an individual component implemented using HTML5, CSS and JS
Status: not verifiable in this repository.

- I checked the workspace and there are no `.html`, `.css`, `.js`, `.jsx`, `.ts`, or `.tsx` frontend files.
- If the frontend exists somewhere else, use its `index.html`, CSS files, and JS files as proof.
- If it must be submitted in this repository, add a separate frontend folder next to `backend`.

### M3: FE and BE communicate using HTTP(S)
Status: backend side is fulfilled, frontend side is not verifiable here.

- [SecurityConfig#corsConfigurationSource](backend/src/main/java/com/moola/backend/config/SecurityConfig.java): allows browser origins and HTTP methods.
- [TransactionController](backend/src/main/java/com/moola/backend/controllers/TransactionController.java): exposes `/api/transactions`.
- [CategoryController](backend/src/main/java/com/moola/backend/controllers/CategoryController.java): exposes `/api/categories`.
- [AuthController](backend/src/main/java/com/moola/backend/controllers/AuthController.java): exposes `/api/auth`.
- [FeatureController](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): exposes `/api/features`.
- [WalletController](backend/src/main/java/com/moola/backend/controllers/WalletController.java): exposes `/api/wallet`.

### M4: FE and BE communicate using asynchronous data transfer (AJAX)
Status: not verifiable in this repository.

- No frontend AJAX code is present here.
- In the frontend, look for `fetch(...)`, `XMLHttpRequest`, or Axios calls.
- Backend endpoints are ready for AJAX because they return JSON and CORS is configured in [SecurityConfig#corsConfigurationSource](backend/src/main/java/com/moola/backend/config/SecurityConfig.java).

### M5: Backend endpoints return data as JSON or XML
Status: fulfilled as JSON.

- [AuthController#login](backend/src/main/java/com/moola/backend/controllers/AuthController.java): returns a `Map` with `accessToken` and user data, serialized as JSON.
- [FeatureController#getAutomatedAdvice](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): returns JSON with an `advice` value.
- [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): returns JSON with converted currency data.
- [TransactionController#getAll](backend/src/main/java/com/moola/backend/controllers/TransactionController.java): returns a JSON array of transactions.
- [CategoryController#getAllCategories](backend/src/main/java/com/moola/backend/controllers/CategoryController.java): returns a JSON array of categories.
- [WalletController#getWallet](backend/src/main/java/com/moola/backend/controllers/WalletController.java): returns wallet data as JSON.

### M6: Backend manages resources using GET, POST, PUT, and DELETE
Status: fulfilled.

- GET: [TransactionController#getAll](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `GET /api/transactions`.
- POST: [TransactionController#create](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `POST /api/transactions`.
- PUT: [TransactionController#update](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `PUT /api/transactions/{id}`.
- DELETE: [TransactionController#delete](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) handles `DELETE /api/transactions/{id}`.
- Another full CRUD example is [CategoryController](backend/src/main/java/com/moola/backend/controllers/CategoryController.java), with GET at line 32, POST at line 37, PUT at line 42, DELETE at line 47, and PATCH at line 52.

### M7: Frontend consumes resources using GET, POST, PUT, and DELETE
Status: not verifiable in this repository.

- No frontend source files are present here.
- In the frontend, look for AJAX calls to:
- `GET /api/transactions` or `GET /api/categories`
- `POST /api/transactions` or `POST /api/categories`
- `PUT /api/transactions/{id}` or `PUT /api/categories/{id}`
- `DELETE /api/transactions/{id}` or `DELETE /api/categories/{id}`

### M8: System consumes at least one external REST web service
Status: fulfilled.

- [CurrencyService#convertCurrency](backend/src/main/java/com/moola/backend/services/CurrencyService.java): calls the external Frankfurter currency API.
- [CurrencyService RestTemplate call](backend/src/main/java/com/moola/backend/services/CurrencyService.java): uses `restTemplate.getForObject(...)`.
- [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): exposes the currency feature through `/api/features/convert`.

### M9: System implements session management
Status: fulfilled with JWT.

- [AuthController#login](backend/src/main/java/com/moola/backend/controllers/AuthController.java): returns the JWT token to the client.
- [AuthService#login](backend/src/main/java/com/moola/backend/services/AuthService.java): checks the username and password.
- [AuthService token creation](backend/src/main/java/com/moola/backend/services/AuthService.java): calls `jwtUtils.generateToken(...)`.
- [JwtUtils#generateToken](backend/src/main/java/com/moola/backend/security/JwtUtils.java): creates the JWT.
- [JwtUtils#getUsernameFromToken](backend/src/main/java/com/moola/backend/security/JwtUtils.java): reads the username from a JWT.
- [JwtUtils#validateToken](backend/src/main/java/com/moola/backend/security/JwtUtils.java): validates a JWT.
- [JwtRequestFilter](backend/src/main/java/com/moola/backend/security/JwtRequestFilter.java): reads the `Authorization: Bearer ...` header for protected requests.
- [SecurityConfig#securityFilterChain](backend/src/main/java/com/moola/backend/config/SecurityConfig.java): makes the backend stateless and protects non-auth endpoints.

## SHOULD Requirements

### S1: System consumes at least two external REST web services
Status: fulfilled.

- [CurrencyService#convertCurrency](backend/src/main/java/com/moola/backend/services/CurrencyService.java): uses the Frankfurter API.
- [AIService#getFinancialAdvice](backend/src/main/java/com/moola/backend/services/AIService.java): uses the Groq API.
- [AIService RestTemplate call](backend/src/main/java/com/moola/backend/services/AIService.java): calls Groq with `restTemplate.postForEntity(...)`.
- [FeatureController#getAutomatedAdvice](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): exposes AI advice through `/api/features/advice`.
- [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java): exposes currency conversion through `/api/features/convert`.

### S2: System offers a second individual FE component
Status: not verifiable in this repository.

- No first or second frontend component is present here.
- A second frontend component could prove itself by calling at least three backend endpoints, for example:
- [TransactionController#getAll](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) for `GET /api/transactions`.
- [WalletController#getWallet](backend/src/main/java/com/moola/backend/controllers/WalletController.java) for `GET /api/wallet`.
- [FeatureController#getAutomatedAdvice](backend/src/main/java/com/moola/backend/controllers/FeatureController.java) for `GET /api/features/advice`.

### S3: FE is W3C compliant
Status: not verifiable in this repository.

- No frontend HTML files are present here.
- Use the W3C validator on the actual frontend HTML.
- For proof, point to valid `<!doctype html>`, semantic elements, form labels, and fixed validation errors in the frontend.

### S4: FE is responsive for mobile and desktop
Status: not verifiable in this repository.

- No frontend CSS files are present here.
- In the frontend, look for media queries, flexible layouts, and separate mobile/desktop behavior.

## COULD Requirements

### C1: System consumes at least three external REST web services
Status: not fulfilled in this repository.

- Current external REST service 1: [CurrencyService#convertCurrency](backend/src/main/java/com/moola/backend/services/CurrencyService.java) for Frankfurter.
- Current external REST service 2: [AIService#getFinancialAdvice](backend/src/main/java/com/moola/backend/services/AIService.java) for Groq.
- I do not see a third external REST service in the current repository.

### C2: Backend endpoints return data as JSON and XML
Status: not fulfilled in this repository.

- JSON is covered by controllers like [AuthController#login](backend/src/main/java/com/moola/backend/controllers/AuthController.java), [TransactionController#getAll](backend/src/main/java/com/moola/backend/controllers/TransactionController.java), and [FeatureController#convert](backend/src/main/java/com/moola/backend/controllers/FeatureController.java).
- I did not find XML response configuration, `produces = ...xml`, or a Jackson XML dependency in [backend/pom.xml](backend/pom.xml).

### C3: Backend provides a PATCH endpoint consumed by FE
Status: backend side is fulfilled, frontend consumption is not verifiable here.

- [TransactionController#patch](backend/src/main/java/com/moola/backend/controllers/TransactionController.java): handles `PATCH /api/transactions/{id}`.
- [TransactionService#patch](backend/src/main/java/com/moola/backend/services/TransactionService.java): applies partial transaction updates.
- [CategoryController#patchCategory](backend/src/main/java/com/moola/backend/controllers/CategoryController.java): handles `PATCH /api/categories/{id}`.
- [CategoryService#patchCategory](backend/src/main/java/com/moola/backend/services/CategoryService.java): applies partial category updates.
- Frontend PATCH consumption is not visible because no frontend source files are present here.

## Quick Presentation Route

1. Start at [Application#main](backend/src/main/java/com/moola/backend/Application.java).
2. Show [SecurityConfig#securityFilterChain](backend/src/main/java/com/moola/backend/config/SecurityConfig.java) and [JwtRequestFilter](backend/src/main/java/com/moola/backend/security/JwtRequestFilter.java) for login/session protection.
3. Show [AuthController#login](backend/src/main/java/com/moola/backend/controllers/AuthController.java) and [JwtUtils#generateToken](backend/src/main/java/com/moola/backend/security/JwtUtils.java).
4. Show [TransactionController](backend/src/main/java/com/moola/backend/controllers/TransactionController.java) for GET, POST, PUT, DELETE, and PATCH.
5. Show [TransactionService](backend/src/main/java/com/moola/backend/services/TransactionService.java) for wallet and category business logic.
6. Show [CurrencyService#convertCurrency](backend/src/main/java/com/moola/backend/services/CurrencyService.java) and [AIService#getFinancialAdvice](backend/src/main/java/com/moola/backend/services/AIService.java) for external REST services.
