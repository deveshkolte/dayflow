# Dayflow — UI Layout & Design System

> **Tagline:** Every workday, perfectly aligned.

## 1. Product Direction

Dayflow is a Human Resource Management System (HRMS) designed to digitize and streamline:
- Employee onboarding
- Profile management
- Attendance tracking
- Leave and time-off management
- Payroll visibility
- HR/Admin approval workflows

The system has two primary user roles:

- **Admin / HR Officer:** Manages employees, approves leave and attendance, and views/updates payroll information.
- **Employee:** Views their profile, attendance, applies for leave, and views salary details.

The UI should feel **professional, calm, warm, structured, and modern**, while keeping HR information easy to scan and actions obvious.

---

# 2. Brand Color Palette

Use these five colors as the core Dayflow palette.

| Color | Hex | Recommended Role |
|---|---|---|
| Deep Brown | `#534332` | Main headings, strong text, important accents |
| Dark Olive | `#394032` | Sidebar, navigation, dark sections |
| Forest Olive | `#454F2D` | Primary buttons, active states, primary actions |
| Muted Olive | `#797F3E` | Secondary accents, icons, charts, highlights |
| Warm Gold | `#9F7E4A` | Accent elements, selected states, badges, emphasis |

### Supporting neutrals

Use neutral colors so the five brand colors do not overwhelm the interface.

- Page background: `#F7F6F1`
- Card background: `#FFFFFF`
- Main text: `#534332`
- Secondary text: `#6D6A61`
- Border: `#DED9CF`
- Disabled: `#B7B2A8`

### Color rule

Do **not** use all five colors equally.

The primary combination should be:

`#394032` + `#454F2D` + neutral backgrounds

Use:

`#534332` + `#797F3E` + `#9F7E4A`

as supporting colors and accents.

---

# 3. Typography

## Main / Heading Font

**Aboreto**

Use for:
- Page titles
- Section headings
- Dashboard headings
- Major numbers where appropriate
- Logo / DAYFLOW wordmark
- Important visual labels

Aboreto should be used selectively because its decorative character makes it more effective for hierarchy than for large amounts of text.

### Examples

```text
DASHBOARD
EMPLOYEE PROFILE
ATTENDANCE
LEAVE REQUESTS
PAYROLL
```

---

## Subheading / Button Font

**Arepy Italic**

Use for:
- Subheadings
- Button labels
- Short calls to action
- Navigation emphasis
- Small section labels where a softer visual style is useful

Examples:

```text
View Attendance
Request Leave
Add Employee
Check In
View Payslip
```

---

## Other Information / Body Font

**Lato Bold**

Use for:
- Body information
- Employee details
- Table content
- Form labels
- Status text
- Supporting descriptions
- Notifications
- Dashboard information

Lato Bold should provide the readability and structure while Aboreto and Arepy Italic create the visual identity.

---

# 4. Overall Layout

The application should use a dashboard-style layout.

```text
┌──────────────────────────────────────────────────────────────┐
│                         TOP HEADER                           │
├────────────────┬─────────────────────────────────────────────┤
│                │                                             │
│    DAYFLOW     │             PAGE CONTENT                    │
│                │                                             │
│  Dashboard     │  Page Heading                               │
│  Profile       │  Short supporting text                      │
│  Attendance    │                                             │
│  Leave         │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  Payroll       │  │  Card   │ │  Card   │ │  Card   │       │
│                │  └─────────┘ └─────────┘ └─────────┘       │
│  ───────────   │                                             │
│  Settings      │  Tables / Forms / Charts / Activity        │
│  Logout        │                                             │
│                │                                             │
└────────────────┴─────────────────────────────────────────────┘
```

### Main layout

- Fixed/collapsible sidebar
- Top header
- Scrollable main content
- Light page background
- White cards
- Consistent spacing
- Rounded cards and controls

---

# 5. Login / Authentication

The requirements specify secure Sign Up / Sign In, email verification, password security rules, and redirecting successful login to the dashboard.

## Login screen

```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                       DAYFLOW                              │
│                                                            │
│                 Welcome Back                               │
│          Sign in to continue to Dayflow                    │
│                                                            │
│  Email                                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Enter your email                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Password                                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ •••••••••••                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                 [ Sign In ]                                │
│                                                            │
│                  Forgot Password?                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Visual treatment

- Background: `#F7F6F1`
- DAYFLOW logo: `#394032`
- Main heading: Aboreto
- Button: `#454F2D`
- Button text: Arepy Italic
- Input information: Lato Bold

