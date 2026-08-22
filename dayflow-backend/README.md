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

# prisma (if added)
npm run prisma:generate
npm run prisma:migrate
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

After setting `DATABASE_URL`, run:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

To run Prisma Studio (inspect data visually):

```bash
npx prisma studio
```

## API Design Notes
- Keep endpoints modular and versioned when needed.
- Use clear validation for leave, attendance, and payroll transitions.
- Apply role checks before executing sensitive actions.
- Return consistent JSON responses for success and error states.

## Related Modules
- Admin dashboard: `dayflow-admin`
- Employee portal: `dayflow-employee`
