/**
 * useTriggerTask — Trigger and cancel automation tasks.
 *
 * Returns trigger/cancel actions with loading state and error handling.
 * Calls refetch callback after successful actions to update the task list.
 */

import { useCallback, useState } from "react";

import { lazyBirdService } from "../api";
import type { TLazyBirdTriggerRequest } from "../types";

type UseTriggerTaskReturn = {
  trigger: (request: TLazyBirdTriggerRequest) => Promise<void>;
  triggering: boolean;
  cancel: (taskId: string) => Promise<void>;
  cancelling: string | null;
  error: string | null;
  clearError: () => void;
};

export function useTriggerTask(
  issueId: string,
  onSuccess?: () => Promise<void>
): UseTriggerTaskReturn {
  const [triggering, setTriggering] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(
    async (request: TLazyBirdTriggerRequest) => {
      setTriggering(true);
      setError(null);
      try {
        await lazyBirdService.triggerTask(issueId, request);
        await onSuccess?.();
      } catch (err: any) {
        setError(err?.detail || err?.message || "Failed to trigger task");
      } finally {
        setTriggering(false);
      }
    },
    [issueId, onSuccess]
  );

  const cancel = useCallback(
    async (taskId: string) => {
      setCancelling(taskId);
      setError(null);
      try {
        await lazyBirdService.cancelTask(issueId, taskId);
        await onSuccess?.();
      } catch (err: any) {
        setError(err?.detail || err?.message || "Failed to cancel task");
      } finally {
        setCancelling(null);
      }
    },
    [issueId, onSuccess]
  );

  const clearError = useCallback(() => setError(null), []);

  return { trigger, triggering, cancel, cancelling, error, clearError };
}
