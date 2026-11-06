import {
  ApplicationSummary,
  ApplicationDetail,
  Institution,
  RegulatoryRequirement,
  ScrutinyReport,
  EVCReport,
  ComplianceAssessment,
  ComplianceFinding,
  ConsolidatedReport,
  ApprovalCondition,
  ClarificationRequest,
  DashboardResponse,
  DashboardStatistics,
  PriorityAlert,
  RecentActivityItem,
  Notification,
  AuditLog,
  UserProfile
} from '../types/compliance';
import { mockRequirements } from '../data/mockRequirements';
import { mockInstitutions, mockApplications } from '../data/mockApplications';
import {
  mockScrutinyReports,
  mockEvcReports,
  mockAssessments,
  mockConsolidatedReports,
  mockApprovalConditions,
  mockClarificationRequests,
  mockPriorityAlerts,
  mockRecentActivity,
  mockNotifications,
  mockAuditLogs,
} from '../data/mockReports';

// Storage keys
const STORAGE_KEYS = {
  APPLICATIONS: 'niyamgraph_mock_apps_v2',
  INSTITUTIONS: 'niyamgraph_mock_inst_v2',
  SCRUTINY: 'niyamgraph_mock_scrutiny_v2',
  EVC: 'niyamgraph_mock_evc_v2',
  ASSESSMENTS: 'niyamgraph_mock_assessments_v2',
  CONSOLIDATED: 'niyamgraph_mock_consolidated_v2',
  CONDITIONS: 'niyamgraph_mock_conditions_v2',
  CLARIFICATIONS: 'niyamgraph_mock_clarifications_v2',
  NOTIFICATIONS: 'niyamgraph_mock_notifications_v2',
  AUDIT: 'niyamgraph_mock_audit_v2',
};

// Helper: load from localStorage with initial fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to parse localStorage key ${key}, falling back to default`, err);
    return fallback;
  }
}

// Helper: save to localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to localStorage key ${key}`, err);
  }
}

// Simulate minimal async delay (realistic smooth UX, non-blocking)
const delay = (ms = 35) => new Promise((resolve) => setTimeout(resolve, ms));

class ComplianceMockService {
  private applications: ApplicationSummary[];
  private institutions: Institution[];
  private scrutinyReports: ScrutinyReport[];
  private evcReports: EVCReport[];
  private assessments: ComplianceAssessment[];
  private consolidatedReports: ConsolidatedReport[];
  private approvalConditions: ApprovalCondition[];
  private clarificationRequests: ClarificationRequest[];
  private notifications: Notification[];
  private auditLogs: AuditLog[];

  constructor() {
    this.institutions = loadFromStorage(STORAGE_KEYS.INSTITUTIONS, mockInstitutions);
    this.applications = loadFromStorage(STORAGE_KEYS.APPLICATIONS, mockApplications);
    this.scrutinyReports = loadFromStorage(STORAGE_KEYS.SCRUTINY, mockScrutinyReports);
    this.evcReports = loadFromStorage(STORAGE_KEYS.EVC, mockEvcReports);
    this.assessments = loadFromStorage(STORAGE_KEYS.ASSESSMENTS, mockAssessments);
    this.consolidatedReports = loadFromStorage(STORAGE_KEYS.CONSOLIDATED, mockConsolidatedReports);
    this.approvalConditions = loadFromStorage(STORAGE_KEYS.CONDITIONS, mockApprovalConditions);
    this.clarificationRequests = loadFromStorage(STORAGE_KEYS.CLARIFICATIONS, mockClarificationRequests);
    this.notifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
    this.auditLogs = loadFromStorage(STORAGE_KEYS.AUDIT, mockAuditLogs);
  }

