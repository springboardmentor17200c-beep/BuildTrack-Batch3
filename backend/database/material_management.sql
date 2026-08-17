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

CREATE INDEX IF NOT EXISTS idx_material_allocation_inventory
ON material_allocations(inventory_id);

CREATE INDEX IF NOT EXISTS idx_material_allocation_project
ON material_allocations(project_id);