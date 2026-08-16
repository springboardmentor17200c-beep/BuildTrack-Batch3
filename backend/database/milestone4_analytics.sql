-- ============================================================
-- BUILDTRACK - MILESTONE 4 DATABASE IMPLEMENTATION
-- Analytics, Validation, Indexes & Tests
-- ============================================================


-- ============================================================
-- 1. PROJECT CATEGORY
-- ============================================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS category VARCHAR(50);


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'projects_category_valid'
    ) THEN

        ALTER TABLE projects
        ADD CONSTRAINT projects_category_valid
        CHECK (
            category IS NULL OR
            category IN (
                'Residential',
                'Commercial',
                'Industrial',
                'Infrastructure',
                'Government Projects'
            )
        );

    END IF;
END $$;


-- ============================================================
-- 2. USER ROLE VALIDATION
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_valid'
    ) THEN

        ALTER TABLE users
        ADD CONSTRAINT users_role_valid
        CHECK (
            role IN (
                'Admin',
                'Administrator',
                'Project Manager',
                'Site Engineer',
                'Contractor',
                'Worker',
                'Client'
            )
        );

    END IF;
END $$;


-- ============================================================
-- 3. PROJECT VALIDATION
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'projects_budget_positive'
    ) THEN

        ALTER TABLE projects
        ADD CONSTRAINT projects_budget_positive
        CHECK (budget > 0);

    END IF;
END $$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'project_status_valid'
    ) THEN

        ALTER TABLE projects
        ADD CONSTRAINT project_status_valid
        CHECK (
            status IN (
                'Pending',
                'Running',
                'Completed'
            )
        );

    END IF;
END $$;


-- ============================================================
-- 4. INVENTORY VALIDATION
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'inventory_quantity_nonnegative'
    ) THEN

        ALTER TABLE inventory
        ADD CONSTRAINT inventory_quantity_nonnegative
        CHECK (quantity >= 0);

    END IF;
END $$;


-- ============================================================
-- 5. PROCUREMENT VALIDATION
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'procurement_quantity_positive'
    ) THEN

        ALTER TABLE procurements
        ADD CONSTRAINT procurement_quantity_positive
        CHECK (quantity > 0);

    END IF;
END $$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'procurement_total_cost_nonnegative'
    ) THEN

        ALTER TABLE procurements
        ADD CONSTRAINT procurement_total_cost_nonnegative
        CHECK (total_cost >= 0);

    END IF;
END $$;


-- ============================================================
-- 6. ATTENDANCE VALIDATION
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'attendance_status_valid'
    ) THEN

        ALTER TABLE attendance
        ADD CONSTRAINT attendance_status_valid
        CHECK (
            status IN (
                'Present',
                'Absent',
                'On Leave'
            )
        );

    END IF;
END $$;


-- ============================================================
-- 7. MILESTONE VALIDATION
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'milestone_status_valid'
    ) THEN

        ALTER TABLE project_milestones
        ADD CONSTRAINT milestone_status_valid
        CHECK (
            status IN (
                'Pending',
                'Running',
                'Completed'
            )
        );

    END IF;
END $$;


-- ============================================================
-- 8. DATABASE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_projects_status
ON projects(status);

CREATE INDEX IF NOT EXISTS idx_projects_created_at
ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_projects_category
ON projects(category);

CREATE INDEX IF NOT EXISTS idx_attendance_date
ON attendance(attendance_date);

CREATE INDEX IF NOT EXISTS idx_attendance_worker
ON attendance(worker_id);

CREATE INDEX IF NOT EXISTS idx_inventory_quantity
ON inventory(quantity);

CREATE INDEX IF NOT EXISTS idx_procurements_purchase_date
ON procurements(purchase_date);

CREATE INDEX IF NOT EXISTS idx_procurements_status
ON procurements(status);

CREATE INDEX IF NOT EXISTS idx_milestones_status
ON project_milestones(status);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
ON notifications(created_at);


-- ============================================================
-- 9. ANALYTICS VIEWS
-- ============================================================


