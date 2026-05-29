# Project Requirements Explanation Guide

## MUST Requirements

### M1: Backend is an individual component
- `backend/pom.xml`: shows that the backend is its own Maven/Spring Boot project.
- `com.moola.backend.Application#main`: starts the backend server.
- Controllers in `com.moola.backend.controllers`: expose backend HTTP endpoints.

### M2: Frontend is an individual component implemented using HTML5, CSS and JS
- No frontend source files are currently in this repository.
- If the frontend exists outside this repo, show its `index.html`, CSS files, and JS files.
- If it must be added here, create a separate frontend folder and keep it independent from `backend`.

### M3: FE and BE communicate using HTTP(S)
- `SecurityConfig#corsFilter`: allows browser requests from frontend origins.
- Controllers such as `TransactionController`, `CategoryController`, `AuthController`, `FeatureController`, and `WalletController`: provide HTTP endpoints under `/api/...`.
- README API section: lists the backend base URL `http://localhost:8081`.

### M4: FE and BE communicate using asynchronous data transfer (AJAX)
- No frontend AJAX code is currently in this repository.
- In the frontend, look for `fetch(...)`, `XMLHttpRequest`, or Axios calls.
- The backend endpoints are ready for AJAX because they return JSON responses and allow CORS.

### M5: Backend endpoints return JSON or XML
- `AuthController#login`: returns a JSON object with `accessToken` and user data.
- `FeatureController#getAutomatedAdvice`: returns JSON with an `advice` field.
- `FeatureController#convert`: returns JSON with currency conversion data.
- `TransactionController`, `CategoryController`, and `WalletController`: return Java objects/lists that Spring serializes as JSON.

### M6: Backend manages resources using GET, POST, PUT, and DELETE
- `TransactionController#getAll`: GET `/api/transactions`.
- `TransactionController#create`: POST `/api/transactions`.
- `TransactionController#update`: PUT `/api/transactions/{id}`.
- `TransactionController#delete`: DELETE `/api/transactions/{id}`.
- `CategoryController` also supports GET, POST, PUT, and DELETE for `/api/categories`.

### M7: Frontend consumes resources using GET, POST, PUT, and DELETE
- No frontend source files are currently in this repository.
- In the frontend, look for AJAX calls to:
  - GET `/api/transactions` or `/api/categories`
  - POST `/api/transactions` or `/api/categories`
  - PUT `/api/transactions/{id}` or `/api/categories/{id}`
  - DELETE `/api/transactions/{id}` or `/api/categories/{id}`

### M8: System consumes at least one external REST web service
- `CurrencyService#convertCurrency`: calls the external Frankfurter currency API using `RestTemplate#getForObject`.
- `FeatureController#convert`: exposes this feature through `/api/features/convert`.

### M9: System implements session management
- `AuthController#login`: returns a JWT token after successful login.
- `AuthService#login`: checks the password and calls `JwtUtils#generateToken`.
- `JwtUtils`: creates, reads, and validates JWTs.
- `JwtRequestFilter#doFilterInternal`: reads the `Authorization: Bearer ...` header on protected requests.
- `SecurityConfig#filterChain`: makes the app stateless and protects all non-auth endpoints.

## SHOULD Requirements

### S1: System consumes at least two external REST web services
- `CurrencyService#convertCurrency`: Frankfurter API.
- `AIService#getFinancialAdvice`: Groq API for AI financial advice.
- `FeatureController#getAutomatedAdvice`: exposes the AI advice feature.

### S2: System offers a second individual FE component
- No second frontend component is currently in this repository.
- To fulfil this, add a second frontend app/page that calls at least three backend endpoints, for example:
  - GET `/api/transactions`
  - GET `/api/wallet`
  - GET `/api/features/advice`

### S3: FE is W3C compliant
- No frontend source files are currently in this repository.
- Use the W3C validator on the frontend HTML.
- For explanation, point to valid `<!doctype html>`, semantic HTML elements, labels on forms, and fixed validation errors.

### S4: FE is responsive for mobile and desktop
- No frontend source files are currently in this repository.
- In the frontend, look for CSS media queries, flexible layouts, and separate mobile/desktop views.

## COULD Requirements

### C1: System consumes at least three external REST web services
- Currently visible external REST services:
  - Frankfurter API in `CurrencyService#convertCurrency`.
  - Groq API in `AIService#getFinancialAdvice`.
- A third service is not visible in this repository yet.

### C2: Backend endpoints return data as JSON and XML
- Current backend responses are JSON by default.
- To explain XML support, check whether XML dependencies and endpoint `produces` settings are added later.

### C3: Backend provides a PATCH endpoint consumed by FE
- `TransactionController#patch`: PATCH `/api/transactions/{id}`.
- `TransactionService#patch`: updates transaction metadata like description, recurrent, impulse buy, and regret.
- `CategoryController#patch`: PATCH `/api/categories/{id}`.
- `CategoryService#patchCategory`: updates category fields without replacing the whole category.
- Frontend consumption is not visible in this repository, so point to frontend AJAX PATCH code if it exists elsewhere.

## Good Explanation Flow

1. Start with `Application`, then show controllers as the public HTTP layer.
2. Show services as the business logic layer.
3. Show repositories as database access.
4. Show models as the database objects.
5. Show security classes for login, JWT generation, and protected requests.
6. Show `CurrencyService` and `AIService` for external REST APIs.
