"""Initial schema

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enums with conditional logic to handle existing types
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE unitstatusenum AS ENUM ('healthy', 'warning', 'critical');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE sensortypeenum AS ENUM ('co2', 'temperature', 'airflow', 'efficiency');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE testrunstatusenum AS ENUM ('pending', 'running', 'completed', 'failed');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # Create dac_units table
    op.create_table(
        'dac_units',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('status', postgresql.ENUM('healthy', 'warning', 'critical', name='unitstatusenum', create_type=False), nullable=False),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    
    # Create sensor_readings table
    op.create_table(
        'sensor_readings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('unit_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sensor_type', postgresql.ENUM('co2', 'temperature', 'airflow', 'efficiency', name='sensortypeenum', create_type=False), nullable=False),
        sa.Column('value', sa.Numeric(10, 2), nullable=False),
        sa.Column('unit', sa.String(50), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['unit_id'], ['dac_units.id'], ),
    )
    op.create_index('ix_sensor_readings_timestamp', 'sensor_readings', ['timestamp'], unique=False)
    op.create_index('ix_sensor_readings_unit_id', 'sensor_readings', ['unit_id'], unique=False)
    
    # Create test_runs table
    op.create_table(
        'test_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('unit_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', postgresql.ENUM('pending', 'running', 'completed', 'failed', name='testrunstatusenum', create_type=False), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['unit_id'], ['dac_units.id'], ),
    )
    
    # Create test_results table
    op.create_table(
        'test_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('test_run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('passed', sa.Boolean(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ),
        sa.UniqueConstraint('test_run_id')
    )
    
    # Create test_metrics table
    op.create_table(
        'test_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('test_result_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('value', sa.Numeric(10, 2), nullable=False),
        sa.Column('unit', sa.String(50), nullable=False),
        sa.Column('threshold_min', sa.Numeric(10, 2), nullable=True),
        sa.Column('threshold_max', sa.Numeric(10, 2), nullable=True),
        sa.ForeignKeyConstraint(['test_result_id'], ['test_results.id'], ),
    )


def downgrade() -> None:
    op.drop_table('test_metrics')
    op.drop_table('test_results')
    op.drop_table('test_runs')
    op.drop_index('ix_sensor_readings_unit_id', table_name='sensor_readings')
    op.drop_index('ix_sensor_readings_timestamp', table_name='sensor_readings')
    op.drop_table('sensor_readings')
    op.drop_table('dac_units')
    op.execute('DROP TYPE testrunstatusenum')
    op.execute('DROP TYPE sensortypeenum')
    op.execute('DROP TYPE unitstatusenum')

