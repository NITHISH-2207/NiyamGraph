export type SectionId =
  | 'app-info'
  | 'institution-profile'
  | 'approved-programmes'
  | 'self-disclosure'
  | 'document-checklist'
  | 'review-submit';

export interface SectionMeta {
  id: SectionId;
  index: number;
  title: string;
  shortTitle: string;
  description: string;
}

export type ApplicationStatus = 'Draft' | 'Submitted' | 'Under Scrutiny';

export type ComplianceState =
  | 'Not Answered'
  | 'Compliant'
  | 'Non-Compliant'
  | 'Not Applicable'
  | 'Requires Clarification';

export interface InstitutionProfileData {
  officialName: string;
  identifier: string;
  institutionType: string;
  ownershipCategory: string;
  establishmentYear: number;
  address: string;
  district: string;
  state: string;
  pincode: string;
  trustOrSociety: string;
  trustRegistrationNo: string;
  principalName: string;
  principalDesignation: string;
  officialEmail: string;
  registeredPhone: string;
  affiliatingUniversity: string;
  regionalOffice: string;
}

export type ProgrammeConfirmationStatus =
  | 'Pending Confirmation'
  | 'Confirmed'
  | 'Issue Reported'
  | 'Data Unavailable';

export interface ApprovedProgramme {
  id: string;
  programmeLevel: 'Undergraduate' | 'Postgraduate' | 'Diploma';
  programmeName: string;
  course: string;
  specialization: string;
  approvedIntake: number;
  currentStatus: 'Active' | 'Under Review' | 'Discontinued';
  previousApprovalRef?: string;
  confirmationStatus: ProgrammeConfirmationStatus;
  reportedIssueRemarks?: string;
}

export type DisclosureGroupId =
  | 'group-a-faculty'
  | 'group-b-infrastructure'
  | 'group-c-laboratories'
  | 'group-d-library'
  | 'group-e-classrooms'
  | 'group-f-amenities'
  | 'group-g-safety'
  | 'group-h-other';

export interface DisclosureFieldDef {
  id: string;
  label: string;
  description?: string;
  hasQuantity?: boolean;
  quantityLabel?: string;
  quantityUnit?: string;
  requiresEvidenceRef?: boolean;
}

export interface DisclosureGroupDef {
  id: DisclosureGroupId;
  code: string;
  title: string;
  description: string;
  fields: DisclosureFieldDef[];
}

export interface FieldResponse {
  answer: 'Yes' | 'No' | 'Not Applicable' | null;
  quantity?: number | string;
  remarks?: string;
  evidenceRef?: string;
  status: ComplianceState;
}

export type DocumentUploadStatus =
  | 'Required'
  | 'Not Uploaded'
  | 'Uploading'
  | 'Uploaded'
  | 'Pending Validation'
  | 'Accepted'
  | 'Rejected'
  | 'Not Applicable';

export interface DocumentChecklistItem {
  id: string;
  code: string;
  name: string;
  description: string;
  isMandatory: boolean;
  conditionNote?: string;
  status: DocumentUploadStatus;
  uploadedFileName?: string;
  fileSizeBytes?: number;
  uploadedAt?: string;
  mimeType?: string;
  validUntil?: string;
  previewUrl?: string;
}

export interface ValidationIssue {
  sectionId: SectionId;
  sectionTitle: string;
  fieldId?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface StatutoryDeclaration {
  accepted: boolean;
  acceptedAt?: string;
  adminName: string;
  adminDesignation: string;
}

