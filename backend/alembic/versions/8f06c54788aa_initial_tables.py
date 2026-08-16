"""Initial Tables

Revision ID: 8f06c54788aa
Revises:
Create Date: 2026-07-22 11:37:34
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8f06c54788aa"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ==========================================================
    # USERS
    # ==========================================================

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=30), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )

    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True,
    )

    # ==========================================================
    # PROJECTS
    # ==========================================================

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_name", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=True),
        sa.Column("budget", sa.Float(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("manager_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["manager_id"],
            ["users.id"],
        ),
    )

    op.create_index(
        "ix_projects_manager_id",
        "projects",
        ["manager_id"],
    )

    # ==========================================================
    # PROJECT MILESTONES
    # ==========================================================

    op.create_table(
        "project_milestones",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column(
            "milestone_name",
            sa.String(length=150),
            nullable=False,
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("completed_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=True,
            server_default="Pending",
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
    )

    op.create_index(
        "ix_project_milestones_project_id",
        "project_milestones",
        ["project_id"],
    )

    # ==========================================================
    # RESOURCES
    # ==========================================================

    op.create_table(
        "resources",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column(
            "resource_name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "category",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column(
            "unit",
            sa.String(length=20),
            nullable=False,
            server_default="Units",
        ),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=True,
            server_default="Available",
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
    )

    op.create_index(
        "ix_resources_project_id",
        "resources",
        ["project_id"],
    )

    # ==========================================================
    # INVENTORY
    # ==========================================================

    op.create_table(
        "inventory",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column(
            "material_name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "category",
            sa.String(length=50),
            nullable=True,
            server_default="Cement",
        ),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column(
            "unit",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "minimum_stock",
            sa.Integer(),
            nullable=True,
            server_default="10",
        ),
        sa.Column(
            "supplier",
            sa.String(length=100),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
    )

    op.create_index(
        "ix_inventory_project_id",
        "inventory",
        ["project_id"],
    )

    # ==========================================================
    # WORKERS
    # ==========================================================

    op.create_table(
        "workers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column(
            "designation",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column("salary", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
    )

    op.create_index(
        "ix_workers_project_id",
        "workers",
        ["project_id"],
    )

    # ==========================================================
    # ATTENDANCE
    # ==========================================================

    op.create_table(
        "attendance",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("worker_id", sa.Integer(), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column(
            "attendance_date",
            sa.Date(),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column("check_in", sa.String(length=20), nullable=True),
        sa.Column("check_out", sa.String(length=20), nullable=True),
        sa.ForeignKeyConstraint(
            ["worker_id"],
            ["workers.id"],
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
    )

    op.create_index(
        "ix_attendance_worker_id",
        "attendance",
        ["worker_id"],
    )

    op.create_index(
        "ix_attendance_project_id",
        "attendance",
        ["project_id"],
    )

    op.create_index(
        "ix_attendance_attendance_date",
        "attendance",
        ["attendance_date"],
    )

    # ==========================================================
    # PROCUREMENTS
    # ==========================================================

    op.create_table(
        "procurements",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("material_name", sa.String(length=100)),
        sa.Column(
            "category",
            sa.String(length=50),
            nullable=True,
            server_default="Raw Materials",
        ),
        sa.Column("supplier", sa.String(length=100)),
        sa.Column(
            "vendor_contact",
            sa.String(length=50),
            nullable=True,
        ),
        sa.Column(
            "invoice_number",
            sa.String(length=50),
            nullable=True,
        ),
        sa.Column(
            "payment_status",
            sa.String(length=30),
            nullable=True,
            server_default="Pending",
        ),
        sa.Column("quantity", sa.Integer()),
        sa.Column("total_cost", sa.Float(), nullable=False),
        sa.Column("purchase_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="Pending",
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
    )

    op.create_index(
        "ix_procurements_project_id",
        "procurements",
        ["project_id"],
    )

    op.create_index(
        "ix_procurements_status",
        "procurements",
        ["status"],
    )

    # ==========================================================
    # NOTIFICATIONS
    # ==========================================================

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column(
            "notification_type",
            sa.String(length=50),
            nullable=True,
            server_default="System Notification",
        ),
        sa.Column("title", sa.String(length=150)),
        sa.Column("message", sa.Text()),
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=True,
            server_default=sa.text("FALSE"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
    )

    op.create_index(
        "ix_notifications_user_id",
        "notifications",
        ["user_id"],
    )

    # ==========================================================
    # REPORTS
    # ==========================================================

    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("generated_by", sa.Integer(), nullable=True),
        sa.Column(
            "report_type",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column("report_url", sa.String(length=255)),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["generated_by"],
            ["users.id"],
        ),
    )

    op.create_index(
        "ix_reports_project_id",
        "reports",
        ["project_id"],
    )

    op.create_index(
        "ix_reports_generated_by",
        "reports",
        ["generated_by"],
    )

    op.create_index(
        "ix_reports_report_type",
        "reports",
        ["report_type"],
    )

    # ==========================================================
    # DOCUMENTS
    # ==========================================================

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("uploaded_by", sa.Integer(), nullable=True),
        sa.Column(
            "file_name",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column("file_type", sa.String(length=50)),
        sa.Column("file_path", sa.String(length=255)),
        sa.Column("description", sa.Text()),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["uploaded_by"],
            ["users.id"],
        ),
    )

    op.create_index(
        "ix_documents_project_id",
        "documents",
        ["project_id"],
    )

    op.create_index(
        "ix_documents_uploaded_by",
        "documents",
        ["uploaded_by"],
    )

    # ==========================================================
    # VENDORS
    # ==========================================================

    op.create_table(
        "vendors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "contact_person",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column("phone", sa.String(length=20)),
        sa.Column("email", sa.String(length=100)),
        sa.Column("address", sa.Text()),
    )

    # ==========================================================
    # MATERIAL REQUESTS
    # ==========================================================

    op.create_table(
        "material_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("requested_by", sa.Integer(), nullable=True),
        sa.Column(
            "material_name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit", sa.String(length=20)),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="Pending",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["requested_by"],
            ["users.id"],
        ),
    )

    # ==========================================================
    # PURCHASE ORDERS
    # ==========================================================

    op.create_table(
        "purchase_orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("po_number", sa.String(length=50), nullable=False),
        sa.Column("vendor_id", sa.Integer(), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("request_id", sa.Integer(), nullable=True),
        sa.Column("total_amount", sa.Float(), nullable=False, server_default="0"),
        sa.Column("expected_delivery_date", sa.Date()),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="Created",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["vendor_id"],
            ["vendors.id"],
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["request_id"],
            ["material_requests.id"],
        ),
    )

    # ==========================================================
    # INVOICES
    # ==========================================================

    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "invoice_no",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column("vendor_id", sa.Integer(), nullable=True),
        sa.Column("purchase_order_id", sa.Integer(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False, server_default="0"),
        sa.Column("gst", sa.Float(), nullable=False, server_default="0"),
        sa.Column("invoice_date", sa.Date(), nullable=False),
        sa.Column(
            "payment_status",
            sa.String(length=30),
            nullable=False,
            server_default="Pending",
        ),
        sa.ForeignKeyConstraint(
            ["vendor_id"],
            ["vendors.id"],
        ),
        sa.ForeignKeyConstraint(
            ["purchase_order_id"],
            ["purchase_orders.id"],
        ),
        sa.UniqueConstraint(
            "invoice_no",
            name="uq_invoices_invoice_no",
        ),
    )


def downgrade() -> None:

    op.drop_table("invoices")
    op.drop_table("purchase_orders")
    op.drop_table("material_requests")
    op.drop_table("vendors")
    op.drop_table("documents")
    op.drop_table("reports")
    op.drop_table("notifications")
    op.drop_table("procurements")
    op.drop_table("attendance")
    op.drop_table("workers")
    op.drop_table("inventory")
    op.drop_table("resources")
    op.drop_table("project_milestones")
    op.drop_table("projects")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")