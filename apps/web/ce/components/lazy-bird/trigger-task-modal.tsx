"use client";

/**
 * TriggerTaskModal — Modal for manually triggering an automation task.
 *
 * Provides: prompt textarea, task type dropdown, complexity selector.
 * Calls POST /lazy-bird/issues/{issue_id}/tasks/trigger/.
 */

import { useState } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";
import { EModalWidth, ModalCore } from "@plane/ui";

import { lazyBirdService } from "./api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  projectId: string;
  issueTitle?: string;
  onSuccess?: () => void;
};

const TASK_TYPES = [
  { value: "feature", label: "Feature Implementation" },
  { value: "bugfix", label: "Bug Fix" },
  { value: "refactor", label: "Refactoring" },
  { value: "test", label: "Write Tests" },
  { value: "docs", label: "Documentation" },
] as const;

const COMPLEXITY_LEVELS = [
  { value: "low", label: "Low", description: "Simple change, single file" },
  { value: "medium", label: "Medium", description: "Multiple files, moderate logic" },
  { value: "high", label: "High", description: "Cross-cutting, architectural changes" },
] as const;

export function TriggerTaskModal(props: Props) {
  const { isOpen, onClose, issueId, projectId, issueTitle, onSuccess } = props;

  const [prompt, setPrompt] = useState("");
  const [taskType, setTaskType] = useState("feature");
  const [complexity, setComplexity] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await lazyBirdService.triggerTask(issueId, {
        project_id: projectId,
        prompt: prompt.trim(),
      });
      setPrompt("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err?.detail || err?.message || "Failed to trigger task"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setPrompt("");
      setError(null);
      onClose();
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose} width={EModalWidth.XXL}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-custom-border-200 px-5 py-4">
          <Sparkles className="h-5 w-5 text-custom-primary-100" />
          <h3 className="text-lg font-medium text-custom-text-100">
            Trigger Automation Task
          </h3>
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* Issue context */}
          {issueTitle && (
            <div className="rounded-md bg-custom-background-80 px-3 py-2 text-sm text-custom-text-300">
              Issue: <span className="text-custom-text-200">{issueTitle}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-1.5">
            <label
              htmlFor="lb-prompt"
              className="block text-sm font-medium text-custom-text-200"
            >
              Prompt
            </label>
            <textarea
              id="lb-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want Lazy Bird to implement..."
              rows={4}
              className="w-full rounded-md border border-custom-border-200 bg-custom-background-100 px-3 py-2 text-sm text-custom-text-100 placeholder:text-custom-text-400 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100 resize-none"
              disabled={submitting}
              autoFocus
            />
            <p className="text-xs text-custom-text-400">
              Be specific about the expected behavior, files to modify, and acceptance criteria.
            </p>
          </div>

          {/* Task Type */}
          <div className="space-y-1.5">
            <label
              htmlFor="lb-task-type"
              className="block text-sm font-medium text-custom-text-200"
            >
              Task Type
            </label>
            <select
              id="lb-task-type"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full rounded-md border border-custom-border-200 bg-custom-background-100 px-3 py-2 text-sm text-custom-text-100 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100"
              disabled={submitting}
            >
              {TASK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Complexity */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-custom-text-200">
              Complexity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMPLEXITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-left transition-colors ${
                    complexity === level.value
                      ? "border-custom-primary-100 bg-custom-primary-100/5 text-custom-primary-100"
                      : "border-custom-border-200 text-custom-text-300 hover:border-custom-border-300"
                  }`}
                  onClick={() => setComplexity(level.value)}
                  disabled={submitting}
                >
                  <span className="block text-sm font-medium">{level.label}</span>
                  <span className="block text-xs opacity-70">{level.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-custom-border-200 px-5 py-4">
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm text-custom-text-200 hover:bg-custom-background-80"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md bg-custom-primary-100 px-4 py-2 text-sm font-medium text-white hover:bg-custom-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || !prompt.trim()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Trigger Task
          </button>
        </div>
      </form>
    </ModalCore>
  );
}