  // Persist current state
  private persist(key: keyof typeof STORAGE_KEYS) {
    switch (key) {
      case 'APPLICATIONS':
        saveToStorage(STORAGE_KEYS.APPLICATIONS, this.applications);
        break;
      case 'INSTITUTIONS':
        saveToStorage(STORAGE_KEYS.INSTITUTIONS, this.institutions);
        break;
      case 'SCRUTINY':
        saveToStorage(STORAGE_KEYS.SCRUTINY, this.scrutinyReports);
        break;
      case 'EVC':
        saveToStorage(STORAGE_KEYS.EVC, this.evcReports);
        break;
      case 'ASSESSMENTS':
        saveToStorage(STORAGE_KEYS.ASSESSMENTS, this.assessments);
        break;
      case 'CONSOLIDATED':
        saveToStorage(STORAGE_KEYS.CONSOLIDATED, this.consolidatedReports);
        break;
      case 'CONDITIONS':
        saveToStorage(STORAGE_KEYS.CONDITIONS, this.approvalConditions);
        break;
      case 'CLARIFICATIONS':
        saveToStorage(STORAGE_KEYS.CLARIFICATIONS, this.clarificationRequests);
        break;
      case 'NOTIFICATIONS':
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
        break;
      case 'AUDIT':
        saveToStorage(STORAGE_KEYS.AUDIT, this.auditLogs);
        break;
    }
  }

  // Log Audit Entry
  private logAudit(
    action: string,
    remarks: string,
    applicationId?: number,
    applicationIdStr?: string,
    recordType?: string,
    recordId?: string
  ) {
    const entry: AuditLog = {
      id: Date.now(),
      user_id: 'OFF-COMP-01',
      officer_name: 'Dr. Suresh Varma',
      role: 'Compliance Officer',
      application_id: applicationId,
      application_id_str: applicationIdStr,
      action,
      related_record_type: recordType,
      related_record_id: recordId,
      remarks,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    this.persist('AUDIT');
  }

  // 1. Dashboard
  async getDashboard(): Promise<DashboardResponse> {
    await delay();
    const assignedApps = this.applications.filter((a) => a.assigned_compliance_officer.includes('Varma'));

    const awaitingScrutiny = this.applications.filter(
      (a) => a.scrutiny_status !== 'Submitted' && a.scrutiny_status !== 'Completed'
    ).length;

    const awaitingEvc = this.applications.filter(
      (a) => (a.scrutiny_status === 'Submitted' || a.scrutiny_status === 'Completed') &&
             a.evc_status !== 'Submitted' && a.evc_status !== 'Completed'
    ).length;

    const bothSubmitted = this.applications.filter(
      (a) => (a.scrutiny_status === 'Submitted' || a.scrutiny_status === 'Completed') &&
             (a.evc_status === 'Submitted' || a.evc_status === 'Completed')
    ).length;

    const readyForReview = this.applications.filter(
      (a) => a.compliance_status === 'Ready for Compliance Report' || a.compliance_status === 'Ready for Review'
    ).length;

    const criticalGaps = this.assessments.filter(
      (ass) => ass.critical_deficiencies > 0 || ass.conflicting_findings > 0
    ).length;

    const submittedReports = this.consolidatedReports.filter((r) => r.report_status === 'Submitted').length;
    const pendingConsolidated = Math.max(0, bothSubmitted - submittedReports);

    const pendingConditions = this.approvalConditions.filter(
      (c) => c.condition_status !== 'Satisfied'
    ).length;

    const totalApproved = this.applications.filter(
      (a) => a.application_status === 'Recommended for Approval' || a.application_status === 'Approved with Conditions'
    ).length;

    const statistics: DashboardStatistics = {
      assigned_applications: assignedApps.length,
      awaiting_scrutiny: awaitingScrutiny,
      awaiting_evc: awaitingEvc,
      both_reports_submitted: bothSubmitted,
      ready_for_compliance_review: readyForReview,
      critical_compliance_gaps: criticalGaps,
      pending_consolidated_reports: pendingConsolidated,
      pending_approval_conditions: pendingConditions,
      total_approved_academic_cycle: totalApproved,
    };

    return {
      statistics,
      priority_alerts: mockPriorityAlerts,
      recent_applications: this.applications.slice(0, 5),
      recent_activity: mockRecentActivity,
      regulatory_cycle: '2026-27 Approval Cycle',
      officer_name: 'Dr. Suresh Varma',
      officer_role: 'Senior Compliance Officer, AICTE Western Region',
    };
  }

  // 2. Applications Registry with Filtering & Pagination
  async getApplications(params: {
    search?: string;
    application_type?: string;
    current_stage?: string;
    regional_office?: string;
    scrutiny_status?: string;
    evc_status?: string;
    compliance_status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ total: number; page: number; page_size: number; applications: ApplicationSummary[] }> {
    await delay();
    let filtered = [...this.applications];

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.application_id.toLowerCase().includes(q) ||
          a.institution_name.toLowerCase().includes(q) ||
          a.institution_id_str.toLowerCase().includes(q)
      );
    }

    if (params.application_type) {
      filtered = filtered.filter((a) => a.application_type === params.application_type);
    }
    if (params.current_stage) {
      filtered = filtered.filter((a) => a.current_stage === params.current_stage);
    }
    if (params.regional_office) {
      filtered = filtered.filter((a) => a.regional_office === params.regional_office);
    }
    if (params.scrutiny_status) {
      filtered = filtered.filter((a) => a.scrutiny_status === params.scrutiny_status);
    }
    if (params.evc_status) {
      filtered = filtered.filter((a) => a.evc_status === params.evc_status);
    }
    if (params.compliance_status) {
      filtered = filtered.filter((a) => a.compliance_status === params.compliance_status);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const pageSize = params.page_size || 8;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      total,
      page,
      page_size: pageSize,
      applications: paginated,
    };
  }

