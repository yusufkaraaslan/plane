"use client";

/**
 * LazyBirdTaskPanel — Issue sidebar widget showing automation task status.
 *
 * Displays: status badge, PR link, View Logs / Cancel / Trigger buttons.
 * Fetches task runs from GET /api/webhooks/lazy-bird/issues/{issue_id}/tasks/.
 */

import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react";
import {
  Bot,
  ExternalLink,
  Loader2,
  Play,
  ScrollText,
  XCircle,
} from "lucide-react";
import { Spinner } from "@plane/ui";

import { lazyBirdService } from "./api";
import type { TLazyBirdTaskRun, TLazyBirdTaskRunStatus } from "./types";

type Props = {
  issueId: string;
  projectId: string;
  workspaceSlug: string;
  disabled?: boolean;
};

const STATUS_CONFIG: Record<
  TLazyBirdTaskRunStatus,
  { label: string; color: string; bgColor: string }
> = {
  queued: { label: "Queued", color: "text-amber-600", bgColor: "bg-amber-50" },
  running: { label: "Running", color: "text-blue-600", bgColor: "bg-blue-50" },
  success: { label: "Completed", color: "text-green-600", bgColor: "bg-green-50" },
  failed: { label: "Failed", color: "text-red-600", bgColor: "bg-red-50" },
  cancelled: { label: "Cancelled", color: "text-gray-500", bgColor: "bg-gray-50" },
};

export const LazyBirdTaskPanel = observer(function LazyBirdTaskPanel(props: Props) {
  const { issueId, projectId, disabled = false } = props;

  const [taskRuns, setTaskRuns] = useState<TLazyBirdTaskRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskRuns = useCallback(async () => {
    try {
      setError(null);
      const data = await lazyBirdService.listTaskRuns(issueId);
      setTaskRuns(data);
    } catch (err) {
      setError("Failed to load automation tasks");
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchTaskRuns();
  }, [fetchTaskRuns]);

  // Poll for running/queued tasks
  useEffect(() => {
    const hasActive = taskRuns.some(
      (t) => t.status === "running" || t.status === "queued"
    );
    if (!hasActive) return;

    const interval = setInterval(fetchTaskRuns, 10000);
    return () => clearInterval(interval);
  }, [taskRuns, fetchTaskRuns]);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await lazyBirdService.triggerTask(issueId, {
        project_id: projectId,
        prompt: "Implement the work described in this issue",
      });
      await fetchTaskRuns();
    } catch (err: any) {
      setError(err?.detail || "Failed to trigger task");
    } finally {
      setTriggering(false);
    }
  };

  const handleCancel = async (taskId: string) => {
    setCancelling(taskId);
    try {
      await lazyBirdService.cancelTask(issueId, taskId);
      await fetchTaskRuns();
    } catch (err: any) {
      setError(err?.detail || "Failed to cancel task");
    } finally {
      setCancelling(null);
    }
  };

  const latestTask = taskRuns.length > 0 ? taskRuns[0] : null;
  const hasActiveTask = latestTask
    ? latestTask.status === "running" || latestTask.status === "queued"
    : false;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-custom-text-300">
        <Spinner />
        <span>Loading automation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-custom-text-200">
          <Bot className="h-4 w-4" />
          <span>Lazy Bird</span>
        </div>
        {!hasActiveTask && (
          <button
            type="button"
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-custom-primary-100 hover:bg-custom-primary-100/10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleTrigger}
            disabled={disabled || triggering}
          >
            {triggering ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            <span>Trigger</span>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* No tasks */}
      {!latestTask && !error && (
        <p className="text-xs text-custom-text-400">
          No automation tasks for this issue.
        </p>
      )}

      {/* Latest task */}
      {latestTask && (
        <div className="space-y-2 rounded-md border border-custom-border-200 p-3">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[latestTask.status].color} ${STATUS_CONFIG[latestTask.status].bgColor}`}
            >
              {latestTask.status === "running" && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              {STATUS_CONFIG[latestTask.status].label}
            </span>
            <span className="text-xs text-custom-text-400">
              {new Date(latestTask.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* PR link */}
          {latestTask.pr_url && (
            <a
              href={latestTask.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-custom-primary-100 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span>PR #{latestTask.pr_number}</span>
            </a>
          )}

          {/* Error message */}
          {latestTask.error_message && (
            <p className="text-xs text-red-500 truncate" title={latestTask.error_message}>
              {latestTask.error_message}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-custom-text-300 hover:bg-custom-background-80"
              onClick={() =>
                window.open(
                  `/lazy-bird/issues/${issueId}/tasks/${latestTask.id}/logs`,
                  "_blank"
                )
              }
            >
              <ScrollText className="h-3 w-3" />
              <span>Logs</span>
            </button>

            {hasActiveTask && (
              <button
                type="button"
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                onClick={() => handleCancel(latestTask.id)}
                disabled={disabled || cancelling === latestTask.id}
              >
                {cancelling === latestTask.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Task history (collapsed) */}
      {taskRuns.length > 1 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-custom-text-400 hover:text-custom-text-300">
            {taskRuns.length - 1} previous task{taskRuns.length > 2 ? "s" : ""}
          </summary>
          <div className="mt-2 space-y-1">
            {taskRuns.slice(1).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded px-2 py-1 text-custom-text-400"
              >
                <span
                  className={`${STATUS_CONFIG[task.status].color}`}
                >
                  {STATUS_CONFIG[task.status].label}
                </span>
                <span>{new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
});