-- ------------------------------------------------------------
-- 9.1 PROJECT STATUS SUMMARY
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW project_status_summary AS
SELECT
    status,
    COUNT(*) AS project_count,
    COALESCE(SUM(budget), 0) AS total_budget
FROM projects
GROUP BY status;


-- ------------------------------------------------------------
-- 9.2 PROJECT BUDGET SUMMARY
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW project_budget_summary AS
SELECT
    COUNT(*) AS total_projects,
    COALESCE(SUM(budget), 0) AS total_budget,
    COALESCE(AVG(budget), 0) AS average_budget,
    COALESCE(MIN(budget), 0) AS minimum_budget,
    COALESCE(MAX(budget), 0) AS maximum_budget
FROM projects;


-- ------------------------------------------------------------
-- 9.3 MONTHLY ATTENDANCE SUMMARY
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW monthly_attendance_summary AS
SELECT
    DATE_TRUNC('month', attendance_date) AS month,

    COUNT(*) AS total_attendance,

    COUNT(*) FILTER (
        WHERE status = 'Present'
    ) AS present_count,

    COUNT(*) FILTER (
        WHERE status = 'Absent'
    ) AS absent_count,

    COUNT(*) FILTER (
        WHERE status = 'On Leave'
    ) AS on_leave_count

FROM attendance

GROUP BY DATE_TRUNC('month', attendance_date)

ORDER BY month;


-- ------------------------------------------------------------
-- 9.4 INVENTORY STOCK SUMMARY
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW inventory_stock_summary AS
SELECT
    COUNT(*) AS total_items,

    COALESCE(
        SUM(quantity),
        0
    ) AS total_quantity,

    COUNT(*) FILTER (
        WHERE quantity <= minimum_stock
    ) AS low_stock_items

FROM inventory;


-- ------------------------------------------------------------
-- 9.5 PROCUREMENT SUMMARY
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW procurement_summary AS
SELECT
    COUNT(*) AS total_procurements,

    COALESCE(
        SUM(total_cost),
        0
    ) AS total_procurement_value

FROM procurements;


-- ------------------------------------------------------------
-- 9.6 WORKER SUMMARY
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW worker_summary AS
SELECT
    COUNT(*) AS total_workers
FROM workers;


-- ------------------------------------------------------------
-- 9.7 MILESTONE SUMMARY
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW milestone_summary AS
SELECT

    COUNT(*) AS total_milestones,

    COUNT(*) FILTER (
        WHERE status = 'Completed'
    ) AS completed_milestones,

    COUNT(*) FILTER (
        WHERE status = 'Pending'
    ) AS pending_milestones,

    COUNT(*) FILTER (
        WHERE status = 'Running'
    ) AS running_milestones

FROM project_milestones;


-- ============================================================
-- 10. PROJECT EXPENSE SUMMARY
-- ============================================================
--
-- IMPORTANT:
-- This view requires the expenses table.
-- Create budget_management.sql before running this section.
-- ============================================================

CREATE OR REPLACE VIEW project_expense_summary AS
SELECT
    p.id AS project_id,

    p.project_name,

    p.budget,

    COALESCE(
        (
            SELECT SUM(e.amount)
            FROM expenses e
            WHERE e.project_id = p.id
        ),
        0
    ) AS total_expense,

    p.budget -
    COALESCE(
        (
            SELECT SUM(e.amount)
            FROM expenses e
            WHERE e.project_id = p.id
        ),
        0
    ) AS remaining_budget,

    CASE
        WHEN p.budget > 0
        THEN ROUND(
            (
                COALESCE(
                    (
                        SELECT SUM(e.amount)
                        FROM expenses e
                        WHERE e.project_id = p.id
                    ),
                    0
                ) / p.budget
            ) * 100,
            2
        )
        ELSE 0
    END AS budget_utilization_percentage

FROM projects p;


-- ============================================================
-- 11. PROJECT ANALYTICS SUMMARY
-- ============================================================

