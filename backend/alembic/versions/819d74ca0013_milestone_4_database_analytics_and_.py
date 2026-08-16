"""milestone 4 database analytics and management

Revision ID: xxxxxxxxxxxx
Revises: 8f06c54788aa
Create Date: 2026-08-16
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "819d74ca0013"
down_revision: Union[str, Sequence[str], None] = "8f06c54788aa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ========================================================
    # 1. PROJECT CATEGORY
    # ========================================================

    op.execute("""
        ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS category VARCHAR(50);
    """)

    op.execute("""
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
    """)

    # ========================================================
    # 2. CREATED_AT
    # ========================================================

    op.execute("""
        ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS created_at
        TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    """)

    # ========================================================
    # 3. VALIDATION CONSTRAINTS
    # ========================================================

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
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
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'projects_budget_positive'
            ) THEN
                ALTER TABLE projects
                ADD CONSTRAINT projects_budget_positive
                CHECK (budget > 0);
            END IF;
        END $$;
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
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
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'inventory_quantity_nonnegative'
            ) THEN
                ALTER TABLE inventory
                ADD CONSTRAINT inventory_quantity_nonnegative
                CHECK (quantity >= 0);
            END IF;
        END $$;
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'procurement_quantity_positive'
            ) THEN
                ALTER TABLE procurements
                ADD CONSTRAINT procurement_quantity_positive
                CHECK (quantity > 0);
            END IF;
        END $$;
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'procurement_total_cost_nonnegative'
            ) THEN
                ALTER TABLE procurements
                ADD CONSTRAINT procurement_total_cost_nonnegative
                CHECK (total_cost >= 0);
            END IF;
        END $$;
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
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
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
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
    """)

    # ========================================================
    # 4. PASSWORD RESET
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL
                REFERENCES users(id)
                ON DELETE CASCADE,
            token_hash VARCHAR(255) NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # ========================================================
    # 5. EXPENSES
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL
                REFERENCES projects(id)
                ON DELETE CASCADE,
            expense_date DATE NOT NULL,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            amount NUMERIC(12,2) NOT NULL,
            recorded_by INTEGER
                REFERENCES users(id)
                ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT expense_amount_valid
                CHECK (amount >= 0),

            CONSTRAINT expense_category_valid
                CHECK (
                    category IN (
                        'Labor Cost',
                        'Material Cost',
                        'Equipment Cost',
                        'Transportation Cost',
                        'Maintenance Cost',
                        'Administrative Cost'
                    )
                )
        );
    """)

    # ========================================================
    # 6. RESOURCE ALLOCATION
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS resource_allocations (
            id SERIAL PRIMARY KEY,

            resource_id INTEGER NOT NULL
                REFERENCES resources(id)
                ON DELETE CASCADE,

            project_id INTEGER NOT NULL
                REFERENCES projects(id)
                ON DELETE CASCADE,

            allocated_quantity INTEGER NOT NULL,

            allocation_date DATE NOT NULL,

            returned_date DATE,

            status VARCHAR(30) NOT NULL DEFAULT 'Allocated',

            CONSTRAINT resource_allocation_quantity_valid
                CHECK (allocated_quantity > 0),

            CONSTRAINT resource_allocation_status_valid
                CHECK (
                    status IN (
                        'Allocated',
                        'Returned',
                        'In Use',
                        'Maintenance'
                    )
                )
        );
    """)

    # ========================================================
    # 7. RESOURCE MAINTENANCE
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS resource_maintenance (
            id SERIAL PRIMARY KEY,

            resource_id INTEGER NOT NULL
                REFERENCES resources(id)
                ON DELETE CASCADE,

            maintenance_date DATE NOT NULL,

            next_maintenance_date DATE,

            maintenance_type VARCHAR(100),

            cost NUMERIC(12,2) DEFAULT 0,

            description TEXT,

            status VARCHAR(30) DEFAULT 'Scheduled',

            CONSTRAINT maintenance_cost_valid
                CHECK (cost >= 0)
        );
    """)

    # ========================================================
    # 8. MATERIAL ALLOCATION
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS material_allocations (
            id SERIAL PRIMARY KEY,

            inventory_id INTEGER NOT NULL
                REFERENCES inventory(id)
                ON DELETE CASCADE,

            project_id INTEGER NOT NULL
                REFERENCES projects(id)
                ON DELETE CASCADE,

            quantity INTEGER NOT NULL,

            allocation_date DATE NOT NULL,

            allocated_to INTEGER
                REFERENCES users(id)
                ON DELETE SET NULL,

            status VARCHAR(30) DEFAULT 'Allocated',

            CONSTRAINT material_allocation_quantity_valid
                CHECK (quantity > 0)
        );
    """)

    # ========================================================
    # 9. SITE PROGRESS
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS site_progress_reports (
            id SERIAL PRIMARY KEY,

            project_id INTEGER NOT NULL
                REFERENCES projects(id)
                ON DELETE CASCADE,

            report_date DATE NOT NULL,

            report_type VARCHAR(20) NOT NULL,

            progress_category VARCHAR(50) NOT NULL,

            description TEXT,

            completion_percentage NUMERIC(5,2)
                NOT NULL DEFAULT 0,

            delay_days INTEGER NOT NULL DEFAULT 0,

            delay_reason TEXT,

            reported_by INTEGER
                REFERENCES users(id)
                ON DELETE SET NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT site_progress_report_type_valid
                CHECK (
                    report_type IN ('Daily', 'Weekly')
                ),

            CONSTRAINT site_progress_category_valid
                CHECK (
                    progress_category IN (
                        'Foundation',
                        'Structural Work',
                        'Electrical Work',
                        'Plumbing Work',
                        'Finishing Work',
                        'Inspection Work'
                    )
                ),

            CONSTRAINT site_progress_percentage_valid
                CHECK (
                    completion_percentage BETWEEN 0 AND 100
                ),

            CONSTRAINT site_progress_delay_valid
                CHECK (delay_days >= 0)
        );
    """)

    # ========================================================
    # 10. SITE ACTIVITY LOG
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS site_activity_logs (
            id SERIAL PRIMARY KEY,

            project_id INTEGER NOT NULL
                REFERENCES projects(id)
                ON DELETE CASCADE,

            activity_date DATE NOT NULL,

            activity_type VARCHAR(100) NOT NULL,

            description TEXT,

            performed_by INTEGER
                REFERENCES users(id)
                ON DELETE SET NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # ========================================================
    # 11. WORKER SHIFTS
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS worker_shifts (
            id SERIAL PRIMARY KEY,

            worker_id INTEGER NOT NULL
                REFERENCES workers(id)
                ON DELETE CASCADE,

            project_id INTEGER NOT NULL
                REFERENCES projects(id)
                ON DELETE CASCADE,

            shift_date DATE NOT NULL,

            shift_name VARCHAR(50) NOT NULL,

            start_time TIME NOT NULL,

            end_time TIME NOT NULL,

            status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',

            CONSTRAINT worker_shift_status_valid
                CHECK (
                    status IN (
                        'Scheduled',
                        'Completed',
                        'Cancelled'
                    )
                )
        );
    """)

    # ========================================================
    # 12. PAYROLL
    # ========================================================

    op.execute("""
        CREATE TABLE IF NOT EXISTS payroll_records (
            id SERIAL PRIMARY KEY,

            worker_id INTEGER NOT NULL
                REFERENCES workers(id)
                ON DELETE CASCADE,

            project_id INTEGER
                REFERENCES projects(id)
                ON DELETE SET NULL,

            pay_period_start DATE NOT NULL,

            pay_period_end DATE NOT NULL,

            basic_amount NUMERIC(12,2)
                NOT NULL DEFAULT 0,

            overtime_amount NUMERIC(12,2)
                NOT NULL DEFAULT 0,

            deduction_amount NUMERIC(12,2)
                NOT NULL DEFAULT 0,

            net_amount NUMERIC(12,2)
                NOT NULL DEFAULT 0,

            payment_status VARCHAR(30)
                NOT NULL DEFAULT 'Pending',

            paid_date DATE,

            CONSTRAINT payroll_basic_valid
                CHECK (basic_amount >= 0),

            CONSTRAINT payroll_overtime_valid
                CHECK (overtime_amount >= 0),

            CONSTRAINT payroll_deduction_valid
                CHECK (deduction_amount >= 0),

            CONSTRAINT payroll_net_valid
                CHECK (net_amount >= 0),

            CONSTRAINT payroll_status_valid
                CHECK (
                    payment_status IN (
                        'Pending',
                        'Processed',
                        'Paid',
                        'Cancelled'
                    )
                )
        );
    """)

    # ========================================================
    # 13. INDEXES
    # ========================================================

    indexes = [
        """
        CREATE INDEX IF NOT EXISTS idx_projects_status
        ON projects(status)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_projects_created_at
        ON projects(created_at)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_projects_category
        ON projects(category)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_attendance_date
        ON attendance(attendance_date)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_inventory_quantity
        ON inventory(quantity)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_procurements_status
        ON procurements(status)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_milestones_status
        ON project_milestones(status)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at
        ON notifications(created_at)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_expenses_project
        ON expenses(project_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_resource_allocations_project
        ON resource_allocations(project_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_resource_maintenance_resource
        ON resource_maintenance(resource_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_material_allocations_project
        ON material_allocations(project_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_site_progress_project
        ON site_progress_reports(project_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_site_activity_project
        ON site_activity_logs(project_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_worker_shifts_worker
        ON worker_shifts(worker_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_worker_shifts_project
        ON worker_shifts(project_id)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_payroll_worker
        ON payroll_records(worker_id)
        """
    ]

    for index in indexes:
        op.execute(index)

    # ========================================================
    # 14. ANALYTICS VIEWS
    # ========================================================

    op.execute("""
        CREATE OR REPLACE VIEW project_status_summary AS
        SELECT
            status,
            COUNT(*) AS project_count,
            COALESCE(SUM(budget), 0) AS total_budget
        FROM projects
        GROUP BY status;
    """)

    op.execute("""
        CREATE OR REPLACE VIEW project_budget_summary AS
        SELECT
            COUNT(*) AS total_projects,
            COALESCE(SUM(budget), 0) AS total_budget,
            COALESCE(AVG(budget), 0) AS average_budget,
            COALESCE(MIN(budget), 0) AS minimum_budget,
            COALESCE(MAX(budget), 0) AS maximum_budget
        FROM projects;
    """)

    op.execute("""
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
    """)

    op.execute("""
        CREATE OR REPLACE VIEW inventory_stock_summary AS
        SELECT
            COUNT(*) AS total_items,
            COALESCE(SUM(quantity), 0) AS total_quantity,
            COUNT(*) FILTER (
                WHERE quantity <= minimum_stock
            ) AS low_stock_items
        FROM inventory;
    """)

    op.execute("""
        CREATE OR REPLACE VIEW procurement_summary AS
        SELECT
            COUNT(*) AS total_procurements,
            COALESCE(SUM(total_cost), 0)
                AS total_procurement_value
        FROM procurements;
    """)

    op.execute("""
        CREATE OR REPLACE VIEW worker_summary AS
        SELECT
            COUNT(*) AS total_workers
        FROM workers;
    """)

    op.execute("""
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
    """)

    op.execute("""
    CREATE OR REPLACE VIEW project_expense_summary AS
    SELECT
        p.id AS project_id,
        p.project_name,
        p.budget,

        COALESCE(
            SUM(e.amount),
            0
        ) AS total_expense,

        p.budget -
        COALESCE(
            SUM(e.amount),
            0
        ) AS remaining_budget,

        CASE
            WHEN p.budget > 0 THEN
                ROUND(
                    (
                        (
                            COALESCE(SUM(e.amount), 0)::NUMERIC
                            / p.budget::NUMERIC
                        ) * 100
                    ),
                    2
                )
            ELSE 0::NUMERIC
        END AS budget_utilization_percentage

         FROM projects p
 
       LEFT JOIN expenses e
        ON e.project_id = p.id

        GROUP BY
        p.id,
        p.project_name,
        p.budget;
        """)

    op.execute("""
        CREATE OR REPLACE VIEW project_analytics_summary AS
        SELECT
            p.id AS project_id,
            p.project_name,
            p.status,
            p.budget,

            COUNT(DISTINCT pm.id)
                AS total_milestones,

            COUNT(DISTINCT pm.id)
                FILTER (
                    WHERE pm.status = 'Completed'
                ) AS completed_milestones,

            COUNT(DISTINCT w.id)
                AS total_workers,

            COALESCE(
                (
                    SELECT SUM(i.quantity)
                    FROM inventory i
                    WHERE i.project_id = p.id
                ),
                0
            ) AS total_inventory,

            COALESCE(
                (
                    SELECT SUM(pr.total_cost)
                    FROM procurements pr
                    WHERE pr.project_id = p.id
                ),
                0
            ) AS procurement_cost

        FROM projects p

        LEFT JOIN project_milestones pm
            ON pm.project_id = p.id

        LEFT JOIN workers w
            ON w.project_id = p.id

        GROUP BY
            p.id,
            p.project_name,
            p.status,
            p.budget;
    """)