  // 3. Application Detail Dossier (Complete 9-section view)
  async getApplicationDetail(id: number): Promise<ApplicationDetail> {
    await delay();
    const app = this.applications.find((a) => a.id === Number(id));
    if (!app) {
      throw new Error(`Application ID #${id} not found.`);
    }

    const institution =
      this.institutions.find((i) => i.institution_id === app.institution_id_str) ||
      this.institutions.find((i) => i.id === app.id) ||
      this.institutions[0];

    const scrutinyReport = this.scrutinyReports.find((r) => r.application_id === app.id);
    const evcReport = this.evcReports.find((r) => r.application_id === app.id);
    const assessment = this.assessments.find((ass) => ass.application_id === app.id);
    const consolidatedReport = this.consolidatedReports.find((r) => r.application_id === app.id);
    const conditions = this.approvalConditions.filter((c) => c.application_id === app.id);
    const clarifications = this.clarificationRequests.filter((c) => c.application_id === app.id);

    return {
      ...app,
      institution,
      scrutiny_report: scrutinyReport,
      evc_report: evcReport,
      assessment: assessment,
      consolidated_report: consolidatedReport,
      approval_conditions: conditions,
      clarification_requests: clarifications,
    };
  }

  // 4. Scrutiny Reports
  async getScrutinyReports(): Promise<ScrutinyReport[]> {
    await delay();
    return [...this.scrutinyReports];
  }

  async getApplicationScrutinyReport(appId: number): Promise<ScrutinyReport> {
    await delay();
    const report = this.scrutinyReports.find((r) => r.application_id === Number(appId));
    if (!report) {
      throw new Error(`Scrutiny report for Application #${appId} not found.`);
    }
    return report;
  }

  async reviewScrutinyReport(reportId: number, remarks: string): Promise<{ message: string }> {
    await delay();
    const report = this.scrutinyReports.find((r) => r.id === Number(reportId));
    if (report) {
      report.report_status = 'Completed';
      this.persist('SCRUTINY');
      this.logAudit(
        'MARK_SCRUTINY_REVIEWED',
        remarks || 'Scrutiny report reviewed by Compliance Officer.',
        report.application_id,
        undefined,
        'ScrutinyReport',
        report.report_reference
      );
    }
    return { message: 'Scrutiny report marked as reviewed.' };
  }

  async requestScrutinyClarification(
    reportId: number,
    reason: string,
    targetOfficer: string,
    findingId?: number
  ): Promise<{ message: string; clarification_id: number }> {
    await delay();
    const report = this.scrutinyReports.find((r) => r.id === Number(reportId));
    const newId = Date.now();
    const req: ClarificationRequest = {
      id: newId,
      application_id: report ? report.application_id : 1,
      source_report_type: 'Scrutiny',
      source_report_id: reportId,
      related_finding_id: findingId,
      requested_by: 'Dr. Suresh Varma (Compliance Officer)',
      target_officer_name: targetOfficer,
      clarification_reason: reason,
      clarification_status: 'Awaiting Response',
      requested_at: new Date().toISOString(),
    };
    this.clarificationRequests.unshift(req);
    this.persist('CLARIFICATIONS');

    this.logAudit(
      'REQUEST_SCRUTINY_CLARIFICATION',
      `Requested clarification from ${targetOfficer}: "${reason}"`,
      report ? report.application_id : undefined,
      undefined,
      'ClarificationRequest',
      String(newId)
    );

    return { message: 'Clarification request dispatched to Scrutiny Officer.', clarification_id: newId };
  }

