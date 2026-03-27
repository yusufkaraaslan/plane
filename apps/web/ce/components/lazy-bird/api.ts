/**
 * Lazy-Bird API service.
 *
 * Fetch wrapper using Plane's APIService pattern. Calls the Django REST API
 * endpoints served by plane_lazy_bird.api (mounted at /api/webhooks/lazy-bird/).
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";

import type {
  TLazyBirdAutomationConfig,
  TLazyBirdTaskRun,
  TLazyBirdTestConnectionRequest,
  TLazyBirdTestConnectionResponse,
  TLazyBirdTriggerRequest,
  TLazyBirdTaskLogsResponse,
} from "./types";

const LAZY_BIRD_BASE = "/api/webhooks/lazy-bird";

export class LazyBirdService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  // --- Config ---

  async getConfig(projectId: string): Promise<TLazyBirdAutomationConfig> {
    return this.get(`${LAZY_BIRD_BASE}/config/${projectId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async upsertConfig(
    projectId: string,
    data: Partial<TLazyBirdAutomationConfig>
  ): Promise<TLazyBirdAutomationConfig> {
    return this.post(`${LAZY_BIRD_BASE}/config/${projectId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async testConnection(
    data: TLazyBirdTestConnectionRequest
  ): Promise<TLazyBirdTestConnectionResponse> {
    return this.post(`${LAZY_BIRD_BASE}/config/test-connection/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // --- Task Runs ---

  async listTaskRuns(issueId: string): Promise<TLazyBirdTaskRun[]> {
    return this.get(`${LAZY_BIRD_BASE}/issues/${issueId}/tasks/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async triggerTask(
    issueId: string,
    data: TLazyBirdTriggerRequest
  ): Promise<TLazyBirdTaskRun> {
    return this.post(`${LAZY_BIRD_BASE}/issues/${issueId}/tasks/trigger/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getTaskStatus(issueId: string, taskId: string): Promise<TLazyBirdTaskRun> {
    return this.get(`${LAZY_BIRD_BASE}/issues/${issueId}/tasks/${taskId}/status/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getTaskLogs(
    issueId: string,
    taskId: string,
    page: number = 1
  ): Promise<TLazyBirdTaskLogsResponse> {
    return this.get(`${LAZY_BIRD_BASE}/issues/${issueId}/tasks/${taskId}/logs/`, {
      params: { page },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async cancelTask(issueId: string, taskId: string): Promise<TLazyBirdTaskRun> {
    return this.post(`${LAZY_BIRD_BASE}/issues/${issueId}/tasks/${taskId}/cancel/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async batchTaskStatus(
    issueIds: string[]
  ): Promise<Record<string, TLazyBirdTaskRun>> {
    return this.post(`${LAZY_BIRD_BASE}/issues/batch-status/`, {
      issue_ids: issueIds,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const lazyBirdService = new LazyBirdService();
