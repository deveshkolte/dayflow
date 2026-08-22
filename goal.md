# Dayflow HRMS — Hackathon Goal

## Goal

Deliver a reliable, polished MVP of Dayflow, a role-based Human Resource Management System that connects a real frontend to a NestJS API and PostgreSQL database.

The product must let an employee sign in, view their information, record attendance, submit leave, and view payroll details. An HR/Admin user must be able to view employees and attendance, review leave requests, approve or reject them with a comment, and update salary structures.

The primary proof of success is one complete workflow using live persisted data:

```text
Employee login
  → submit leave request
  → request is stored as PENDING
  → HR/Admin reviews it
  → HR/Admin approves or rejects it with a comment
  → employee sees the updated status
  → database reflects the change
```

## Current baseline

- A Prisma PostgreSQL schema exists in `dayflow-backend/prisma/schema.prisma`.
- A minimal NestJS backend exists, but the business modules and endpoints are not yet implemented.
- `dayflow-admin` and `dayflow-employee` currently contain only README files; frontend implementation is still required.
- The root repository does not yet have a complete setup, API, testing, or demo workflow.

## Scope priority

### P0 — Required for the MVP

- Secure sign-up/sign-in with hashed passwords and session/token handling.
- Role-based access for `EMPLOYEE`, `HR`, and `ADMIN`.
- Employee dashboard and profile view/edit with field-level permissions.
- Employee attendance check-in/check-out and daily/weekly views.
- Employee leave application for paid, sick, and unpaid leave.
- HR/Admin leave list with valid approve/reject transitions and comments.
- Employee read-only payroll/salary visibility.
- HR/Admin employee directory, attendance visibility, and salary structure updates.
- Client-side and server-side validation.
- Real PostgreSQL persistence through Prisma; no mocked core data.
- Loading, empty, error, success, disabled, responsive, and accessible UI states.

### P1 — Add only after every P0 flow works

- Employee 360 view.
- HR action center.
- Leave balance/calendar.
- Attendance correction workflow.
- Notifications.
- Audit trail presentation.
- Search, filtering, and pagination.
- Basic workforce analytics.

### P2 — Out of the MVP unless all P0/P1 work is stable

- Advanced email infrastructure.
- Complex payroll calculations.
- Advanced reporting or salary-slip generation.
- AI chatbot.
- Real-time infrastructure.
- Unnecessary third-party integrations.

## Roles and permissions

| Capability | Employee | HR | Admin |
|---|---:|---:|---:|
| View own profile | Yes | Yes | Yes |
| Edit own phone, address, and picture | Yes | Yes | Yes |
| Edit any employee profile | No | Yes | Yes |
| View own attendance | Yes | Yes | Yes |
| View all attendance | No | Yes | Yes |
| Check in/check out for self | Yes | Yes | Yes |
| Apply for leave | Yes | Yes | Yes |
| View all leave requests | No | Yes | Yes |
| Approve/reject leave | No | Yes | Yes |
| View own payroll | Yes, read-only | Yes | Yes |
| Update salary structure | No | Yes | Yes |

Authorization must be enforced by the backend. Hiding a button in the frontend is not sufficient.

## Core business rules

- Email and employee ID are unique.
- Passwords are never stored or returned in plaintext.
- Employees can access only their own attendance, leave, profile, and payroll data.
- A leave request starts as `PENDING` and may transition only to `APPROVED` or `REJECTED`.
- An approved or rejected leave request cannot be finalized again through an arbitrary update.
- An employee cannot approve their own leave request.
- Check-in cannot create a duplicate attendance record for the same employee and date.
- Check-out is invalid without a matching check-in.
- Leave end date cannot precede its start date.
- Finalized leave decisions record the approver and optional comment.
- Important uniqueness and relationship rules are enforced by the database as well as the API.
- Important mutations are safe against duplicate form submissions.

## Target architecture

```text
Frontend
  → API client
  → NestJS controllers
  → Auth/authorization guards
  → Services containing business rules
  → Prisma repositories/data access
  → PostgreSQL
```

Keep UI, API calls, validation, business logic, and persistence responsibilities separate. Use the existing Prisma models where they satisfy the requirements; change the schema only when a demonstrated requirement or integrity issue requires it.

## Minimum API contract

The exact route naming may follow the implemented project convention, but the contract must cover these operations:

