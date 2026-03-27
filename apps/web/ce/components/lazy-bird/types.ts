/**
 * Lazy-Bird integration types.
 *
 * Mirrors the Django REST API response shapes from plane_lazy_bird.serializers.
 */

export type TLazyBirdAutomationConfig = {
  project_id: string;
  lazy_bird_project_id: string;
  enabled: boolean;
  ready_state_name: string;
  in_progress_state_name: string;
  review_state_name: string;
  api_url: string;
  api_key_masked: string;
  created_at: string;
  updated_at: string;
};

export type TLazyBirdTaskRunStatus =
  | "queued"
  | "running"
  | "success"
  | "failed"
  | "cancelled";

export type TLazyBirdTaskRun = {
  id: string;
  issue_id: string;
  project_id: string;
  task_run_id: string;
  status: TLazyBirdTaskRunStatus;
  pr_url: string | null;
  pr_number: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type TLazyBirdTriggerRequest = {
  project_id: string;
  prompt: string;
};

export type TLazyBirdTestConnectionRequest = {
  api_url?: string;
  api_key?: string;
};

export type TLazyBirdTestConnectionResponse = {
  connected: boolean;
  error?: string;
  version?: string;
};

export type TLazyBirdTaskLog = {
  message: string;
  level: string;
  timestamp: string;
};

export type TLazyBirdTaskLogsResponse = {
  logs: TLazyBirdTaskLog[];
  page: number;
  page_size: number;
  total: number;
};