  // 5. EVC Inspection Reports
  async getEVCReports(): Promise<EVCReport[]> {
    await delay();
    return [...this.evcReports];
  }

  async getApplicationEVCReport(appId: number): Promise<EVCReport> {
    await delay();
    const report = this.evcReports.find((r) => r.application_id === Number(appId));
    if (!report) {
      throw new Error(`EVC report for Application #${appId} not found.`);
    }
    return report;
  }

  async reviewEVCReport(reportId: number, remarks: string): Promise<{ message: string }> {
    await delay();
    const report = this.evcReports.find((r) => r.id === Number(reportId));
    if (report) {
      report.report_status = 'Completed';
      this.persist('EVC');
      this.logAudit(
        'MARK_EVC_REVIEWED',
        remarks || 'EVC physical inspection report reviewed by Compliance Officer.',
        report.application_id,
        undefined,
        'EVCReport',
        report.report_reference
      );
    }
    return { message: 'EVC report marked as reviewed.' };
  }

  async requestEVCClarification(
    reportId: number,
    reason: string,
    targetOfficer: string,
    findingId?: number
  ): Promise<{ message: string; clarification_id: number }> {
    await delay();
    const report = this.evcReports.find((r) => r.id === Number(reportId));
    const newId = Date.now();
    const req: ClarificationRequest = {
      id: newId,
      application_id: report ? report.application_id : 1,
      source_report_type: 'EVC',
      source_report_id: reportId,
      related_finding_id: findingId,
      requested_by: 'Dr. Suresh Varma (Compliance Officer)',
      target_officer_name: targetOfficer,
      clarification_reason: reason,
      clarification_status: 'Awaiting Response',
      requested_at: new Date().toISOString(),
    };
    this.clarificationRequests.unshift(req);
    this.persist('CLARIFICATIONS');

    this.logAudit(
      'REQUEST_EVC_CLARIFICATION',
      `Requested clarification from ${targetOfficer}: "${reason}"`,
      report ? report.application_id : undefined,
      undefined,
      'ClarificationRequest',
      String(newId)
    );

    return { message: 'Clarification request dispatched to EVC Inspector.', clarification_id: newId };
  }

