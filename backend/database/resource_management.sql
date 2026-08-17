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

CREATE INDEX IF NOT EXISTS idx_resource_allocation_project
ON resource_allocations(project_id);

CREATE INDEX IF NOT EXISTS idx_resource_maintenance_resource
ON resource_maintenance(resource_id);