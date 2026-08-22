# DayFlow Backend

## Overview
This module provides the server-side logic and API layer for the DayFlow HRMS. It handles business rules for employee records, attendance, leave management, payroll, authentication, and admin workflows.

## Responsibilities
- Expose REST APIs for frontend clients
- Enforce role-based permissions and business rules
- Validate and persist HR data in the database
- Process approval workflows and status transitions
- Support secure authentication and session handling

## Core Features
- Authentication and authorization
- Employee management APIs
- Attendance tracking and status updates
- Leave request creation and approval flows
- Payroll and salary-related data access
- Error handling, validation, and audit logging

## Suggested Project Structure
- src/controllers: request handling
- src/routes: API endpoint registration
- src/services: business logic
- src/models: database entities
- src/middleware: auth, validation, logging
- src/config: environment and database config

## Local Setup
```bash
cd dayflow-backend
npm install
copy .env.example .env
npm run start:dev
```

Nest CLI
------

This project is compatible with the Nest CLI. You can run CLI commands without installing globally using `npx`:

```bash
npx @nestjs/cli <command>
# example: npx @nestjs/cli info
```

Common commands:

```bash
# dev server (uses local @nestjs/cli)
npm run start:dev

# build
npm run build

# database schema
npm run prisma:generate
npm run prisma:migrate:status
npm run prisma:migrate:deploy
```
Health endpoints:

- Root: http://localhost:4000
- Health: http://localhost:4000/api/health

## Environment Variables
Example:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/dayflow
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Prisma + Supabase
-----------------

We use Prisma as the ORM and Supabase (Postgres) for hosting the database. Set `DATABASE_URL` to your Supabase connection string (found in the Supabase project settings → Database → Connection string).

After setting `DATABASE_URL`, run the checked-in migration:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:deploy
```

For local schema development, use `npm run prisma:migrate` after reviewing the generated migration. Do not use `prisma db push` for the shared schema because it bypasses migration history.

To run Prisma Studio (inspect data visually):

```bash
npx prisma studio
```

## API Design Notes
- Keep endpoints modular and versioned when needed.
- Use clear validation for leave, attendance, and payroll transitions.
- Apply role checks before executing sensitive actions.
- Return consistent JSON responses for success and error states.

## Implemented API Routes

All routes use the `/api` prefix. Protected routes require `Authorization: Bearer <token>`.

### Authentication

- `POST /api/auth/register` — create an employee account.
- `POST /api/auth/login` — return a short-lived JWT and safe user identity.
- `GET /api/auth/me` — return the current authenticated identity.

### Employee and attendance

- `GET/PATCH /api/employees/me` — view or update the employee's allowed profile fields.
- `GET /api/admin/employees` — HR/Admin employee directory with optional search, department, and active filters.
- `GET/PATCH /api/admin/employees/:id` — HR/Admin employee detail/update.
- `POST /api/attendance/check-in` and `POST /api/attendance/check-out` — record the authenticated employee's day.
- `GET /api/attendance/me` — view personal attendance, optionally filtered by date range.
- `GET /api/admin/attendance` — HR/Admin attendance list filtered by date, status, or employee.

### Leave and payroll

- `POST /api/leave` and `GET /api/leave/me` — submit or view personal leave requests.
- `GET /api/admin/leave` — HR/Admin leave queue with status/type filters.
- `PATCH /api/admin/leave/:id/decision` — approve or reject a pending request with an optional comment.
- `GET /api/payroll/me` — view personal read-only payroll and salary history.
- `GET /api/admin/payroll` — HR/Admin payroll list.
- `PATCH /api/admin/employees/:id/salary-structure` — create an HR/Admin salary version.

### Audit history

- `GET /api/admin/audit-logs` — HR/Admin audit history. Optional filters are `action`, `entity`, `actorId`, `from`, `to`, `page`, and `pageSize` (maximum 100).

The audit response uses `{ items, page, pageSize, total, totalPages }`; each item includes the action, entity, metadata, timestamp, and safe actor summary.

## Verification

Run the dependency-free business-rule tests after dependencies are installed:

```bash
npm test
```

The tests do not seed or connect to PostgreSQL. For a real database workflow, configure `DATABASE_URL`, deploy the checked-in migration, and run the seed command owned by the database-data contributor.

## Related Modules
- Admin dashboard: `dayflow-admin`
- Employee portal: `dayflow-employee`