  // 6. Flagship Consolidated Compliance Assessment Engine
  async runAssessmentEngine(appId: number): Promise<ComplianceAssessment> {
    await delay();
    const app = this.applications.find((a) => a.id === Number(appId));
    if (!app) throw new Error(`Application #${appId} not found.`);

    const scrutiny = this.scrutinyReports.find((r) => r.application_id === Number(appId));
    const evc = this.evcReports.find((r) => r.application_id === Number(appId));

    const findings: ComplianceFinding[] = mockRequirements.map((req, idx) => {
      const scrFinding = scrutiny?.findings.find((f) => f.requirement_id === req.id || f.requirement_code === req.requirement_code);
      const evcFinding = evc?.findings.find((f) => f.requirement_id === req.id || f.requirement_code === req.requirement_code);

      const scrStatus = scrFinding?.finding_status || 'Pending Scrutiny';
      const evcStatus = evcFinding?.finding_status || 'Pending EVC';

      let complianceStatus = 'Satisfied';
      let severity = req.mandatory ? 'Mandatory' : 'Normal';
      let reasoning = 'Requirement independently verified by Scrutiny and EVC.';

      // Conflict logic: Scrutiny says Satisfied, but EVC on-site discovered Deficiency
      if (scrStatus === 'Satisfied' && (evcStatus === 'Deficiency' || evcStatus === 'Deficient')) {
        complianceStatus = 'Conflicting Findings';
        severity = 'Critical';
        reasoning = 'Direct contradiction: Scrutiny accepted documentary evidence, but physical EVC inspection revealed non-compliance on site.';
      } else if (scrStatus === 'Deficient' || evcStatus === 'Deficiency' || evcStatus === 'Deficient') {
        complianceStatus = 'Potential Deficiency';
        severity = req.mandatory ? 'Critical' : 'Moderate';
        reasoning = 'Deficiency confirmed by regulatory review team.';
      } else if (scrStatus === 'Missing Documents') {
        complianceStatus = 'Evidence Missing';
        severity = 'Moderate';
        reasoning = 'Mandatory statutory documentation missing from submitted dossier.';
      } else if (!scrFinding && !evcFinding) {
        complianceStatus = 'Pending Both Reports';
        severity = req.mandatory ? 'Mandatory' : 'Normal';
        reasoning = 'Neither Scrutiny nor EVC report is currently available.';
      } else if (!evcFinding) {
        complianceStatus = 'Pending EVC';
        severity = 'Normal';
        reasoning = 'Awaiting physical on-site verification report.';
      } else if (!scrFinding) {
        complianceStatus = 'Pending Scrutiny';
        severity = 'Normal';
        reasoning = 'Awaiting primary documentary verification report.';
      }

      return {
        id: (appId * 1000) + idx,
        assessment_id: 300 + appId,
        requirement_id: req.id,
        requirement_code: req.requirement_code,
        requirement_name: req.requirement_name,
        regulatory_reference: req.regulatory_reference,
        category: req.category,
        mandatory: req.mandatory,
        scrutiny_finding_id: scrFinding?.id,
        evc_finding_id: evcFinding?.id,
        scrutiny_finding_text: scrFinding?.finding || 'No scrutiny finding recorded.',
        scrutiny_finding_status: scrStatus,
        evc_finding_text: evcFinding?.finding || 'No EVC finding recorded.',
        evc_finding_status: evcStatus,
        compliance_status: complianceStatus,
        severity,
        evidence_summary: `Scrutiny: ${scrFinding?.evidence_reference || 'N/A'} | EVC: ${evcFinding?.evidence_reference || 'N/A'}`,
        reasoning,
        officer_remarks: complianceStatus === 'Satisfied' ? 'Complies with prescribed regulatory standards.' : 'Requires officer intervention before approval.',
        reviewed_by: 'Dr. Suresh Varma',
        reviewed_at: new Date().toISOString(),
      };
    });

    const total = findings.length;
    const satisfied = findings.filter((f) => f.compliance_status === 'Satisfied').length;
    const deficiencies = findings.filter((f) => f.compliance_status === 'Potential Deficiency').length;
    const missing = findings.filter((f) => f.compliance_status === 'Evidence Missing').length;
    const pending = findings.filter((f) => f.compliance_status.startsWith('Pending')).length;
    const conflicting = findings.filter((f) => f.compliance_status === 'Conflicting Findings').length;
    const critical = findings.filter((f) => f.severity === 'Critical').length;
    const percentage = total > 0 ? Math.round((satisfied / total) * 1000) / 10 : 0;

    let assessmentStatus = 'Completed';
    let engineSummary = `Assessment Engine synthesized Scrutiny and EVC data. Compliance score: ${percentage}%.`;

    if (critical > 0 || conflicting > 0) {
      assessmentStatus = 'Flagged - Mandatory Gaps';
      engineSummary = `MANDATORY COMPLIANCE WARNING: Detected ${conflicting} Conflicting Finding(s) and ${critical} Critical Deficiencies. Mandatory Gate is active.`;
      app.compliance_status = 'Critical Deficiency Identified';
    } else if (percentage === 100) {
      assessmentStatus = 'Completed';
      engineSummary = 'All statutory criteria 100% satisfied across both documentary scrutiny and physical inspection.';
      app.compliance_status = 'Ready for Compliance Report';
    } else {
      assessmentStatus = 'Under Review';
      app.compliance_status = 'Action Required';
    }

    const assessment: ComplianceAssessment = {
      id: 300 + appId,
      application_id: appId,
      assessment_version: '1.2',
      assessment_status: assessmentStatus,
      total_applicable_requirements: total,
      satisfied_requirements: satisfied,
      potential_deficiencies: deficiencies,
      missing_evidence: missing,
      pending_verification: pending,
      critical_deficiencies: critical,
      conflicting_findings: conflicting,
      compliance_percentage: percentage,
      engine_summary: engineSummary,
      created_by: 'Compliance Assessment Engine v2.4 (Automated)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      findings,
    };

    // Update in-memory assessments
    const existingIndex = this.assessments.findIndex((ass) => ass.application_id === appId);
    if (existingIndex >= 0) {
      this.assessments[existingIndex] = assessment;
    } else {
      this.assessments.push(assessment);
    }
    this.persist('ASSESSMENTS');
    this.persist('APPLICATIONS');

    this.logAudit(
      'EXECUTE_ASSESSMENT_ENGINE',
      `Assessment Engine run for ${app.application_id}: ${percentage}% compliance (${satisfied}/${total} satisfied, ${conflicting} conflicts, ${critical} critical gaps).`,
      app.id,
      app.application_id,
      'ComplianceAssessment',
      String(assessment.id)
    );

    return assessment;
  }