---

# 6. Sign Up

The registration screen should support:

- Employee ID
- Email
- Password
- Role: Employee / HR
- Email verification

Use the same visual system as Sign In.

Keep the form compact rather than creating a long single-page form.

---

# 7. Employee Navigation

Employee sidebar:

```text
DAYFLOW

⌂  Dashboard
◎  Profile
◷  Attendance
▣  Leave
₹  Payroll

──────────────

⚙  Settings
↪  Logout
```

The actual icon set should remain consistent throughout the application.

### Active navigation

- Background: `#454F2D`
- Text: `#FFFFFF`
- Optional active indicator: `#9F7E4A`

### Inactive navigation

- Text: light neutral
- Hover: subtle `#797F3E`

---

# 8. Employee Dashboard

The requirements specify quick-access cards for:
- Profile
- Attendance
- Leave Requests
- Logout

The dashboard should also show recent activity or alerts.

## Proposed layout

```text
Good morning, [Employee Name]

Here's your Dayflow overview.

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ PROFILE        │ │ ATTENDANCE     │ │ LEAVE          │
│                │ │                │ │                │
│ View details   │ │ Today's status │ │ 2 requests     │
│ →              │ │ Present        │ │ pending        │
└────────────────┘ └────────────────┘ └────────────────┘

┌────────────────────────────────────┐
│ RECENT ACTIVITY                    │
│                                    │
│ ✓ Attendance marked Present        │
│ ○ Leave request Pending            │
│ ✓ Profile updated                  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ALERTS                             │
│                                    │
│ Upcoming leave / attendance alert  │
└────────────────────────────────────┘
```

### Card design

- White background
- Thin neutral border
- 12–16px radius
- Icon in `#797F3E`
- Heading in Aboreto
- Information in Lato Bold
- Action text in Arepy Italic

---

# 9. Employee Profile

The requirements state that employees can view:
- Personal details
- Job details
- Salary structure
- Documents
- Profile picture

Employees can edit:
- Address
- Phone
- Profile picture

## Layout

```text
EMPLOYEE PROFILE

┌──────────────────────────────────────────────┐
│ [ PROFILE PHOTO ]                            │
│                                              │
│ Employee Name                                │
│ Employee ID                                  │
│ Designation                                  │
│                                              │
│ [ Edit Profile ]                             │
└──────────────────────────────────────────────┘

PERSONAL DETAILS
───────────────────────────────────────────────
Full Name
Email
Phone
Address

JOB DETAILS
───────────────────────────────────────────────
Employee ID
Department
Designation
Joining Date

SALARY STRUCTURE
───────────────────────────────────────────────
Basic Salary
Allowances
Deductions
Net Salary

DOCUMENTS
───────────────────────────────────────────────
Document Name                         [ View ]
Document Name                         [ View ]
```

---

# 10. Attendance

The system must support:
- Daily attendance view
- Weekly attendance view
- Employee check-in
- Employee check-out
- Attendance statuses:
  - Present
  - Absent
  - Half-day
  - Leave

## Employee attendance page

```text
ATTENDANCE

Today's Attendance

┌───────────────────────────────────────────┐
│ Status                                     │
│                                            │
│             PRESENT                        │
│                                            │
│ [ Check In ]          [ Check Out ]       │
└───────────────────────────────────────────┘

DAILY / WEEKLY

[ Daily ] [ Weekly ]

┌──────────────────────────────────────────────┐
│ Date      Check In   Check Out   Status      │
│ Mon       09:00 AM   05:10 PM    Present     │
│ Tue       09:05 AM   05:00 PM    Present     │
│ Wed       —          —           Leave       │
└──────────────────────────────────────────────┘
```

### Status badges

**Present**
- Background: soft olive tint
- Text: `#454F2D`

**Absent**
- Use a restrained error treatment

**Half-day**
- `#9F7E4A`

**Leave**
- `#797F3E`

---

# 11. Admin / HR Dashboard

Admin/HR has management and approval privileges.

The dashboard should prioritize:

- Employee list
- Attendance records
- Leave approvals
- Employee switching
- Payroll visibility

## Layout

