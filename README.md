# Finance-Backend

Backend service for a finance dashboard with role-based access, financial records, and dashboard summaries.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- In-memory rate limiting

## Setup
1. Install dependencies:
	```bash
	npm install
	```
2. Set environment variables:
	```bash
	export MONGODB_URI="mongodb://127.0.0.1:27017/finance_dashboard"
	export PORT=3000
	```
3. Start the server:
	```bash
	npm run server
	```

## Authentication (Mock)
All protected endpoints require the `x-user-id` header. Use an existing user id from the database.

Roles:
- Viewer: Can view summaries and trends
- Analyst: Can view records and filters + viewer permissions
- Admin: Full access, including user management and record CRUD

## API Overview
Base URL: `/api`

### Users (Admin only)
- `POST /users` create user
- `GET /users` list users (pagination)
- `GET /users/:id` get user
- `PUT /users/:id` update user
- `DELETE /users/:id` deactivate user

Payload example:
```json
{
  "username": "emma",
  "email": "emma@example.com",
  "password": "password123",
  "role": "Analyst",
  "isActive": true
}
```

### Records
- `POST /records` create record (Admin)
- `PUT /records/:id` update record (Admin)
- `DELETE /records/:id` soft delete record (Admin)
- `GET /records` list records (Analyst)
- `GET /records/:id` get record (Analyst)
- `GET /records/filters` filter records (Analyst)

### Dashboard (Viewer+)
- `GET /dashboard/summary` dashboard summary
- `GET /dashboard/trends` trends

Record payload example:
```json
{
  "amount": 2500,
  "type": "Income",
  "category": "Salary",
  "date": "2026-04-01",
  "description": "Monthly salary"
}
```

Filter parameters:
- `type`, `category`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `search`, `page`, `limit`

Trends parameters:
- `interval`: `month` or `week`
- `last`: number of periods (default 6)

## Optional Enhancements Included
- Pagination for list endpoints
- Filtering and search
- Soft delete for records
- Rate limiting middleware
- Basic input validation and consistent error responses

## Assumptions & Notes
- Passwords are hashed with SHA-256 for demonstration only (not production safe).
- Authentication is mock header-based to keep the focus on access control and API design.
- Records are not scoped per user; admins/analysts can view all records.

## Example Request (cURL)
```bash
curl -H "x-user-id=REPLACE_USER_ID" http://localhost:3000/api/records/summary
```