  async getApplicationAssessment(appId: number): Promise<ComplianceAssessment> {
    await delay();
    const existing = this.assessments.find((ass) => ass.application_id === Number(appId));
    if (existing) return existing;
    // If not generated yet, auto-run assessment engine
    return this.runAssessmentEngine(appId);
  }

  async updateComplianceFinding(
    assessmentId: number,
    findingId: number,
    data: {
      compliance_status?: string;
      severity?: string;
      officer_remarks?: string;
      reasoning?: string;
    }
  ): Promise<ComplianceFinding> {
    await delay();
    const assessment = this.assessments.find((ass) => ass.id === Number(assessmentId));
    if (!assessment) throw new Error(`Assessment #${assessmentId} not found.`);

    const finding = assessment.findings.find((f) => f.id === Number(findingId));
    if (!finding) throw new Error(`Finding #${findingId} not found in assessment.`);

    if (data.compliance_status) finding.compliance_status = data.compliance_status;
    if (data.severity) finding.severity = data.severity;
    if (data.officer_remarks) finding.officer_remarks = data.officer_remarks;
    if (data.reasoning) finding.reasoning = data.reasoning;
    finding.reviewed_by = 'Dr. Suresh Varma';
    finding.reviewed_at = new Date().toISOString();

    // Recalculate summary metrics
    const total = assessment.findings.length;
    const satisfied = assessment.findings.filter((f) => f.compliance_status === 'Satisfied').length;
    const deficiencies = assessment.findings.filter((f) => f.compliance_status === 'Potential Deficiency').length;
    const missing = assessment.findings.filter((f) => f.compliance_status === 'Evidence Missing').length;
    const conflicting = assessment.findings.filter((f) => f.compliance_status === 'Conflicting Findings').length;
    const critical = assessment.findings.filter((f) => f.severity === 'Critical').length;

    assessment.satisfied_requirements = satisfied;
    assessment.potential_deficiencies = deficiencies;
    assessment.missing_evidence = missing;
    assessment.conflicting_findings = conflicting;
    assessment.critical_deficiencies = critical;
    assessment.compliance_percentage = Math.round((satisfied / total) * 1000) / 10;
    assessment.updated_at = new Date().toISOString();

    this.persist('ASSESSMENTS');

    this.logAudit(
      'UPDATE_FINDING',
      `Updated finding ${finding.requirement_code} to ${finding.compliance_status} (${finding.severity}).`,
      assessment.application_id,
      undefined,
      'ComplianceFinding',
      String(finding.id)
    );

    return finding;
  }

