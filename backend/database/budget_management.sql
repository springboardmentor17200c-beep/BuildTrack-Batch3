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

CREATE INDEX IF NOT EXISTS idx_expenses_project
ON expenses(project_id);

CREATE INDEX IF NOT EXISTS idx_expenses_date
ON expenses(expense_date);

CREATE INDEX IF NOT EXISTS idx_expenses_category
ON expenses(category);