CREATE OR REPLACE VIEW project_analytics_summary AS
SELECT

    p.id AS project_id,

    p.project_name,

    p.status,

    p.budget,

    (
        SELECT COUNT(*)
        FROM project_milestones pm
        WHERE pm.project_id = p.id
    ) AS total_milestones,

    (
        SELECT COUNT(*)
        FROM project_milestones pm
        WHERE pm.project_id = p.id
        AND pm.status = 'Completed'
    ) AS completed_milestones,

    (
        SELECT COUNT(*)
        FROM workers w
        WHERE w.project_id = p.id
    ) AS total_workers,

    (
        SELECT COALESCE(SUM(i.quantity), 0)
        FROM inventory i
        WHERE i.project_id = p.id
    ) AS total_inventory,

    (
        SELECT COALESCE(SUM(pr.total_cost), 0)
        FROM procurements pr
        WHERE pr.project_id = p.id
    ) AS procurement_cost

FROM projects p;


-- ============================================================
-- 12. ANALYTICS TABLE
-- ============================================================
--
-- Existing analytics table is managed by SQLAlchemy.
-- No CREATE TABLE here.
-- ============================================================


-- ============================================================
-- 13. DATABASE TESTS
-- ============================================================


-- TEST 1: INVALID PROJECT BUDGET

SELECT *
FROM projects
WHERE budget <= 0;


-- TEST 2: NEGATIVE INVENTORY

SELECT *
FROM inventory
WHERE quantity < 0;


-- TEST 3: INVALID PROCUREMENT QUANTITY

SELECT *
FROM procurements
WHERE quantity <= 0;


-- TEST 4: INVALID PROJECT STATUS

SELECT *
FROM projects
WHERE status NOT IN (
    'Pending',
    'Running',
    'Completed'
);


-- TEST 5: ATTENDANCE SUMMARY

SELECT

    COUNT(*) AS total_attendance,

    COUNT(*) FILTER (
        WHERE status = 'Present'
    ) AS present,

    COUNT(*) FILTER (
        WHERE status = 'Absent'
    ) AS absent,

    COUNT(*) FILTER (
        WHERE status = 'On Leave'
    ) AS on_leave

FROM attendance;


-- TEST 6: LOW STOCK INVENTORY

SELECT *
FROM inventory
WHERE quantity <= minimum_stock;


-- TEST 7: TOTAL PROJECTS

SELECT COUNT(*) AS total_projects
FROM projects;


-- TEST 8: COMPLETED PROJECTS

SELECT COUNT(*) AS completed_projects
FROM projects
WHERE status = 'Completed';


-- TEST 9: RUNNING PROJECTS

SELECT COUNT(*) AS running_projects
FROM projects
WHERE status = 'Running';


-- TEST 10: PENDING PROJECTS

SELECT COUNT(*) AS pending_projects
FROM projects
WHERE status = 'Pending';


-- TEST 11: PROJECT STATUS VIEW

SELECT *
FROM project_status_summary;


-- TEST 12: PROJECT BUDGET VIEW

SELECT *
FROM project_budget_summary;


-- TEST 13: MONTHLY ATTENDANCE VIEW

SELECT *
FROM monthly_attendance_summary;


-- TEST 14: INVENTORY VIEW

SELECT *
FROM inventory_stock_summary;


-- TEST 15: PROCUREMENT VIEW

SELECT *
FROM procurement_summary;


-- TEST 16: WORKER VIEW

SELECT *
FROM worker_summary;


-- TEST 17: MILESTONE VIEW

SELECT *
FROM milestone_summary;


-- TEST 18: ANALYTICS TABLE

SELECT *
FROM analytics;


-- TEST 19: PROJECT CATEGORY

SELECT *
FROM projects
WHERE category IS NOT NULL
AND category NOT IN (
    'Residential',
    'Commercial',
    'Industrial',
    'Infrastructure',
    'Government Projects'
);


-- TEST 20: PROJECT EXPENSE SUMMARY

SELECT *
FROM project_expense_summary;


-- TEST 21: PROJECT ANALYTICS SUMMARY

SELECT *
FROM project_analytics_summary;


-- ============================================================
-- END OF MILESTONE 4 ANALYTICS FILE
-- ============================================================