import { apiClient } from '@/services/apiClient';
import { DashboardSummaryResponse } from '../types/dashboard';

export const dashboardService = {
  async getSummary(signal?: AbortSignal): Promise<DashboardSummaryResponse> {
    return apiClient.get<DashboardSummaryResponse>('/dashboard/summary', { signal });
  },
};

