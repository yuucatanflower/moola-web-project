# moola-web-project

test api requests:
http://localhost:8081/swagger-ui/index.html#/
(run server and try different requests)

## Project Vision

The frontend and backend logic are built around several core behavioral features:

* **AI Financial Advisor**: A realistic persona that analyzes spending history to offer unfiltered advice on financial habits.
* **Time/Money Translator**: Calculates the true cost of a purchase by dividing the amount by the user's hourly wage to show cost in hours of work.
* **Behavioral Tagging**: Transactions can be marked with Impulse Buy or Regret tags to generate reports on spending behavior.
* **Safe-to-Spend**: A real-time calculation subtracting recurring bills and essential expenses from the balance to show available discretionary funds.
* **Visual Categories**: Spending tracking using custom colors and descriptors for every category.

---

## Technical Architecture

### Backend Component
* **Framework**: Spring Boot 4.0.3 running on Java 17.
* **Security**: Stateless JWT Authentication via Spring Security.
* **Database**: MySQL hosted on Aiven.
* **Documentation**: Swagger / OpenAPI 3.0 for endpoint testing and documentation.
* **Utilities**: Lombok for automated code generation.

### Frontend Component
* **Framework**: React using functional components and hooks.
* **Styling**: Tailwind CSS for mobile-first, responsive design.
* **Communication**: Axios with interceptors to automatically attach the JWT Authorization header to requests.

---

## Security Implementation

> The system implements several layers of protection to ensure a secure environment:

* **JWT Integrity**: The backend validates token signatures to ensure authenticity; mismatched or tampered tokens are rejected with 401/403 errors.
* **SQL Injection Prevention**: Database queries are parameterized through Spring Data JPA repositories.
* **Input Validation**: Server-side validation ensures only properly formatted data, such as correct date strings and positive amounts, is persisted.
* **SSRF Protection**: External API integrations use hardcoded base URLs to prevent the server from making unauthorized internal requests.

---

## API Reference

All backend endpoints are hosted at http://localhost:8081.

### Authentication
* **POST /api/auth/register**: Create a new user profile.
* **POST /api/auth/login**: Returns an accessToken for subsequent authenticated requests.

### Core Resources
* **GET /api/transactions**: Retrieve the full transaction history for the user.
* **POST /api/transactions**: Create a new transaction linked to a specific category.
* **PUT /api/transactions/{id}**: Update transaction details such as amount or date.
* **PATCH /api/transactions/{id}**: Used for toggling behavioral tags like Regret or Impulse Buy.
* **GET /api/categories**: Retrieve personalized spending categories.

### External Features
* **GET /api/features/advice**: Triggers the AI Advisor to generate behavioral feedback.
* **GET /api/features/convert**: Real-time currency conversion using the Frankfurter API.

---

## Setup Instructions

> Follow these steps to get the environment running:

1. **Clone the Repository**: Ensure Maven and JDK 17 are installed on the local machine.
2. **Environment Variables**: Configure the JWT_SECRET and Aiven MySQL credentials in the application configuration.
3. **Build the Project**: Run mvn clean install to resolve dependencies and compile the source code.
4. **Run the Backend**: Start the Spring Boot application through the IDE or terminal.
5. **Test the API**: Navigate to http://localhost:8081/swagger-ui/index.html to explore and test the available endpoints.

---