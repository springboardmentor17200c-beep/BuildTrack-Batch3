-- ============================================================
-- BUILDTRACK - MILESTONE 4 DATABASE TESTS
-- ============================================================

-- ============================================================
-- 1. PROJECT VALIDATION
-- ============================================================

SELECT *
FROM projects
WHERE budget <= 0;

SELECT *
FROM projects
WHERE status NOT IN (
    'Pending',
    'Running',
    'Completed'
);

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


-- ============================================================
-- 2. INVENTORY VALIDATION
-- ============================================================

SELECT *
FROM inventory
WHERE quantity < 0;

SELECT *
FROM inventory
WHERE quantity <= minimum_stock;


-- ============================================================
-- 3. PROCUREMENT VALIDATION
-- ============================================================

SELECT *
FROM procurements
WHERE quantity <= 0;

SELECT *
FROM procurements
WHERE total_cost < 0;


-- ============================================================
-- 4. ATTENDANCE VALIDATION
-- ============================================================

SELECT *
FROM attendance
WHERE status NOT IN (
    'Present',
    'Absent',
    'On Leave'
);


-- ============================================================
-- 5. PROJECT COUNTS
-- ============================================================

SELECT COUNT(*) AS total_projects
FROM projects;

SELECT COUNT(*) AS completed_projects
FROM projects
WHERE status = 'Completed';

SELECT COUNT(*) AS running_projects
FROM projects
WHERE status = 'Running';

SELECT COUNT(*) AS pending_projects
FROM projects
WHERE status = 'Pending';


-- ============================================================
-- 6. ATTENDANCE SUMMARY
-- ============================================================

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


-- ============================================================
-- 7. PROCUREMENT SUMMARY
-- ============================================================

SELECT
    COUNT(*) AS total_procurements,
    COALESCE(SUM(total_cost), 0)
        AS total_procurement_value
FROM procurements;


-- ============================================================
-- 8. WORKFORCE
-- ============================================================

SELECT COUNT(*) AS total_workers
FROM workers;


-- ============================================================
-- 9. SITE PROGRESS VALIDATION
-- ============================================================

SELECT *
FROM site_progress_reports
WHERE completion_percentage < 0
   OR completion_percentage > 100;

SELECT *
FROM site_progress_reports
WHERE delay_days < 0;


-- ============================================================
-- 10. RESOURCE ALLOCATION VALIDATION
-- ============================================================

SELECT *
FROM resource_allocations
WHERE allocated_quantity <= 0;


-- ============================================================
-- 11. MATERIAL ALLOCATION VALIDATION
-- ============================================================

SELECT *
FROM material_allocations
WHERE quantity <= 0;


-- ============================================================
-- 12. PAYROLL VALIDATION
-- ============================================================

SELECT *
FROM payroll_records
WHERE basic_amount < 0
   OR overtime_amount < 0
   OR deduction_amount < 0
   OR net_amount < 0;


-- ============================================================
-- 13. EXPENSE VALIDATION
-- ============================================================

SELECT *
FROM expenses
WHERE amount < 0;

SELECT *
FROM expenses
WHERE category NOT IN (
    'Labor Cost',
    'Material Cost',
    'Equipment Cost',
    'Transportation Cost',
    'Maintenance Cost',
    'Administrative Cost'
);


-- ============================================================
-- 14. ANALYTICS VIEWS
-- ============================================================

SELECT *
FROM project_status_summary;

SELECT *
FROM project_budget_summary;

SELECT *
FROM monthly_attendance_summary;

SELECT *
FROM inventory_stock_summary;

SELECT *
FROM procurement_summary;

SELECT *
FROM worker_summary;

SELECT *
FROM milestone_summary;

SELECT *
FROM project_expense_summary;

SELECT *
FROM project_analytics_summary;


-- ============================================================
-- 15. PROJECTS OVER BUDGET
-- ============================================================

SELECT *
FROM project_expense_summary
WHERE total_expense > budget;


-- ============================================================
-- 16. DATABASE OBJECT CHECK
-- ============================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;


-- ============================================================
-- 17. VIEW CHECK
-- ============================================================

SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;


-- ============================================================
-- 18. INDEX CHECK
-- ============================================================

SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- ============================================================
-- 19. CONSTRAINT CHECK
-- ============================================================

SELECT
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;