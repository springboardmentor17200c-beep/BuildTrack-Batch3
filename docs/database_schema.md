# BuildTrack - Database Schema Design (Milestone 1)

This document describes the finalized database schema for the BuildTrack Construction Project Management & Site Monitoring Platform.

Milestone 1 defines the following 10 core database entities:

1. `users`
2. `projects`
3. `project_milestones`
4. `resources`
5. `inventory`
6. `workers`
7. `attendance`
8. `procurements`
9. `notifications`
10. `reports`

The database is designed for PostgreSQL and uses primary keys, foreign keys, constraints, indexes, and relationships to maintain data integrity.

> **Note:** This document represents the Milestone 1 core schema. Additional tables introduced in later milestones are documented separately and are not included here.

---

# 1. Table: `users`

Stores user account information, authentication credentials, system roles, contact information, and account creation details.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## User Roles

The BuildTrack platform supports the following roles:

- Administrator
- Project Manager
- Site Engineer
- Contractor
- Client
- Worker

The `role` field is used by the application for role-based access control.

---

# 2. Table: `projects`

Stores construction project information including project name, description, location, budget, schedule, category, status, and project manager.

```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    budget NUMERIC(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    category VARCHAR(50),
    manager_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_project_budget
        CHECK (budget > 0)
);
```

## Project Categories

- Residential
- Commercial
- Industrial
- Infrastructure
- Government Projects

## Project Status

- Pending
- Running
- Completed

Each project can be associated with a project manager through `manager_id`.

---

# 3. Table: `project_milestones`

Stores individual milestones and important project phases associated with construction projects.

```sql
CREATE TABLE project_milestones (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    milestone_name VARCHAR(150) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Milestone Status

- Pending
- Running
- Completed

Each milestone belongs to a project through `project_id`.

---

# 4. Table: `resources`

Stores construction equipment, machinery, tools, and other resources used by projects.

```sql
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    availability VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Resource Categories

Examples include:

- Excavators
- Concrete Mixers
- Cranes
- Dump Trucks
- Generators
- Safety Equipment

Resource allocation, utilization, and maintenance are handled by the resource management functionality.

---

# 5. Table: `inventory`

Stores construction materials and inventory information.

```sql
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50),
    minimum_stock INT DEFAULT 0,
    supplier VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_inventory_quantity
        CHECK (quantity >= 0)
);
```

## Material Categories

- Cement
- Steel
- Bricks
- Sand
- Concrete
- Electrical Materials
- Plumbing Materials

The `minimum_stock` value can be used by the application to identify low-stock materials.

---

# 6. Table: `workers`

Stores workforce information and worker assignments.