```text
ADMIN DASHBOARD

Welcome back, HR Admin

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ EMPLOYEES    │ │ PRESENT      │ │ LEAVE        │
│ 124          │ │ 108          │ │ 16           │
└──────────────┘ └──────────────┘ └──────────────┘

┌────────────────────────────────┐
│ EMPLOYEE LIST                  │
│                                │
│ Search employee...             │
│                                │
│ Name      ID      Status       │
│ Employee  DF01    Active       │
│ Employee  DF02    Active       │
└────────────────────────────────┘

┌────────────────────────────────┐
│ ATTENDANCE                     │
│                                │
│ Daily / Weekly overview        │
└────────────────────────────────┘

┌────────────────────────────────┐
│ PENDING LEAVE APPROVALS        │
│                                │
│ Employee   Dates    [Review]   │
└────────────────────────────────┘
```

---

# 12. Employee Management — Admin

Admin can manage employee information.

## Table

```text
EMPLOYEES

[ Search employee... ]       [ + Add Employee ]

┌──────────────────────────────────────────────────────┐
│ Name       ID       Department     Status    Action  │
├──────────────────────────────────────────────────────┤
│ A. Sharma  DF001    Engineering    Active     •••   │
│ R. Kumar   DF002    Design         Active     •••   │
│ S. Patel   DF003    HR             Active     •••   │
└──────────────────────────────────────────────────────┘
```

Actions can include:
- View
- Edit
- Manage
- Deactivate

---

# 13. Leave & Time-Off

Employees can:
- Select leave type
- Choose date range
- Add remarks

Leave types:
- Paid
- Sick
- Unpaid

Leave status:
- Pending
- Approved
- Rejected

## Employee page

```text
LEAVE

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ PAID LEAVE       │ │ SICK LEAVE       │ │ UNPAID LEAVE     │
│                  │ │                  │ │                  │
│ Remaining: 10    │ │ Remaining: 4     │ │ Remaining: 2     │
└──────────────────┘ └──────────────────┘ └──────────────────┘

[ + REQUEST LEAVE ]

MY REQUESTS

┌───────────────────────────────────────────────────┐
│ Type      Dates          Duration      Status     │
│ Paid      Aug 25–26      2 days        Pending    │
│ Sick      Aug 12         1 day         Approved   │
└───────────────────────────────────────────────────┘
```

## Request Leave form

```text
REQUEST LEAVE

Leave Type       [ Paid ▼ ]
Start Date       [ DD / MM / YYYY ]
End Date         [ DD / MM / YYYY ]
Remarks          [________________________]

[ Cancel ]     [ Submit Request ]
```

---

# 14. Admin Leave Approval

Admin/HR should be able to:
- View all requests
- Approve
- Reject
- Add comments

## Review layout

```text
LEAVE REQUEST

Employee: [Name]
Leave Type: Paid
Date: 25 Aug – 26 Aug
Duration: 2 Days

Employee Remarks:
"Personal work"

Admin Comment:
[________________________________________]

[ Reject ]                         [ Approve ]
```

Approved/rejected changes should be reflected immediately in employee records.

---

# 15. Payroll / Salary

Employees have a **read-only** payroll view.

Admins can:
- View payroll for all employees
- Update salary structure
- Ensure payroll accuracy

## Employee payroll

```text
PAYROLL

CURRENT SALARY

┌───────────────────────────────────┐
│ NET SALARY                         │
│ ₹ XX,XXX                           │
└───────────────────────────────────┘

SALARY STRUCTURE

Basic Salary              ₹ XX,XXX
Allowances                ₹ XX,XXX
Deductions                ₹ XX,XXX
──────────────────────────────────
Net Salary                ₹ XX,XXX

[ View Salary Details ]
```

## Admin payroll

```text
PAYROLL MANAGEMENT

[ Search employee... ]

┌──────────────────────────────────────────────────────┐
│ Employee    Basic    Allowance    Deduction   Net   │
│ A. Sharma   ₹XX      ₹XX         ₹XX          ₹XX   │
│ R. Kumar    ₹XX      ₹XX         ₹XX          ₹XX   │
└──────────────────────────────────────────────────────┘

[ Update Salary Structure ]
```

---

# 16. Notifications & Alerts

The requirements include email and notification alerts.

Use a notification area in the top header.

Examples:
- Leave request approved
- Leave request rejected
- Attendance reminder
- Payroll update
- Profile update

Notification styling should be subtle.

Use `#9F7E4A` for important attention states without turning every notification into a warning.

---

# 17. Analytics & Reports

The requirements specify an analytics/reports dashboard, including reports such as:
- Salary slips
- Attendance reports

## Reports page

