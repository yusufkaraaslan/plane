/**
 * useLazyBirdTasks — Fetch and manage task runs for an issue.
 *
 * Returns task list, loading/error state, and a refetch function.
 * Auto-polls every 10s when active tasks (queued/running) exist.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { lazyBirdService } from "../api";
import type { TLazyBirdTaskRun } from "../types";

const POLL_INTERVAL = 10_000;

type UseLazyBirdTasksReturn = {
  tasks: TLazyBirdTaskRun[];
  latestTask: TLazyBirdTaskRun | null;
  hasActiveTask: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useLazyBirdTasks(issueId: string): UseLazyBirdTasksReturn {
  const [tasks, setTasks] = useState<TLazyBirdTaskRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const data = await lazyBirdService.listTaskRuns(issueId);
      if (mountedRef.current) setTasks(data);
    } catch {
      if (mountedRef.current) setError("Failed to load automation tasks");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [issueId]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    refetch();
    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  // Auto-poll when active tasks exist
  useEffect(() => {
    const hasActive = tasks.some(
      (t) => t.status === "running" || t.status === "queued"
    );
    if (!hasActive) return;

    const interval = setInterval(refetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [tasks, refetch]);

  const latestTask = tasks.length > 0 ? tasks[0] : null;
  const hasActiveTask = latestTask
    ? latestTask.status === "running" || latestTask.status === "queued"
    : false;

  return { tasks, latestTask, hasActiveTask, loading, error, refetch };
}