def downgrade() -> None:

    op.execute("DROP VIEW IF EXISTS project_analytics_summary;")
    op.execute("DROP VIEW IF EXISTS project_expense_summary;")
    op.execute("DROP VIEW IF EXISTS milestone_summary;")
    op.execute("DROP VIEW IF EXISTS worker_summary;")
    op.execute("DROP VIEW IF EXISTS procurement_summary;")
    op.execute("DROP VIEW IF EXISTS inventory_stock_summary;")
    op.execute("DROP VIEW IF EXISTS monthly_attendance_summary;")
    op.execute("DROP VIEW IF EXISTS project_budget_summary;")
    op.execute("DROP VIEW IF EXISTS project_status_summary;")

    op.execute("DROP TABLE IF EXISTS payroll_records;")
    op.execute("DROP TABLE IF EXISTS worker_shifts;")
    op.execute("DROP TABLE IF EXISTS site_activity_logs;")
    op.execute("DROP TABLE IF EXISTS site_progress_reports;")
    op.execute("DROP TABLE IF EXISTS material_allocations;")
    op.execute("DROP TABLE IF EXISTS resource_maintenance;")
    op.execute("DROP TABLE IF EXISTS resource_allocations;")
    op.execute("DROP TABLE IF EXISTS expenses;")
    op.execute("DROP TABLE IF EXISTS password_reset_tokens;")

    op.execute("""
        ALTER TABLE projects
        DROP CONSTRAINT IF EXISTS projects_category_valid;
    """)

    op.execute("""
        ALTER TABLE projects
        DROP CONSTRAINT IF EXISTS projects_budget_positive;
    """)

    op.execute("""
        ALTER TABLE projects
        DROP CONSTRAINT IF EXISTS project_status_valid;
    """)

    op.execute("""
        ALTER TABLE users
        DROP CONSTRAINT IF EXISTS users_role_valid;
    """)

    op.execute("""
        ALTER TABLE inventory
        DROP CONSTRAINT IF EXISTS inventory_quantity_nonnegative;
    """)

    op.execute("""
        ALTER TABLE procurements
        DROP CONSTRAINT IF EXISTS procurement_quantity_positive;
    """)

    op.execute("""
        ALTER TABLE procurements
        DROP CONSTRAINT IF EXISTS procurement_total_cost_nonnegative;
    """)

    op.execute("""
        ALTER TABLE attendance
        DROP CONSTRAINT IF EXISTS attendance_status_valid;
    """)

    op.execute("""
        ALTER TABLE project_milestones
        DROP CONSTRAINT IF EXISTS milestone_status_valid;
    """)

    op.execute("""
        ALTER TABLE projects
        DROP COLUMN IF EXISTS category;
    """)

    op.execute("""
        ALTER TABLE projects
        DROP COLUMN IF EXISTS created_at;
    """)