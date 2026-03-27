/**
 * LazyBirdStore — MobX store for shared task and config state.
 *
 * Provides cached task data shared between TaskStatusBadge and TaskPanel,
 * batch fetching for list views, and config caching for conditional rendering.
 */

import { action, computed, makeObservable, observable, runInAction } from "mobx";

import { lazyBirdService } from "../api";
import type {
  TLazyBirdAutomationConfig,
  TLazyBirdTaskRun,
} from "../types";

export class LazyBirdStore {
  // Task cache: issueId → task runs (latest first)
  tasksByIssue: Map<string, TLazyBirdTaskRun[]> = new Map();

  // Config cache: projectId → automation config
  configByProject: Map<string, TLazyBirdAutomationConfig> = new Map();

  // Loading state for batch operations
  batchLoading = false;

  constructor() {
    makeObservable(this, {
      tasksByIssue: observable,
      configByProject: observable,
      batchLoading: observable,
      fetchTasksForIssue: action,
      fetchTaskStatusBatch: action,
      fetchConfig: action,
      setTasks: action,
      setConfig: action,
      clearIssueCache: action,
    });
  }

  // --- Computed helpers ---

  getLatestTask(issueId: string): TLazyBirdTaskRun | null {
    const tasks = this.tasksByIssue.get(issueId);
    return tasks && tasks.length > 0 ? tasks[0] : null;
  }

  hasActiveTask(issueId: string): boolean {
    const latest = this.getLatestTask(issueId);
    return latest ? latest.status === "running" || latest.status === "queued" : false;
  }

  isAutomationEnabled(projectId: string): boolean {
    const config = this.configByProject.get(projectId);
    return config?.enabled ?? false;
  }

  // --- Actions ---

  setTasks(issueId: string, tasks: TLazyBirdTaskRun[]): void {
    this.tasksByIssue.set(issueId, tasks);
  }

  setConfig(projectId: string, config: TLazyBirdAutomationConfig): void {
    this.configByProject.set(projectId, config);
  }

  clearIssueCache(issueId: string): void {
    this.tasksByIssue.delete(issueId);
  }

  /**
   * Fetch task runs for a single issue. Updates the cache.
   */
  async fetchTasksForIssue(issueId: string): Promise<TLazyBirdTaskRun[]> {
    try {
      const tasks = await lazyBirdService.listTaskRuns(issueId);
      runInAction(() => {
        this.tasksByIssue.set(issueId, tasks);
      });
      return tasks;
    } catch {
      return this.tasksByIssue.get(issueId) ?? [];
    }
  }

  /**
   * Batch-fetch latest task status for multiple issues in a single API call.
   * Used by list views to avoid N+1 requests from TaskStatusBadge.
   */
  async fetchTaskStatusBatch(issueIds: string[]): Promise<void> {
    if (issueIds.length === 0) return;

    // Filter out issues we already have cached
    const uncachedIds = issueIds.filter((id) => !this.tasksByIssue.has(id));
    if (uncachedIds.length === 0) return;

    runInAction(() => {
      this.batchLoading = true;
    });

    try {
      const result = await lazyBirdService.batchTaskStatus(uncachedIds);
      runInAction(() => {
        // Store results
        for (const [issueId, task] of Object.entries(result)) {
          this.tasksByIssue.set(issueId, [task]);
        }
        // Mark issues with no tasks as empty (so we don't re-fetch)
        for (const id of uncachedIds) {
          if (!result[id]) {
            this.tasksByIssue.set(id, []);
          }
        }
      });
    } catch {
      // Batch fetch failed — individual components will fall back to per-issue fetch
    } finally {
      runInAction(() => {
        this.batchLoading = false;
      });
    }
  }

  /**
   * Fetch automation config for a project. Updates the cache.
   */
  async fetchConfig(projectId: string): Promise<TLazyBirdAutomationConfig | null> {
    try {
      const config = await lazyBirdService.getConfig(projectId);
      runInAction(() => {
        this.configByProject.set(projectId, config);
      });
      return config;
    } catch {
      return null;
    }
  }

  /**
   * Trigger a task and refresh the issue's task cache.
   */
  async triggerTask(
    issueId: string,
    projectId: string,
    prompt: string
  ): Promise<void> {
    await lazyBirdService.triggerTask(issueId, {
      project_id: projectId,
      prompt,
    });
    await this.fetchTasksForIssue(issueId);
  }

  /**
   * Cancel a task and refresh the issue's task cache.
   */
  async cancelTask(issueId: string, taskId: string): Promise<void> {
    await lazyBirdService.cancelTask(issueId, taskId);
    await this.fetchTasksForIssue(issueId);
  }
}

export const lazyBirdStore = new LazyBirdStore();