```sql
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    project_id INT REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Workforce Categories

The `designation` field can contain categories such as:

- Engineer
- Supervisor
- Contractor
- Skilled Worker
- Unskilled Worker
- Consultant

Workers can be associated with construction projects through `project_id`.

---

# 7. Table: `attendance`

Stores daily attendance records for workers.

```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES workers(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Attendance Status

- Present
- Absent
- On Leave

Each attendance record belongs to a worker through `worker_id`.

---

# 8. Table: `procurements`

Stores procurement records for construction materials and other project requirements.

```sql
CREATE TABLE procurements (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2),
    total_cost NUMERIC(12, 2),
    vendor VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_procurement_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_procurement_total_cost
        CHECK (total_cost >= 0)
);
```

## Procurement Status

Typical statuses include:

- Pending
- Approved
- Rejected
- Completed

Procurement records are associated with projects through `project_id`.

---

# 9. Table: `notifications`

Stores system notifications, alerts, project updates, and user messages.

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Notification Types

Examples include:

- Project Updates
- Task Assignments
- Procurement Alerts
- Attendance Alerts
- Deadline Notifications
- System Notifications

Notifications are associated with users through `user_id`.

---

# 10. Table: `reports`

Stores generated project report metadata and references to generated report files.

```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    generated_by INT REFERENCES users(id) ON DELETE SET NULL,
    report_type VARCHAR(100) NOT NULL,
    report_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Report Types

Examples include:

- Project Progress Report
- Resource Utilization Report
- Budget Report
- Workforce Report
- Procurement Report

The actual generation of PDF and Excel files is handled by the application layer. The database stores report metadata and the generated file location through `report_url`.

---

# Database Relationships

The major relationships between the Milestone 1 entities are shown below.

```text
users
 |
 +--------------------+
 |                    |
 v                    v
projects         notifications
 |
 +--------------------+
 |         |          |
 v         v          v
project_   workers   procurements
milestones   |
             v
          attendance

projects
 |
 +---- reports

resources
 |
 +---- Resource management
```

---

# Primary Keys

Each core table has a unique primary key.

| Table                | Primary Key |
| -------------------- | ----------- |
| `users`              | `id`        |
| `projects`           | `id`        |
| `project_milestones` | `id`        |
| `resources`          | `id`        |
| `inventory`          | `id`        |
| `workers`            | `id`        |
| `attendance`         | `id`        |
| `procurements`       | `id`        |
| `notifications`      | `id`        |
| `reports`            | `id`        |

---

# Foreign Key Relationships

The following foreign-key relationships are part of the Milestone 1 design:

```text
projects.manager_id
        |
        +----> users.id


project_milestones.project_id
        |
        +----> projects.id


workers.project_id
        |
        +----> projects.id


attendance.worker_id
        |
        +----> workers.id


procurements.project_id
        |
        +----> projects.id


notifications.user_id
        |
        +----> users.id


reports.project_id
        |
        +----> projects.id


reports.generated_by
        |
        +----> users.id
```

---

# Delete Behavior

Foreign-key relationships use appropriate delete behavior.

## `ON DELETE CASCADE`

Used where child records belong directly to a parent:

```text
project_milestones -> projects
attendance -> workers
procurements -> projects
notifications -> users
reports -> projects
```

Deleting the parent removes the dependent records where appropriate.

## `ON DELETE SET NULL`

Used where the child record should remain when the referenced user/project is removed:

```text
projects.manager_id -> users.id
workers.project_id -> projects.id
reports.generated_by -> users.id
```

The reference is set to `NULL` instead of deleting the record.

---

# Data Integrity Constraints

The database applies validation rules to prevent invalid data.

## Project Budget

```sql
CHECK (budget > 0)
```

A project cannot have a zero or negative budget.

## Inventory Quantity

```sql
CHECK (quantity >= 0)
```

Inventory quantity cannot be negative.

## Procurement Quantity

```sql
CHECK (quantity > 0)
```

Procurement quantity must be greater than zero.

## Procurement Cost

```sql
CHECK (total_cost >= 0)
```

Procurement cost cannot be negative.

## Unique User Email

```sql
email VARCHAR(150) UNIQUE NOT NULL
```

Each user must have a unique email address.

---

# Core Database Workflow

The main database workflow is:

```text
User
 |
 v
Project
 |
 +-------------------+
 |                   |
 v                   v
Milestones        Workers
                     |
                     v
                 Attendance

Project
 |
 +-------------------+
 |         |         |
 v         v         v
Resources Inventory Procurement
                         |
                         v
                       Vendor

Project
 |
 +---- Reports

User
 |
 +---- Notifications
```

---

# Milestone 1 Database Requirements

| Requirement                  | Table / Feature                            | Status   |
| ---------------------------- | ------------------------------------------ | -------- |
| User management              | `users`                                    | Complete |
| User roles                   | `users.role`                               | Complete |
| Project management           | `projects`                                 | Complete |
| Project scheduling           | `projects.start_date`, `projects.end_date` | Complete |
| Project milestones           | `project_milestones`                       | Complete |
| Resource management          | `resources`                                | Complete |
| Inventory management         | `inventory`                                | Complete |
| Workforce management         | `workers`                                  | Complete |
| Attendance tracking          | `attendance`                               | Complete |
| Procurement                  | `procurements`                             | Complete |
| Notifications                | `notifications`                            | Complete |
| Reports                      | `reports`                                  | Complete |
| Primary keys                 | All core tables                            | Complete |
| Foreign keys                 | Related tables                             | Complete |
| Referential integrity        | Foreign-key constraints                    | Complete |
| Basic data validation        | CHECK constraints                          | Complete |
| PostgreSQL-compatible schema | PostgreSQL                                 | Complete |

---

# Milestone 1 Completion

The BuildTrack Milestone 1 database contains all 10 core entities required by the project specification.

The database provides:

- User and role management
- Project management
- Project milestone tracking
- Resource management
- Material inventory management
- Workforce management
- Attendance tracking
- Procurement management
- User notifications
- Project report storage
- Primary and foreign keys
- Referential integrity
- Basic validation constraints

Therefore, the **Milestone 1 core database schema is complete and finalized**.

Later milestones extend this core schema with additional functionality such as:

- Site progress monitoring
- Resource allocation
- Resource maintenance
- Material allocation
- Worker shifts
- Payroll
- Expense tracking
- Vendor management
- Purchase orders
- Invoices
- Analytics views
- Documents
- Additional reporting functionality

These later-milestone tables are intentionally excluded from the Milestone 1 core schema document.
