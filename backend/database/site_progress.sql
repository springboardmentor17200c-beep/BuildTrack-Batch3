CREATE TABLE IF NOT EXISTS site_progress_reports (
    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    report_date DATE NOT NULL,

    report_type VARCHAR(20) NOT NULL,

    progress_category VARCHAR(50) NOT NULL,

    description TEXT,

    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,

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
        completion_percentage >= 0
        AND completion_percentage <= 100
    ),

    CONSTRAINT site_progress_delay_valid
    CHECK (
        delay_days >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_site_progress_project
ON site_progress_reports(project_id);

CREATE INDEX IF NOT EXISTS idx_site_progress_date
ON site_progress_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_site_progress_type
ON site_progress_reports(report_type);