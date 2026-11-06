export interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  regional_office: string;
}

export interface Institution {
  id: number;
  institution_id: string;
  name: string;
  institution_type?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
}

export interface ApplicationSummary {
  id: number;
  application_id: string;
  institution_id_str: string;
  institution_name: string;
  application_type: string;
  regional_office: string;
  academic_year: string;
  submission_date: string;
  current_stage: string;
  application_status: string;
  scrutiny_status: string;
  evc_status: string;
  compliance_status: string;
  assigned_compliance_officer: string;
  next_action: string;
  last_updated: string;
}

export interface RegulatoryRequirement {
  id: number;
  requirement_code: string;
  requirement_name: string;
  description: string;
  regulatory_reference: string;
  category: string;
  mandatory: boolean;
  applicability: string;
  expected_evidence?: string;
  verification_method: string;
  active: boolean;
}

export interface ScrutinyFinding {
  id: number;
  requirement_id: number;
  requirement_code?: string;
  requirement_name?: string;
  category?: string;
  regulatory_reference?: string;
  mandatory?: boolean;
  finding: string;
  finding_status: string;
  evidence_reference?: string;
  remarks?: string;
  created_at: string;
}

export interface ScrutinyReport {
  id: number;
  application_id: number;
  report_reference: string;
  scrutiny_officer_id: string;
  scrutiny_officer_name: string;
  report_version: string;
  report_status: string;
  findings_summary?: string;
  total_checked: number;
  satisfied_count: number;
  deficient_count: number;
  missing_docs_count: number;
  submitted_at: string;
  created_at: string;
  findings: ScrutinyFinding[];
}

export interface EVCFinding {
  id: number;
  requirement_id: number;
  requirement_code?: string;
  requirement_name?: string;
  category?: string;
  regulatory_reference?: string;
  mandatory?: boolean;
  finding: string;
  finding_status: string;
  category_type: string;
  evidence_reference?: string;
  remarks?: string;
  created_at: string;
}

export interface EVCReport {
  id: number;
  application_id: number;
  report_reference: string;
  evc_officer_id: string;
  evc_officer_name: string;
  report_version: string;
  inspection_date: string;
  report_status: string;
  findings_summary?: string;
  total_checked: number;
  verified_count: number;
  deficiency_count: number;
  geo_coordinates?: string;
  submitted_at: string;
  created_at: string;
  findings: EVCFinding[];
}

export interface ComplianceFinding {
  id: number;
  assessment_id: number;
  requirement_id: number;
  requirement_code?: string;
  requirement_name?: string;
  regulatory_reference?: string;
  category?: string;
  mandatory?: boolean;
  scrutiny_finding_id?: number;
  evc_finding_id?: number;
  scrutiny_finding_text?: string;
  scrutiny_finding_status?: string;
  evc_finding_text?: string;
  evc_finding_status?: string;
  compliance_status: string; // 'Satisfied' | 'Potential Deficiency' | 'Evidence Missing' | 'Pending Scrutiny' | 'Pending EVC' | 'Pending Both Reports' | 'Manual Verification Required' | 'Conflicting Findings' | 'Not Applicable' | 'Officer Verified'
  severity: string; // 'Normal' | 'Moderate' | 'Critical' | 'Mandatory'
  evidence_summary?: string;
  reasoning?: string;
  officer_remarks?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface ComplianceAssessment {
  id: number;
  application_id: number;
  assessment_version: string;
  assessment_status: string;
  total_applicable_requirements: number;
  satisfied_requirements: number;
  potential_deficiencies: number;
  missing_evidence: number;
  pending_verification: number;
  critical_deficiencies: number;
  conflicting_findings: number;
  compliance_percentage: number;
  engine_summary?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  findings: ComplianceFinding[];
}

export interface ConsolidatedReport {
  id: number;
  application_id: number;
  assessment_id: number;
  report_reference: string;
  report_version: number;
  report_status: string; // 'Draft' | 'Under Review' | 'Clarification Required' | 'Ready for Submission' | 'Submitted' | 'Returned for Revision' | 'Revised'
  scrutiny_report_reference?: string;
  evc_report_reference?: string;
  report_content?: string;
  officer_remarks?: string;
  mandatory_deficiencies_summary?: string;
  conflicting_findings_summary?: string;
  approval_recommendation?: string;
  submitted_by?: string;
  submitted_at?: string;
  created_at: string;
}

export interface ApprovalCondition {
  id: number;
  application_id: number;
  application_identifier?: string;
  institution_name?: string;
  condition_code: string;
  condition_description: string;
  regulatory_reference: string;
  mandatory: boolean;
  issue_date: string;
  due_date: string;
  condition_status: string; // 'Pending' | 'In Progress' | 'Evidence Submitted' | 'Under Verification' | 'Satisfied' | 'Overdue'
  evidence_reference?: string;
  officer_remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface ClarificationRequest {
  id: number;
  application_id: number;
  source_report_type: string;
  source_report_id: number;
  related_finding_id?: number;
  requested_by: string;
  target_officer_name: string;
  clarification_reason: string;
  clarification_status: string;
  response_text?: string;
  requested_at: string;
  resolved_at?: string;
}

export interface ApplicationDetail extends ApplicationSummary {
  institution: Institution;
  scrutiny_report?: ScrutinyReport;
  evc_report?: EVCReport;
  assessment?: ComplianceAssessment;
  consolidated_report?: ConsolidatedReport;
  approval_conditions: ApprovalCondition[];
  clarification_requests: ClarificationRequest[];
}

export interface DashboardStatistics {
  assigned_applications: number;
  awaiting_scrutiny: number;
  awaiting_evc: number;
  both_reports_submitted: number;
  ready_for_compliance_review: number;
  critical_compliance_gaps: number;
  pending_consolidated_reports: number;
  pending_approval_conditions: number;
  total_approved_academic_cycle: number;
}

export interface PriorityAlert {
  id: number;
  application_id_str: string;
  application_id: number;
  institution_name: string;
  category: string;
  priority: string;
  date: string;
  required_action: string;
  navigation_url: string;
}

export interface RecentActivityItem {
  id: number;
  timestamp: string;
  application_id_str: string;
  application_id?: number;
  institution_name: string;
  activity_type: string;
  description: string;
  officer: string;
}

export interface DashboardResponse {
  statistics: DashboardStatistics;
  priority_alerts: PriorityAlert[];
  recent_applications: ApplicationSummary[];
  recent_activity: RecentActivityItem[];
  regulatory_cycle: string;
  officer_name: string;
  officer_role: string;
}

export interface AuditLog {
  id: number;
  user_id: string;
  officer_name: string;
  role: string;
  application_id?: number;
  application_id_str?: string;
  action: string;
  related_record_type?: string;
  related_record_id?: string;
  remarks?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: string;
  application_id?: number;
  application_id_str?: string;
  title: string;
  description: string;
  priority: string;
  notification_type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

