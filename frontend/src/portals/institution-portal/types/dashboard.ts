export type SectionStatus = 'ok' | 'unavailable';

export interface SectionWrapper<T> {
  status: SectionStatus;
  message?: string | null;
  data: T | null;
}

export interface UserMinimalInfo {
  id: string;
  display_name: string;
  email: string;
  role: string;
}

export interface InstitutionSectionData {
  name: string;
  identifier: string;
  type: string;
  status: string;
  official_email: string;
  regional_office: string;
  user: UserMinimalInfo;
}

export interface BreakdownData {
  approved: int_or_number;
  under_review: int_or_number;
  requiring_action: int_or_number;
  draft: int_or_number;
  rejected: int_or_number;
  closed: int_or_number;
  total: int_or_number;
}

type int_or_number = number;

export interface StatsSectionData {
  total: number;
  approved: number;
  under_review: number;
  requiring_action: number;
  breakdown: BreakdownData;
}

export interface RecentApplicationItem {
  id: string;
  reference_number: string;
  application_type_name: string;
  submission_date: string | null;
  status: string;
  current_stage: string;
  updated_at: string;
}

export interface PendingActionItem {
  id: string;
  type: 'deficiency' | 'compliance' | 'draft_application' | 'document' | string;
  title: string;
  action_required: string;
  reference: string;
  deadline: string | null;
  status: string;
  is_overdue: boolean;
  is_due_soon: boolean;
}

export interface PendingActionsSectionData {
  items: PendingActionItem[];
  total_count: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
  is_read: boolean;
}

export interface NotificationsSectionData {
  items: NotificationItem[];
  unread_count: number;
}

export interface StatusDistributionItem {
  bucket: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSectionData {
  status_distribution: StatusDistributionItem[];
}

export interface DashboardSummaryResponse {
  total_applications: number;
  draft_applications: number;
  submitted_applications: number;
  under_scrutiny_applications: number;
  with_deficiencies_applications: number;
  approved_applications: number;
  rejected_applications: number;
  pending_compliance: number;
  verified_compliance: number;
  unread_notifications: number;

  institution: SectionWrapper<InstitutionSectionData>;
  stats: SectionWrapper<StatsSectionData>;
  recent_applications: SectionWrapper<RecentApplicationItem[]>;
  pending_actions: SectionWrapper<PendingActionsSectionData>;
  notifications: SectionWrapper<NotificationsSectionData>;
  analytics: SectionWrapper<AnalyticsSectionData>;
}

