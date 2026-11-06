import {
  DashboardResponse,
  ApplicationSummary,
  ApplicationDetail,
  ScrutinyReport,
  EVCReport,
  ComplianceAssessment,
  ComplianceFinding,
  ConsolidatedReport,
  ApprovalCondition,
  Notification,
  AuditLog,
  UserProfile
} from '../types/compliance';
import { complianceMockService } from './complianceMockService';

/**
 * NiyamGraph Compliance Officer API Adapter
 *
 * Configured in Standalone Prototype Mode using complianceMockService.
 * All operations execute locally in the browser with full interactive state,
 * zero network dependencies, and complete resistance to port 8000 backend connection errors.
 */
export const api = {
  // Dashboard
  getDashboard: (): Promise<DashboardResponse> => complianceMockService.getDashboard(),

  // Applications
  getApplications: (params: {
    search?: string;
    application_type?: string;
    current_stage?: string;
    regional_office?: string;
    scrutiny_status?: string;
    evc_status?: string;
    compliance_status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ total: number; page: number; page_size: number; applications: ApplicationSummary[] }> =>
    complianceMockService.getApplications(params),

  getApplicationDetail: (id: number): Promise<ApplicationDetail> =>
    complianceMockService.getApplicationDetail(id),

  // Scrutiny Reports
  getScrutinyReports: (): Promise<ScrutinyReport[]> => complianceMockService.getScrutinyReports(),
  getApplicationScrutinyReport: (appId: number): Promise<ScrutinyReport> =>
    complianceMockService.getApplicationScrutinyReport(appId),
  reviewScrutinyReport: (reportId: number, remarks: string): Promise<{ message: string }> =>
    complianceMockService.reviewScrutinyReport(reportId, remarks),
  requestScrutinyClarification: (
    reportId: number,
    reason: string,
    targetOfficer: string,
    findingId?: number
  ): Promise<{ message: string; clarification_id: number }> =>
    complianceMockService.requestScrutinyClarification(reportId, reason, targetOfficer, findingId),

  // EVC Reports
  getEVCReports: (): Promise<EVCReport[]> => complianceMockService.getEVCReports(),
  getApplicationEVCReport: (appId: number): Promise<EVCReport> =>
    complianceMockService.getApplicationEVCReport(appId),
  reviewEVCReport: (reportId: number, remarks: string): Promise<{ message: string }> =>
    complianceMockService.reviewEVCReport(reportId, remarks),
  requestEVCClarification: (
    reportId: number,
    reason: string,
    targetOfficer: string,
    findingId?: number
  ): Promise<{ message: string; clarification_id: number }> =>
    complianceMockService.requestEVCClarification(reportId, reason, targetOfficer, findingId),

  // Compliance Assessment Engine
  runAssessmentEngine: (appId: number): Promise<ComplianceAssessment> =>
    complianceMockService.runAssessmentEngine(appId),
  getApplicationAssessment: (appId: number): Promise<ComplianceAssessment> =>
    complianceMockService.getApplicationAssessment(appId),
  updateComplianceFinding: (
    assessmentId: number,
    findingId: number,
    data: {
      compliance_status?: string;
      severity?: string;
      officer_remarks?: string;
      reasoning?: string;
    }
  ): Promise<ComplianceFinding> =>
    complianceMockService.updateComplianceFinding(assessmentId, findingId, data),

  // Consolidated Reports & Mandatory Compliance Gate
  draftConsolidatedReport: (
    appId: number,
    officerRemarks: string,
    recommendation: string
  ): Promise<ConsolidatedReport> =>
    complianceMockService.draftConsolidatedReport(appId, officerRemarks, recommendation),
  getApplicationConsolidatedReport: (appId: number): Promise<ConsolidatedReport> =>
    complianceMockService.getApplicationConsolidatedReport(appId),
  updateConsolidatedReport: (
    reportId: number,
    data: {
      officer_remarks?: string;
      approval_recommendation?: string;
      report_status?: string;
    }
  ): Promise<ConsolidatedReport> =>
    complianceMockService.updateConsolidatedReport(reportId, data),
  submitConsolidatedReport: (reportId: number): Promise<ConsolidatedReport> =>
    complianceMockService.submitConsolidatedReport(reportId),
  getReportHistory: (reportId: number): Promise<ConsolidatedReport[]> =>
    complianceMockService.getReportHistory(reportId),

  // Approval Conditions
  getApprovalConditions: (statusFilter?: string): Promise<ApprovalCondition[]> =>
    complianceMockService.getApprovalConditions(statusFilter),
  updateApprovalCondition: (
    conditionId: number,
    data: {
      condition_status?: string;
      evidence_reference?: string;
      officer_remarks?: string;
    }
  ): Promise<ApprovalCondition> =>
    complianceMockService.updateApprovalCondition(conditionId, data),

  // Notifications
  getNotifications: (): Promise<Notification[]> => complianceMockService.getNotifications(),
  markNotificationRead: (id: number): Promise<{ status: string }> =>
    complianceMockService.markNotificationRead(id),

  // Audit Trail
  getAuditTrail: (appId?: number): Promise<AuditLog[]> =>
    complianceMockService.getAuditTrail(appId),

  // Auth
  login: async (username: string, _password?: string): Promise<{ access_token: string; user: UserProfile }> =>
    complianceMockService.login(username),
  getCurrentUser: (): Promise<UserProfile> => complianceMockService.getCurrentUser(),

  // Reset helper
  resetMockData: (): void => complianceMockService.resetDefaults(),
};
