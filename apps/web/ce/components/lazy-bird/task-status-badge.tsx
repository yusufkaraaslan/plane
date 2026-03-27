"use client";

/**
 * TaskStatusBadge — Inline badge showing automation task status next to issue title.
 *
 * Lightweight: uses useLazyBirdTasks hook for data. Renders a small colored
 * dot + label. Designed for issue list views where space is limited.
 */

import { Bot, Loader2 } from "lucide-react";

import { useLazyBirdTasks } from "./hooks";
import type { TLazyBirdTaskRunStatus } from "./types";

type Props = {
  issueId: string;
};

const STATUS_CONFIG: Record<
  TLazyBirdTaskRunStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  queued: { label: "Queued", dotColor: "bg-amber-400", textColor: "text-amber-600" },
  running: { label: "Running", dotColor: "bg-blue-400", textColor: "text-blue-600" },
  success: { label: "Done", dotColor: "bg-green-400", textColor: "text-green-600" },
  failed: { label: "Failed", dotColor: "bg-red-400", textColor: "text-red-600" },
  cancelled: { label: "Cancelled", dotColor: "bg-gray-400", textColor: "text-gray-500" },
};

export function TaskStatusBadge({ issueId }: Props) {
  const { latestTask, loading } = useLazyBirdTasks(issueId);

  if (loading || !latestTask) return null;

  const status = latestTask.status;
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ${config.textColor}`}
      title={`Lazy Bird: ${config.label}`}
    >
      {status === "running" ? (
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
      ) : (
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      )}
      <Bot className="h-2.5 w-2.5" />
    </span>
  );
}
