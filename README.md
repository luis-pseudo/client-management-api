# Client management API

A RESTful API built with Node.js, Express, and PostgreSQL for managing clients and their associated phone numbers.

This project was developed to demonstrate backend engineering skills, including API design, database modeling, validation, testing, and CI workflows, following real-world backend practices. Have to say, this is my first time doing this, and i think of doing a more projects like this with wider, more complex databases in a near future


---

### Overview

The Client Management API provides a structured way to:

- Manage clients (CRUD operations)
- Associate multiple phone numbers per client
- Add and remove phone numbers independently
- Filter and paginate client data
- Handle errors consistently and predictably

The project follows a layered architecture and emphasizes clean separation of concerns.

### Technical goals & learning outcomes

This repository was built to practice and demonstrate the following abilities:

- REST API design with Express
- PostgreSQL integration using parameterized SQL queries
- Transaction handling (BEGIN / COMMIT / ROLLBACK)
- Reusable request validation via middleware
- Centralized error handling
- Pagination, sorting, and filtering
- Automated testing with Jest and Supertest
- Continuous Integration using GitHub Actions

### Key features

- Clients CRUD
- Phone numbers management
    * Add single or multiple phone numbers
    * Delete individual numbers or all numbers for a client
- Pagination
    * limit, page, sort, and order
- Filtering
    * By state, registration date, or client ID
- Robust validation
    * Request params, query strings, and request bodies
- Transactional integrity
    * Multi-step operations are atomic
- CI pipeline
    * Tests executed automatically on push

### Tech stack

- Runtime: Node.js
- Framework: Express
- Database: PostgreSQL
- Testing: Jest, Supertest
- CI: GitHub Actions

### Project structure

    src/
    ├── controllers/    # HTTP layer
    ├── repositories/   # Database access layer
    ├── middlewares/    # Error handling and shared logic
    ├── errors/         # Custom application errors
    ├── routes/         # API routes
    ├── db/             # 
    └── app.js

This structure mirrors common backend architectures used in production systems.

---

## Getting started
1. Clone the repository
git clone https://github.com/your-username/client-management-api.git
cd client-management-api

2. Install dependencies
`npm install`

3. Configure environment variables

Create a .env file:

    PORT=3000
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=your_user
    DB_PASSWORD=your_password
    DB_NAME=your_database

4. Run the application
`npm start`

The API will be available at:
http://localhost:3000

### Running tests
`npm test`

Tests are executed locally and automatically through GitHub Actions on every push.

---

### Notes for reviewers

This project was built from scratch without generators
SQL queries are written manually to demonstrate database understanding
Error handling and validations are intentionally explicit
The focus is on code quality, structure, and correctness

---

### Project status

This project is in constant improvement and serves as a backend-focused portfolio piece.
Future improvements may include font-end side, authentication, role-based access, or API documentation (OpenAPI).