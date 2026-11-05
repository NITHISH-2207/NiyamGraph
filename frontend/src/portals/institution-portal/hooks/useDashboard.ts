import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardSummaryResponse } from '../types/dashboard';

interface UseDashboardReturn {
  data: DashboardSummaryResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastFetchedAt: Date | null;
}

export const useDashboard = (): UseDashboardReturn => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  const fetchData = useCallback(async (isManualRefresh: boolean = false) => {
    // Stale response guard: abort pending inflight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const summary = await dashboardService.getSummary(controller.signal);
      setData(summary);
      setLastFetchedAt(new Date());
      lastFetchTimeRef.current = Date.now();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted due to navigation or fresh refresh, ignore
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard data. Please verify your connection.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchData(false);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Window focus refetch with a 30-second cooldown
  useEffect(() => {
    const onFocus = () => {
      const elapsed = Date.now() - lastFetchTimeRef.current;
      if (elapsed > 30000 && !isLoading && !isRefreshing) {
        fetchData(false);
      }
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData, isLoading, isRefreshing]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch: () => fetchData(true),
    lastFetchedAt,
  };
};

