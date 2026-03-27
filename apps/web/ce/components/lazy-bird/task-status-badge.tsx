"use client";

/**
 * TaskStatusBadge — Inline badge showing automation task status next to issue title.
 *
 * Lightweight: single fetch for the latest task run. Renders a small colored
 * dot + label. Designed for issue list views where space is limited.
 */

import { useEffect, useState } from "react";
import { Bot, Loader2 } from "lucide-react";

import { lazyBirdService } from "./api";
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
  const [status, setStatus] = useState<TLazyBirdTaskRunStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        const tasks = await lazyBirdService.listTaskRuns(issueId);
        if (!cancelled && tasks.length > 0) {
          setStatus(tasks[0].status);
        }
      } catch {
        // Silently fail — badge is optional
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [issueId]);

  // Don't render anything if no task exists
  if (loading || !status) return null;

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