| Area | Required operations |
|---|---|
| Auth | Register, login, current user, logout/session invalidation |
| Employees | Get own profile, update allowed fields, HR/Admin list/detail/update |
| Attendance | Check in, check out, own daily/weekly view, HR/Admin list/filter |
| Leave | Create request, own list/detail, HR/Admin list, approve, reject |
| Payroll | Own read-only records, HR/Admin list, salary structure update |

Every endpoint must define authentication, authorization, inputs, validation, success response, and expected error cases. Responses and errors should follow one consistent project-wide shape.

## Delivery phases

### Phase 1 — Understand and freeze the design

- Confirm the problem statement, roles, workflows, assumptions, and P0 boundary.
- Review the existing Prisma schema and identify only necessary changes.
- Draw the ER diagram and leave state machine.
- Freeze the initial API contract.
- Assign substantial ownership areas to all four contributors. Keep the exact identity-to-role mapping in the private, uncommitted `.team-local.md` file.

### Phase 2 — Backend foundation

- Configure environment variables and PostgreSQL.
- Generate and migrate Prisma schema.
- Add auth, password hashing, JWT/session handling, guards, DTO validation, and safe error handling.
- Implement employee, attendance, leave, and payroll services/controllers.
- Add realistic seed data for employee and HR/Admin demo accounts.

### Phase 3 — Frontend and live integration

- Build employee and HR/Admin dashboards with a consistent responsive design.
- Centralize API access and authentication state.
- Implement forms with inline validation and duplicate-submit protection.
- Connect all P0 screens to live API responses and persisted database records.
- Add loading, empty, error, success, and disabled states.

### Phase 4 — Verification and polish

- Test the full employee-to-HR leave workflow.
- Test authorization boundaries, invalid inputs, duplicate attendance, invalid dates, and finalized leave requests.
- Remove console errors, dead code, unused imports, fake data, and unfinished placeholders.
- Verify responsive behavior, keyboard navigation, labels, focus states, contrast, and clear feedback.
- Add pagination/filtering where a list can grow large.
- Align README and `.env.example` with the actual implementation.

### Phase 5 — Freeze and demonstrate

- Keep `main` runnable and merge all meaningful work.
- Verify genuine contributions from all four GitHub accounts; do not create artificial commits.
- Freeze code before the stated deadline.
- Record a concise demo proving the UI flow, database mutation, state transition, and repository architecture.

## Acceptance criteria

The goal is achieved only when all of the following are true:

- A fresh setup can run the backend, frontend, and database using documented commands.
- A valid employee can log in and reach the employee dashboard.
- An employee can check in and check out once per day, and the result persists after refresh.
- An employee can submit a valid leave request and see `PENDING`.
- An HR/Admin user can see that request, approve or reject it with a comment, and the employee sees the result after refresh.
- Unauthorized requests are rejected by the backend, including direct API calls.
- Employee payroll data is read-only to employees.
- HR/Admin salary updates persist and are visible in the appropriate view.
- Invalid dates, missing fields, duplicate submissions, missing records, and invalid status transitions return actionable errors.
- Core screens use live API/database data rather than static JSON.
- The schema has appropriate relations, constraints, timestamps, and useful indexes.
- The UI handles normal, loading, empty, error, success, and disabled states.
- The application is usable on desktop and smaller screens and has basic keyboard/accessibility support.
- The README documents the problem, architecture, setup, environment variables, API overview, and demo credentials where appropriate.
- All four contributors have genuine, meaningful commits and no secrets are committed.

## Demo script

1. Briefly explain the HRMS problem, roles, stack, and architecture.
2. Log in as an employee and show the dashboard, profile, attendance action, and leave form.
3. Submit leave and show the `PENDING` state.
4. Switch to HR/Admin, review the request, and approve/reject it with a comment.
5. Return to the employee view and show the updated status.
6. Open PostgreSQL tooling and prove the created/updated rows and status transition.
7. Show the repository structure, API modules, Prisma schema, validation, and authorization.

## Explicit non-goals

Do not add a feature, table, dependency, service, cache, queue, real-time system, or integration unless it satisfies a current requirement or a clear security, integrity, reliability, or performance need. A smaller complete business loop is more valuable than unfinished breadth.

## Working rule for every significant change

Before coding: explain the requirement, inspect the relevant current code, apply the YAGNI check, describe the logic and state transitions, list files and API/data changes, identify edge cases, and state security/performance impact.

After coding: explain what changed, why, what was intentionally left unchanged, assumptions, limitations, and how the change was verified.

