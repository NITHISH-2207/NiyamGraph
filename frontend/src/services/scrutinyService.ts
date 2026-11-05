import { apiClient } from './apiClient';

export interface DashboardMetrics {
  total_assigned: number;
  awaiting_scrutiny: number;
  under_examination: number;
  deficiencies_pending: number;
  resubmissions_awaiting_review: number;
  completed_scrutiny_reports: number;
  overdue_tasks: number;
}

export interface ActivityItem {
  id: number;
  actor_name: string;
  actor_role: string;
  action: string;
  application_id?: string;
  remarks?: string;
  timestamp: string;
}

export interface PendingAction {
  type: string;
  title: string;
  institution: string;
  application_id: string;
  urgency: string;
  action_url: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recent_activities: ActivityItem[];
  pending_actions: PendingAction[];
}

export interface QueueItem {
  application_id: string;
  institution_id: string;
  institution_name: string;
  institution_category: string;
  application_type: string;
  academic_year: string;
  regional_office: string;
  assigned_by: string;
  assigned_date: string;
  submission_date: string;
  target_scrutiny_deadline?: string;
  processing_stage: string;
  current_status: string;
  pending_duration_days: number;
  days_to_deadline?: number;
  priority_level: 'HIGH' | 'NORMAL' | 'ESCALATED';
  priority_reason: string;
  documents_count: number;
  findings_count: number;
}

export interface QueueResponse {
  items: QueueItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface QueueFilters {
  search?: string;
  status?: string;
  application_type?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export interface ApplicationDetail {
  application_id: string;
  application_type: string;
  academic_year: string;
  status: string;
  submission_date: string;
  target_scrutiny_deadline?: string;
  priority_level: string;
  priority_reason?: string;
  institution: {
    id: string;
    permanent_id: string;
    name: string;
    category: string;
    state: string;
    district: string;
    address: string;
    pincode: string;
    contact_email: string;
    contact_phone?: string;
  };
  regional_office: {
    id: string;
    code: string;
    name: string;
    jurisdiction?: string[];
  };
}

export interface DocumentVersionInfo {
  version_number: number;
  file_name: string;
  sha256_checksum: string;
  change_summary?: string;
  uploaded_at: string;
}

export interface ApplicationDoc {
  document_id: string;
  application_id: string;
  document_category: string;
  file_name: string;
  file_size_bytes: number;
  file_mime_type: string;
  sha256_checksum: string;
  current_version: number;
  extraction_status: string;
  extracted_text?: string;
  extraction_metadata?: Record<string, unknown>;
  upload_timestamp: string;
  versions: DocumentVersionInfo[];
}

export interface RegulatoryRuleItem {
  id: string;
  regulation_name: string;
  clause_reference: string;
  title: string;
  requirement_description: string;
  category: string;
  source_document: string;
  source_page?: string;
  current_version: string;
  is_demonstration_data: boolean;
}

export interface ScrutinyFindingItem {
  id: string;
  application_id: string;
  rule_id: string;
  rule_clause: string;
  rule_title: string;
  ai_category: string;
  ai_confidence: number;
  observation_text: string;
  source_document_name?: string;
  source_page_number?: string;
  extracted_snippet?: string;
  officer_decision: string;
  officer_remarks?: string;
  verified_at?: string;
}

export interface ResubmissionDiffDoc {
  document_id: string;
  document_name: string;
  category: string;
  version_old: number;
  version_new: number;
  uploaded_at_old: string;
  uploaded_at_new: string;
  checksum_old: string;
  checksum_new: string;
  diff_text: string;
  summary: string;
}

export interface ResubmissionDiffData {
  application_id: string;
  has_resubmissions: boolean;
  resubmitted_documents: ResubmissionDiffDoc[];
}

export const scrutinyService = {
  async getDashboard(): Promise<DashboardData> {
    return apiClient.get<DashboardData>('/scrutiny/dashboard');
  },

  async getQueue(filters: QueueFilters = {}): Promise<QueueResponse> {
    return apiClient.get<QueueResponse>('/scrutiny/queue', { params: filters as Record<string, string | number | boolean> });
  },

  async getApplication(id: string): Promise<ApplicationDetail> {
    return apiClient.get<ApplicationDetail>(`/applications/${id}`);
  },

  async getDocuments(applicationId: string): Promise<ApplicationDoc[]> {
    return apiClient.get<ApplicationDoc[]>(`/applications/${applicationId}/documents`);
  },

  async extractDocument(documentId: string): Promise<{ document_id: string; extracted_text: string; status: string }> {
    return apiClient.post(`/documents/${documentId}/extract`);
  },

  async verifyDocument(
    documentId: string,
    action: 'APPROVE' | 'REVERSE',
    remarks?: string,
    deficiencyReason?: string
  ): Promise<{ success: boolean; status: string; action: string }> {
    return apiClient.patch(`/documents/${documentId}/verify`, {
      action,
      remarks,
      deficiency_reason: deficiencyReason,
    });
  },

  async getApplicableRules(applicationId: string): Promise<RegulatoryRuleItem[]> {
    return apiClient.get<RegulatoryRuleItem[]>(`/applications/${applicationId}/applicable-rules`);
  },

  async runScrutiny(applicationId: string): Promise<{ run_id: string; summary: string; findings_count: number }> {
    return apiClient.post(`/applications/${applicationId}/scrutiny-runs`);
  },

  async getRunFindings(runId: string): Promise<ScrutinyFindingItem[]> {
    return apiClient.get<ScrutinyFindingItem[]>(`/scrutiny-runs/${runId}/findings`);
  },

  async reviewFinding(
    findingId: string,
    decision: string,
    remarks?: string
  ): Promise<{ success: boolean; decision: string }> {
    return apiClient.patch(`/scrutiny-findings/${findingId}/review`, {
      decision,
      remarks,
    });
  },

  async draftDeficiencyNotice(
    applicationId: string,
    payload: {
      general_remarks?: string;
      cure_period_days?: number;
      items: Array<{
        rule_id: string;
        requirement_summary: string;
        observed_deficiency: string;
        source_document?: string;
        source_page?: string;
        required_correction: string;
        finding_id?: string;
      }>;
    }
  ): Promise<{ success: boolean; notice_id: string; reference_number: string }> {
    return apiClient.post(`/applications/${applicationId}/deficiency-notices/draft`, payload);
  },

  async issueDeficiencyNotice(
    noticeId: string,
    payload: { officer_remarks?: string } = {}
  ): Promise<{ success: boolean; notice_id: string; status: string }> {
    return apiClient.post(`/deficiency-notices/${noticeId}/issue`, payload);
  },

  async getDeficiencyHistory(applicationId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/applications/${applicationId}/deficiency-history`);
  },

  async getResubmissionDiff(applicationId: string): Promise<ResubmissionDiffData> {
    return apiClient.get<ResubmissionDiffData>(`/applications/${applicationId}/resubmission-diff`);
  },

  async getScrutinyReport(applicationId: string): Promise<any> {
    return apiClient.get(`/applications/${applicationId}/scrutiny-report`);
  },

  async completeScrutiny(applicationId: string): Promise<{ success: boolean; status: string }> {
    return apiClient.post(`/applications/${applicationId}/scrutiny-complete`);
  },

  async handoverStage(
    applicationId: string,
    nextStage: string,
    remarks?: string
  ): Promise<{ success: boolean; to_status: string }> {
    return apiClient.post(`/applications/${applicationId}/workflow/handover`, {
      next_stage: nextStage,
      officer_remarks: remarks,
    });
  },
};

