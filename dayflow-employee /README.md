# DayFlow Employee

## Overview
This module provides the employee-facing portal for the DayFlow HRMS. It allows employees to manage personal information, track attendance, submit leave requests, and review relevant HR updates.

## Responsibilities
- Provide employee self-service access
- Allow profile and personal detail updates
- Support attendance and leave submissions
- Display payroll and approval status
- Improve transparency for employee-facing HR workflows

## Core Features
- Employee login and profile dashboard
- Attendance summary and check-in/check-out views
- Leave request creation and tracking
- HR notices and status notifications
- Access to employee-specific payroll information

## Suggested Project Structure
- src/components: shared UI components
- src/pages: dashboard and employee screens
- src/services: API integration
- src/hooks: reusable frontend logic
- src/utils: formatting and validation helpers

## Local Setup
```bash
cd "dayflow-employee "
npm install
npm run dev
```

## Environment Variables
Example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=DayFlow Employee
```

## UX Notes
- Keep employee actions simple and easy to complete.
- Show clear visibility for leave status and attendance summaries.
- Make self-service flows accessible and mobile-friendly.

## Related Modules
- Admin dashboard: `dayflow-admin`
- Backend API: `dayflow-backend`
