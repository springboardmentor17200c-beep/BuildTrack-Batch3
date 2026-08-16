-- ============================================================
-- BUILDTRACK - WORKFORCE MANAGEMENT
-- ============================================================

-- WORKER SHIFT SCHEDULING
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

CREATE INDEX IF NOT EXISTS idx_worker_shifts_worker
ON worker_shifts(worker_id);

CREATE INDEX IF NOT EXISTS idx_worker_shifts_project
ON worker_shifts(project_id);

CREATE INDEX IF NOT EXISTS idx_worker_shifts_date
ON worker_shifts(shift_date);


-- PAYROLL
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

    basic_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    overtime_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    deduction_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    net_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending',

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

CREATE INDEX IF NOT EXISTS idx_payroll_worker
ON payroll_records(worker_id);

CREATE INDEX IF NOT EXISTS idx_payroll_project
ON payroll_records(project_id);

CREATE INDEX IF NOT EXISTS idx_payroll_period
ON payroll_records(
    pay_period_start,
    pay_period_end
);