  // 7. Consolidated Reports & Mandatory Compliance Gate
  async draftConsolidatedReport(
    appId: number,
    officerRemarks: string,
    recommendation: string
  ): Promise<ConsolidatedReport> {
    await delay();
    const app = this.applications.find((a) => a.id === Number(appId));
    if (!app) throw new Error(`Application #${appId} not found.`);

    const assessment = await this.getApplicationAssessment(appId);
    const scrutiny = this.scrutinyReports.find((r) => r.application_id === Number(appId));
    const evc = this.evcReports.find((r) => r.application_id === Number(appId));

    let report = this.consolidatedReports.find((r) => r.application_id === Number(appId));

    if (!report) {
      report = {
        id: 400 + appId,
        application_id: appId,
        assessment_id: assessment.id,
        report_reference: `CR-2026-${app.regional_office.split(' ')[0]}-00${appId}`,
        report_version: 1,
        report_status: 'Ready for Submission',
        scrutiny_report_reference: scrutiny?.report_reference || 'SCR-PENDING',
        evc_report_reference: evc?.report_reference || 'EVC-PENDING',
        report_content: `CONSOLIDATED REGULATORY COMPLIANCE ASSESSMENT REPORT\nInstitution: ${app.institution_name}\nApplication: ${app.application_type} (${app.application_id})\nCompliance Score: ${assessment.compliance_percentage}%\n\nOfficer Assessment Remarks:\n${officerRemarks}\n\nFinal Recommendation:\n${recommendation}`,
        officer_remarks: officerRemarks,
        mandatory_deficiencies_summary: assessment.critical_deficiencies > 0 ? `${assessment.critical_deficiencies} critical deficiency items recorded.` : 'None.',
        conflicting_findings_summary: assessment.conflicting_findings > 0 ? `${assessment.conflicting_findings} conflicting finding(s) between Scrutiny & EVC.` : 'None.',
        approval_recommendation: recommendation,
        created_at: new Date().toISOString(),
      };
      this.consolidatedReports.push(report);
    } else {
      report.officer_remarks = officerRemarks;
      report.approval_recommendation = recommendation;
      report.report_status = 'Ready for Submission';
      report.report_version += 1;
      report.report_content = `CONSOLIDATED REGULATORY COMPLIANCE ASSESSMENT REPORT\nInstitution: ${app.institution_name}\nApplication: ${app.application_type} (${app.application_id})\nCompliance Score: ${assessment.compliance_percentage}%\n\nOfficer Assessment Remarks:\n${officerRemarks}\n\nFinal Recommendation:\n${recommendation}`;
    }

    app.compliance_status = 'Ready for Compliance Report';
    app.current_stage = 'Consolidated Reporting';

    this.persist('CONSOLIDATED');
    this.persist('APPLICATIONS');

    this.logAudit(
      'DRAFT_CONSOLIDATED_REPORT',
      `Drafted Consolidated Compliance Report for ${app.application_id}. Recommendation: ${recommendation}`,
      app.id,
      app.application_id,
      'ConsolidatedReport',
      report.report_reference
    );

    return report;
  }

  async getApplicationConsolidatedReport(appId: number): Promise<ConsolidatedReport> {
    await delay();
    const report = this.consolidatedReports.find((r) => r.application_id === Number(appId));
    if (!report) {
      throw new Error(`Consolidated report for application #${appId} has not been drafted yet.`);
    }
    return report;
  }

  async updateConsolidatedReport(
    reportId: number,
    data: {
      officer_remarks?: string;
      approval_recommendation?: string;
      report_status?: string;
    }
  ): Promise<ConsolidatedReport> {
    await delay();
    const report = this.consolidatedReports.find((r) => r.id === Number(reportId));
    if (!report) throw new Error(`Consolidated report #${reportId} not found.`);

    if (data.officer_remarks !== undefined) report.officer_remarks = data.officer_remarks;
    if (data.approval_recommendation !== undefined) report.approval_recommendation = data.approval_recommendation;
    if (data.report_status !== undefined) report.report_status = data.report_status;

    this.persist('CONSOLIDATED');
    return report;
  }

  // MANDATORY COMPLIANCE GATE IMPLEMENTATION
  async submitConsolidatedReport(reportId: number): Promise<ConsolidatedReport> {
    await delay();
    const report = this.consolidatedReports.find((r) => r.id === Number(reportId));
    if (!report) throw new Error(`Consolidated report #${reportId} not found.`);

    const assessment = this.assessments.find((ass) => ass.id === report.assessment_id);
    const app = this.applications.find((a) => a.id === report.application_id);

    // STATUTORY GATE ENFORCEMENT
    if (assessment) {
      const hasUnresolvedConflicts = assessment.conflicting_findings > 0;
      const hasCriticalGaps = assessment.critical_deficiencies > 0;

      if ((hasUnresolvedConflicts || hasCriticalGaps) && report.approval_recommendation === 'Recommended for Approval') {
        throw new Error(
          `MANDATORY COMPLIANCE GATE VIOLATION: Cannot submit unconditional "Recommended for Approval" while ${hasUnresolvedConflicts ? assessment.conflicting_findings + ' conflicting finding(s) ' : ''}${hasCriticalGaps ? assessment.critical_deficiencies + ' critical deficiency gap(s) ' : ''}remain unresolved. AICTE Regulatory Governance regulations require resolution or selecting "Approved with Conditions" / "Rejection".`
        );
      }
    }

    report.report_status = 'Submitted';
    report.submitted_by = 'Dr. Suresh Varma';
    report.submitted_at = new Date().toISOString();

    if (app) {
      app.current_stage = 'Approval Decision';
      app.compliance_status = 'Report Submitted';
      if (report.approval_recommendation) {
        app.application_status = report.approval_recommendation;
      }
      this.persist('APPLICATIONS');
    }

    this.persist('CONSOLIDATED');

    this.logAudit(
      'SUBMIT_CONSOLIDATED_REPORT',
      `Submitted Final Consolidated Compliance Report ${report.report_reference} for ${app?.application_id || 'Application'}. Status: Transmitted to Executive Regulatory Council.`,
      report.application_id,
      app?.application_id,
      'ConsolidatedReport',
      report.report_reference
    );

    return report;
  }

