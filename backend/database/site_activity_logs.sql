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

CREATE INDEX IF NOT EXISTS idx_site_activity_project
ON site_activity_logs(project_id);

CREATE INDEX IF NOT EXISTS idx_site_activity_date
ON site_activity_logs(activity_date);