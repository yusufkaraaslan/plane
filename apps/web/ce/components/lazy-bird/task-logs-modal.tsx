"use client";

/**
 * TaskLogsModal — Paginated log viewer with level filtering.
 *
 * Shows task run logs fetched from GET /lazy-bird/issues/{id}/tasks/{id}/logs/.
 * Supports pagination and filtering by log level (info, warning, error, debug).
 */

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Bug,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { EModalWidth, ModalCore } from "@plane/ui";

import { lazyBirdService } from "./api";
import type { TLazyBirdTaskLog } from "./types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  taskId: string;
};

const LOG_LEVELS = ["all", "info", "warning", "error", "debug"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const LEVEL_STYLES: Record<string, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: "text-blue-500" },
  warning: { icon: AlertTriangle, color: "text-amber-500" },
  error: { icon: XCircle, color: "text-red-500" },
  debug: { icon: Bug, color: "text-gray-400" },
};

const PAGE_SIZE = 50;

export function TaskLogsModal(props: Props) {
  const { isOpen, onClose, issueId, taskId } = props;

  const [logs, setLogs] = useState<TLazyBirdTaskLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState<LogLevel>("all");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchLogs = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const data = await lazyBirdService.getTaskLogs(issueId, taskId, page);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, issueId, taskId, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setLevelFilter("all");
    }
  }, [isOpen]);

  const filteredLogs =
    levelFilter === "all"
      ? logs
      : logs.filter((l) => l.level === levelFilter);

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose} width={EModalWidth.XXXXL}>
      <div className="flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-custom-border-200 px-5 py-4">
          <h3 className="text-lg font-medium text-custom-text-100">Task Logs</h3>
          <button
            type="button"
            className="text-custom-text-400 hover:text-custom-text-200"
            onClick={onClose}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-custom-border-200 px-5 py-3">
          {LOG_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                levelFilter === level
                  ? "bg-custom-primary-100 text-white"
                  : "bg-custom-background-80 text-custom-text-300 hover:bg-custom-background-90"
              }`}
              onClick={() => setLevelFilter(level)}
            >
              {level}
            </button>
          ))}
          <span className="ml-auto text-xs text-custom-text-400">
            {total} total log{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Log list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-custom-text-300" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="py-12 text-center text-sm text-custom-text-400">
              No logs available.
            </p>
          ) : (
            <div className="space-y-1 font-mono text-xs">
              {filteredLogs.map((log, idx) => {
                const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.info;
                const Icon = style.icon;
                return (
                  <div
                    key={`${page}-${idx}`}
                    className="flex items-start gap-2 rounded px-2 py-1 hover:bg-custom-background-80"
                  >
                    <Icon className={`mt-0.5 h-3 w-3 shrink-0 ${style.color}`} />
                    <span className="text-custom-text-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-custom-text-200 break-all">
                      {log.message}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-custom-border-200 px-5 py-3">
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-custom-text-300 hover:text-custom-text-200 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-xs text-custom-text-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-custom-text-300 hover:text-custom-text-200 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </ModalCore>
  );
}
