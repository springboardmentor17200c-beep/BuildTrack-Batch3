# BuildTrack - Construction Project Management & Site Monitoring Platform

BuildTrack is a responsive, modern Angular 18 frontend dashboard designed to streamline construction project operations. The platform enables stakeholders (Administrators, Project Managers, Site Engineers, Contractors, and Clients) to collaborate on project scheduling, resource deployments, material inventory, workforce attendance, and cost expenditures in real time.

This project was built to meet the complete frontend requirements of **Milestone 1** of the BuildTrack Specification.

---

## Technical Stack & Architecture

- **Framework**: Angular 18 (using Standalone Components, Reactive Forms, and Router APIs)
- **UI Frameworks**: Angular Material 18 & Bootstrap 5
- **Icons**: Material Icons & Bootstrap Icons
- **Graphs**: Custom HTML5 Canvas-drawn high-resolution responsive charts (Budget burn, Workforce distribution, cost metrics)
- **Styling**: Vanilla CSS custom variables (curated slate-charcoal and construction amber palette)
- **State Management**: RxJS BehaviorSubjects for reactive session caching and simulated JWT authentication

---

## Repository Directory Map

```text
buildtrack/
├── docs/
│   └── database_schema.md      <-- Finalized DB Schema design for backend developers
├── public/                     <-- Static assets
└── src/
    ├── app/
    │   ├── core/
    │   │   ├── guards/
    │   │   │   └── auth.guard.ts        <-- Role-based route guard
    │   │   └── services/
    │   │       └── auth.service.ts      <-- Simulated authentication & role switcher logic
    │   ├── features/
    │   │   ├── auth/                    <-- Login, Register, Forgot Password
    │   │   ├── dashboards/              <-- Admin, PM, Site Engineer, Contractor, Client Dashboards
    │   │   ├── projects/                <-- Project List, Project Details
    │   │   ├── resources/               <-- Equipment Deployment Management
    │   │   ├── inventory/               <-- Material sensor trackers & procurement
    │   │   ├── workforce/               <-- Attendance registry & check-in
    │   │   └── analytics/               <-- YTD Outlay cost reports
    │   ├── shared/
    │   │   └── components/
    │   │       ├── layout/              <-- Master Page Layout wrapper
    │   │       ├── navbar/              <-- Responsive top header with alerts
    │   │       └── sidebar/             <-- Collapsible navigation sidebar
    │   ├── app.component.ts
    │   ├── app.config.ts
    │   └── app.routes.ts                <-- Dynamic route path mappings
    ├── index.html
    └── styles.css                       <-- Palette tokens & layout overrides
```

---

## Getting Started

### Prerequisites

You need Node.js (version 18 or 20+) installed on your machine.

### Installation

1. Clone or download the repository to your workspace.
2. Install the node modules:
   ```bash
   npm install
   ```
3. Run the development server locally:
   ```bash
   npx ng serve
   ```
4. Navigate to `http://localhost:4200` in your web browser.

### Verification Build

To check the production build compilation with zero errors:
```bash
npx ng build
```

---

## Role-Based Access Testing (Simulation)

To make grading and verification easy during reviews, the **Login Page** contains a **"Quick Login"** selector dock. Clicking any of the roles will instantly authenticate you and direct you to the corresponding dashboard:

1. **Administrator**: Manage system users (lock accounts, delete members), monitor platform API rates, and review security audit logs.
2. **Project Manager**: Access portfolio costs, check critical site warnings, and view canvas-drawn outlay vs schedule graphs.
3. **Site Engineer**: Submit daily progress logs, review structural inspection reports, and confirm safety protocol signoffs.
4. **Contractor**: Request machinery requisition deployments and monitor active excavator/crane statuses.
5. **Client / Owner**: Check vertical project milestone progress, review balances/invoice details, and view site updates.
