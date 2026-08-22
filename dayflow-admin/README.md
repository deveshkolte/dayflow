# DayFlow Admin

## Overview
This module contains the administrative dashboard for the DayFlow HRMS. It is designed for HR managers and system admins to manage employee records, approvals, attendance, leave requests, payroll visibility, and platform settings.

## Responsibilities
- Manage employee onboarding and profile updates
- Review and approve leave or attendance requests
- Monitor team attendance and status summaries
- Handle HR workflows and escalations
- Configure core system settings and access permissions

## Core Features
- Admin login and role-based access control
- Employee directory and profile management
- Attendance overview and reporting
- Leave approval workflows
- Payroll and compensation visibility
- Audit-friendly operational dashboard

## Suggested Project Structure
- src/components: reusable UI components
- src/pages: dashboard pages and administration screens
- src/services: API integration
- src/store: app state management
- src/utils: shared helpers and formatting logic

## Local Setup
```bash
cd dayflow-admin
npm install
npm run dev
```

## Environment Variables
Create a `.env` file with values such as:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=DayFlow Admin
```

## Development Notes
- Keep access control strict and role-aware.
- Show clear statuses for approvals and pending actions.
- Ensure the admin UI remains responsive and easy to audit.
- Prefer reusable components for repeated HR dashboards.

## Related Modules
- Backend API: `dayflow-backend`
- Employee portal: `dayflow-employee`
