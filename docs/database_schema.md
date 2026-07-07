# BuildTrack - Database Schema Design (Milestone 1)

This document outlines the finalized PostgreSQL schema layout for the BuildTrack platform. It covers all 10 core entities defined in the Milestone 1 objective.

---

## 1. Table: `users`
Stores user profile information, authentication credentials (password hashes), system roles, and status flags.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Admin', 'Project Manager', 'Site Engineer', 'Contractor', 'Client', 'Worker')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Active', 'Locked', 'Pending')) DEFAULT 'Active',
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Table: `projects`
Stores construction project details, budgets, durations, and status ratings.

```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Government Projects')) NOT NULL,
    progress INT CHECK (progress BETWEEN 0 AND 100) DEFAULT 0,
    budget NUMERIC(12, 2) NOT NULL,
    spent NUMERIC(12, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) CHECK (status IN ('On Track', 'Delayed', 'Critical', 'Completed')) DEFAULT 'On Track',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Table: `project_milestones`
Stores project timelines and key phases (Foundation, Structure, Utilities, Finishing).

```sql
CREATE TABLE project_milestones (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(30) CHECK (status IN ('Completed', 'In Progress', 'Pending')) DEFAULT 'Pending',
    completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Table: `resources`
Stores heavy machinery and assets tracking details, plus deployment information.

```sql
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g. 'Heavy Machinery', 'Lifting Assets', 'Vehicles'
    status VARCHAR(30) CHECK (status IN ('Available', 'Assigned', 'Maintenance')) DEFAULT 'Available',
    operator_id INT REFERENCES users(id) ON DELETE SET NULL,
    project_id INT REFERENCES projects(id) ON DELETE SET NULL,
    start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Table: `inventory`
Tracks raw materials quantities, storage thresholds, and sensors telemetry.

```sql
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'Portland Cement', 'Structural Steel Rebar'
    category VARCHAR(50) NOT NULL, -- e.g. 'Raw Materials', 'Aggregates'
    quantity VARCHAR(50) NOT NULL, -- e.g. '820 Bags', '12 Tons'
    capacity_limit INT NOT NULL,
    current_level INT CHECK (current_level BETWEEN 0 AND 100) NOT NULL, -- percentage indicator
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Table: `workers`
Stores workforce profiles and category logs.

```sql
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Engineer', 'Supervisor', 'Contractor', 'Skilled Worker', 'Unskilled Worker')) NOT NULL,
    status VARCHAR(30) CHECK (status IN ('Active', 'On Leave', 'Suspended')) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Table: `attendance`
Stores daily worker shift logs and fingerprint sensor timings.

```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES workers(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    check_in_time VARCHAR(20) NOT NULL, -- e.g. '08:00 AM'
    check_out_time VARCHAR(20), -- e.g. '04:30 PM'
    status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'On Leave')) DEFAULT 'Present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (worker_id, date)
);
```

---

## 8. Table: `procurements`
Tracks material orders, supplier details, and billing workflows.

```sql
CREATE TABLE procurements (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    requested_by VARCHAR(100) NOT NULL, -- Name or user ID reference
    vendor VARCHAR(100),
    status VARCHAR(30) CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. Table: `notifications`
Stores system alerts, deadline warnings, and user message logs.

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(30) CHECK (type IN ('success', 'warning', 'danger', 'info')) DEFAULT 'info',
    time_label VARCHAR(30) NOT NULL, -- e.g. '10m ago', '1d ago'
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 10. Table: `reports`
Stores daily/weekly site logs, work completions, and inspector signatures.

```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    inspector_id INT REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) CHECK (category IN ('Foundation', 'Structural', 'Electrical', 'Plumbing', 'Finishing', 'Inspection')) NOT NULL,
    summary TEXT NOT NULL,
    work_status VARCHAR(30) CHECK (work_status IN ('On Schedule', 'Minor Delay', 'Critical Block')) DEFAULT 'On Schedule',
    safety_compliance BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