  async getReportHistory(reportId: number): Promise<ConsolidatedReport[]> {
    await delay();
    const report = this.consolidatedReports.find((r) => r.id === Number(reportId));
    if (!report) return [];
    return [report];
  }

  // 8. Approval Conditions Tracking
  async getApprovalConditions(statusFilter?: string): Promise<ApprovalCondition[]> {
    await delay();
    if (!statusFilter) return [...this.approvalConditions];
    return this.approvalConditions.filter((c) => c.condition_status === statusFilter);
  }

  async updateApprovalCondition(
    conditionId: number,
    data: {
      condition_status?: string;
      evidence_reference?: string;
      officer_remarks?: string;
    }
  ): Promise<ApprovalCondition> {
    await delay();
    const cond = this.approvalConditions.find((c) => c.id === Number(conditionId));
    if (!cond) throw new Error(`Approval Condition #${conditionId} not found.`);

    if (data.condition_status) cond.condition_status = data.condition_status;
    if (data.evidence_reference) cond.evidence_reference = data.evidence_reference;
    if (data.officer_remarks) cond.officer_remarks = data.officer_remarks;
    cond.updated_at = new Date().toISOString();

    this.persist('CONDITIONS');

    this.logAudit(
      'UPDATE_APPROVAL_CONDITION',
      `Approval condition ${cond.condition_code} status updated to: ${cond.condition_status}`,
      cond.application_id,
      cond.application_identifier,
      'ApprovalCondition',
      cond.condition_code
    );

    return cond;
  }

  // 9. Notifications
  async getNotifications(): Promise<Notification[]> {
    await delay();
    return [...this.notifications];
  }

  async markNotificationRead(id: number): Promise<{ status: string }> {
    await delay();
    const item = this.notifications.find((n) => n.id === Number(id));
    if (item) {
      item.is_read = true;
      this.persist('NOTIFICATIONS');
    }
    return { status: 'success' };
  }

  // 10. Audit Trail
  async getAuditTrail(appId?: number): Promise<AuditLog[]> {
    await delay();
    if (!appId) return [...this.auditLogs];
    return this.auditLogs.filter((l) => l.application_id === Number(appId));
  }

  // 11. Authentication
  async login(username: string): Promise<{ access_token: string; user: UserProfile }> {
    await delay();
    const user: UserProfile = {
      id: 1,
      username: username || 'suresh.varma',
      full_name: 'Dr. Suresh Varma',
      email: 'suresh.varma@aicte-india.org',
      role: 'Compliance Officer',
      regional_office: 'Western Regional Office (WRO)',
    };
    localStorage.setItem('niyamgraph_token', 'mock-jwt-compliance-officer-token-sih2026');
    return {
      access_token: 'mock-jwt-compliance-officer-token-sih2026',
      user,
    };
  }

  async getCurrentUser(): Promise<UserProfile> {
    await delay();
    return {
      id: 1,
      username: 'suresh.varma',
      full_name: 'Dr. Suresh Varma',
      email: 'suresh.varma@aicte-india.org',
      role: 'Compliance Officer',
      regional_office: 'Western Regional Office (WRO)',
    };
  }

  // Reset to initial mock data
  resetDefaults(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.institutions = [...mockInstitutions];
    this.applications = [...mockApplications];
    this.scrutinyReports = [...mockScrutinyReports];
    this.evcReports = [...mockEvcReports];
    this.assessments = [...mockAssessments];
    this.consolidatedReports = [...mockConsolidatedReports];
    this.approvalConditions = [...mockApprovalConditions];
    this.clarificationRequests = [...mockClarificationRequests];
    this.notifications = [...mockNotifications];
    this.auditLogs = [...mockAuditLogs];
  }
}

export const complianceMockService = new ComplianceMockService();

