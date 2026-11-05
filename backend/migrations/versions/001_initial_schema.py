"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-05 16:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. roles
    op.create_table(
        'roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(50), nullable=False, unique=True),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_roles_name', 'roles', ['name'])

    # 2. users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('failed_login_attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('must_change_password', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # 3. user_roles
    op.create_table(
        'user_roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('roles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_user_roles_user_id', 'user_roles', ['user_id'])
    op.create_index('ix_user_roles_role_id', 'user_roles', ['role_id'])

    # 4. institutions
    op.create_table(
        'institutions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('identifier', sa.String(100), nullable=False, unique=True),
        sa.Column('official_name', sa.String(255), nullable=False),
        sa.Column('institution_type', sa.String(100), nullable=False),
        sa.Column('state', sa.String(100), nullable=False),
        sa.Column('district', sa.String(100), nullable=False),
        sa.Column('address', sa.Text(), nullable=False),
        sa.Column('official_email', sa.String(255), nullable=False),
        sa.Column('contact_number', sa.String(50), nullable=False),
        sa.Column('affiliation_or_university', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='Active'),
        sa.Column('verification_status', sa.String(50), nullable=False, server_default='Verified'),
        sa.Column('regional_office', sa.String(100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_institutions_identifier', 'institutions', ['identifier'])

    # 5. institution_users
    op.create_table(
        'institution_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_institution_users_institution_id', 'institution_users', ['institution_id'])

    # 6. revoked_tokens
    op.create_table(
        'revoked_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('jti', sa.String(100), nullable=False, unique=True),
        sa.Column('token_expiry', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_revoked_tokens_jti', 'revoked_tokens', ['jti'])
    op.create_index('ix_revoked_tokens_token_expiry', 'revoked_tokens', ['token_expiry'])

    # 7. application_types
    op.create_table(
        'application_types',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('code', sa.String(50), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('required_fields_json', sa.JSON(), nullable=False),
        sa.Column('required_documents_json', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_application_types_code', 'application_types', ['code'])

    # 8. applications
    op.create_table(
        'applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('reference_number', sa.String(100), nullable=False, unique=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('application_type_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('application_types.id'), nullable=False),
        sa.Column('academic_year', sa.String(20), nullable=False, server_default='2026-27'),
        sa.Column('status', sa.String(50), nullable=False, server_default='Draft'),
        sa.Column('current_stage', sa.String(100), nullable=False, server_default='Draft Preparation'),
        sa.Column('created_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('application_data', sa.JSON(), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('decision_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('decision_remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('Draft', 'Submitted', 'Under Scrutiny', 'Deficiency Raised', 'Resubmitted', 'Under Evaluation', 'Decision Pending', 'Approved', 'Rejected', 'Closed')",
            name='check_application_status'
        ),
    )
    op.create_index('ix_applications_reference_number', 'applications', ['reference_number'])
    op.create_index('ix_applications_institution_id', 'applications', ['institution_id'])
    op.create_index('ix_applications_status', 'applications', ['status'])

    # 9. application_status_history
    op.create_table(
        'application_status_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('application_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('from_status', sa.String(50), nullable=False),
        sa.Column('to_status', sa.String(50), nullable=False),
        sa.Column('changed_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_application_status_history_application_id', 'application_status_history', ['application_id'])

    # 10. application_academic_details
    op.create_table(
        'application_academic_details',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('application_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('program_name', sa.String(100), nullable=False),
        sa.Column('course_name', sa.String(255), nullable=False),
        sa.Column('intake_approved', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('intake_applied', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('nba_accreditation_status', sa.String(50), nullable=False, server_default='Not Eligible'),
        sa.Column('faculty_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('details_json', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_application_academic_details_application_id', 'application_academic_details', ['application_id'])

    # 11. application_submissions
    op.create_table(
        'application_submissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('application_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('submission_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('submitted_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('snapshot_json', sa.JSON(), nullable=False),
    )
    op.create_index('ix_application_submissions_application_id', 'application_submissions', ['application_id'])

    # 12. documents
    op.create_table(
        'documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('document_type', sa.String(100), nullable=False, server_default='GENERAL'),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('storage_key', sa.String(255), nullable=False, unique=True),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('checksum_sha256', sa.String(64), nullable=False),
        sa.Column('uploaded_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('review_status', sa.String(50), nullable=False, server_default='Pending'),
        sa.Column('version_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('previous_version_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('documents.id'), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_documents_institution_id', 'documents', ['institution_id'])
    op.create_index('ix_documents_entity_type', 'documents', ['entity_type'])
    op.create_index('ix_documents_entity_id', 'documents', ['entity_id'])
    op.create_index('ix_documents_storage_key', 'documents', ['storage_key'])
    op.create_index('ix_documents_is_deleted', 'documents', ['is_deleted'])

    # 13. deficiencies
    op.create_table(
        'deficiencies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('reference_number', sa.String(100), nullable=False, unique=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('application_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('clause_reference', sa.String(100), nullable=True),
        sa.Column('raised_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('raised_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('response_deadline', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='Open'),
        sa.Column('institution_response_text', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('review_remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_deficiencies_reference_number', 'deficiencies', ['reference_number'])
    op.create_index('ix_deficiencies_institution_id', 'deficiencies', ['institution_id'])
    op.create_index('ix_deficiencies_application_id', 'deficiencies', ['application_id'])
    op.create_index('ix_deficiencies_status', 'deficiencies', ['status'])

    # 14. deficiency_history
    op.create_table(
        'deficiency_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('deficiency_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('deficiencies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('actor_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_deficiency_history_deficiency_id', 'deficiency_history', ['deficiency_id'])

    # 15. compliance_requirements
    op.create_table(
        'compliance_requirements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('code', sa.String(50), nullable=False, unique=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('mandatory', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('applicable_academic_year', sa.String(20), nullable=False, server_default='2026-27'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_compliance_requirements_code', 'compliance_requirements', ['code'])

    # 16. institution_undertakings
    op.create_table(
        'institution_undertakings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('requirement_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('compliance_requirements.id', ondelete='CASCADE'), nullable=False),
        sa.Column('accepted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('accepted_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_institution_undertakings_institution_id', 'institution_undertakings', ['institution_id'])

    # 17. compliance_submissions
    op.create_table(
        'compliance_submissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('requirement_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('compliance_requirements.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='Pending'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('submitted_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verification_remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_compliance_submissions_institution_id', 'compliance_submissions', ['institution_id'])
    op.create_index('ix_compliance_submissions_status', 'compliance_submissions', ['status'])

    # 18. compliance_verification_history
    op.create_table(
        'compliance_verification_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('submission_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('compliance_submissions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status_from', sa.String(50), nullable=False),
        sa.Column('status_to', sa.String(50), nullable=False),
        sa.Column('verified_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_compliance_verification_history_submission_id', 'compliance_verification_history', ['submission_id'])

    # 19. notifications
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='CASCADE'), nullable=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(50), nullable=False, server_default='system'),
        sa.Column('related_application_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('applications.id', ondelete='SET NULL'), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])

    # 20. audit_logs
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('actor_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', sa.String(100), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('request_id', sa.String(100), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_audit_logs_actor_user_id', 'audit_logs', ['actor_user_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_entity_type', 'audit_logs', ['entity_type'])


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('notifications')
    op.drop_table('compliance_verification_history')
    op.drop_table('compliance_submissions')
    op.drop_table('institution_undertakings')
    op.drop_table('compliance_requirements')
    op.drop_table('deficiency_history')
    op.drop_table('deficiencies')
    op.drop_table('documents')
    op.drop_table('application_submissions')
    op.drop_table('application_academic_details')
    op.drop_table('application_status_history')
    op.drop_table('applications')
    op.drop_table('application_types')
    op.drop_table('revoked_tokens')
    op.drop_table('institution_users')
    op.drop_table('institutions')
    op.drop_table('user_roles')
    op.drop_table('users')
    op.drop_table('roles')