```text
REPORTS

[ Attendance Report ]
[ Salary Slip ]
[ Payroll Report ]

┌───────────────────────────────────────────────┐
│ ATTENDANCE OVERVIEW                            │
│                                               │
│              Chart                            │
│                                               │
└───────────────────────────────────────────────┘

[ Export Report ]
```

Charts should primarily use:
- `#454F2D`
- `#797F3E`
- `#9F7E4A`

Avoid using unrelated colors unless required to distinguish statuses.

---

# 18. Buttons

## Primary

**Background:** `#454F2D`

**Text:** `#FFFFFF`

**Font:** Arepy Italic

Examples:
- `Sign In`
- `Submit Request`
- `Check In`
- `Approve`
- `Add Employee`

## Secondary

**Background:** transparent / white

**Border:** `#797F3E`

**Text:** `#454F2D`

Examples:
- `Cancel`
- `View Details`
- `Edit`

## Accent

Use `#9F7E4A` for:
- Special highlights
- Selected tabs
- Important non-destructive emphasis

Do not use the gold color for every button.

---

# 19. Cards

Card properties:

- Background: `#FFFFFF`
- Border: `#DED9CF`
- Radius: 12–16px
- Padding: 20–24px
- Minimal shadow
- Consistent spacing

### Card hierarchy

**Card heading:** Aboreto

**Card information:** Lato Bold

**Card action:** Arepy Italic

---

# 20. Forms

Inputs should be simple and consistent.

```text
LABEL
┌──────────────────────────────────────┐
│ Enter information                    │
└──────────────────────────────────────┘
```

### Input styling

- Background: `#FFFFFF`
- Border: `#DED9CF`
- Text: `#534332`
- Radius: 8–10px
- Focus border: `#797F3E`

Labels: Lato Bold

Buttons: Arepy Italic

---

# 21. Tables

Tables are important for Admin/HR screens.

Use:

- White table background
- Neutral borders
- Clear header row
- Comfortable row height
- Status badges
- Search/filter controls above the table

### Table hierarchy

Header: Aboreto or Lato Bold

Information: Lato Bold

Actions: Arepy Italic

---

# 22. Status System

Keep status colors consistent across the application.

| Status | Treatment |
|---|---|
| Present | `#454F2D` |
| Approved | `#454F2D` |
| Pending | `#9F7E4A` |
| Leave | `#797F3E` |
| Half-day | `#9F7E4A` |
| Rejected | Neutral/error treatment |
| Absent | Neutral/error treatment |

The five-brand-color palette should remain the visual identity; status colors should not introduce unnecessary visual noise.

---

# 23. Responsive Layout

### Desktop

```text
Sidebar | Main Content
```

### Tablet

- Collapsible sidebar
- Two-column cards
- Tables remain readable

### Mobile

```text
Top Header
────────────
Page Content
────────────
Bottom / Collapsible Navigation
```

Tables should either scroll horizontally or transform into stacked cards.

---

# 24. Suggested Figma Frames

Create the UI design in this order:

## Authentication
1. Sign In
2. Sign Up
3. Email Verification
4. Authentication Error State

## Employee
5. Employee Dashboard
6. Employee Profile
7. Edit Profile
8. Attendance — Daily
9. Attendance — Weekly
10. Leave
11. Request Leave
12. Leave Request Details
13. Payroll
14. Notifications

## Admin / HR
15. Admin Dashboard
16. Employee List
17. Employee Details
18. Edit Employee
19. Attendance Management
20. Leave Requests
21. Leave Approval
22. Payroll Management
23. Reports / Analytics
24. Notifications

## Design System
25. Color Palette
26. Typography
27. Buttons
28. Inputs
29. Cards
30. Tables
31. Status Badges
32. Navigation

---

# 25. Final Visual Direction

Dayflow should visually communicate:

**Organized · Reliable · Warm · Professional · Simple**

The strongest identity should come from:

### Primary
`#394032`
`#454F2D`

### Secondary
`#534332`
`#797F3E`

### Accent
`#9F7E4A`

### Typography
- **Aboreto** → main headings
- **Arepy Italic** → subheadings and buttons
- **Lato Bold** → all other information and supporting text

Keep the main content area light, spacious, and highly readable. The dark olive and brown colors should establish the brand identity through navigation and hierarchy rather than covering the entire interface.

Most importantly, **design only the screens and functionality supported by the Dayflow requirements**. The core scope is authentication, role-based access, profiles, attendance, leave/time-off, payroll, approvals, notifications, and reports.
