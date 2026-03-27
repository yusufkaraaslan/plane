"use client";

/**
 * LazyBirdSettings — Project settings page for automation configuration.
 *
 * Allows configuring: enable/disable toggle, Lazy-Bird project ID,
 * state name mapping (Ready/In Progress/In Review), and Test Connection.
 * Uses useLazyBirdConfig hook for all state management.
 */

import { observer } from "mobx-react";
import {
  CheckCircle2,
  Loader2,
  Power,
  Settings2,
  Unplug,
  XCircle,
} from "lucide-react";
import { Spinner } from "@plane/ui";

import { useLazyBirdConfig } from "./hooks";

type Props = {
  projectId: string;
  workspaceSlug: string;
  disabled?: boolean;
};

export const LazyBirdSettings = observer(function LazyBirdSettings(props: Props) {
  const { projectId, disabled = false } = props;

  const {
    form,
    updateField,
    loading,
    saving,
    isNew,
    error,
    saveSuccess,
    save,
    testing,
    connectionResult,
    testConnection,
  } = useLazyBirdConfig(projectId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-custom-text-300">
        <Spinner />
        <span>Loading Lazy Bird settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-custom-border-200 pb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-custom-text-200" />
          <h3 className="text-lg font-medium text-custom-text-100">
            Lazy Bird Automation
          </h3>
        </div>
        <button
          type="button"
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            form.enabled
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : "bg-custom-background-80 text-custom-text-300 hover:bg-custom-background-90"
          }`}
          onClick={() => updateField("enabled", !form.enabled)}
          disabled={disabled}
        >
          <Power className="h-4 w-4" />
          {form.enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Save success */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Configuration saved successfully.
        </div>
      )}

      <form onSubmit={save} className="space-y-5">
        {/* Lazy-Bird Project ID */}
        <div className="space-y-1.5">
          <label
            htmlFor="lb-project-id"
            className="block text-sm font-medium text-custom-text-200"
          >
            Lazy-Bird Project ID
          </label>
          <input
            id="lb-project-id"
            type="text"
            value={form.lazy_bird_project_id}
            onChange={(e) => updateField("lazy_bird_project_id", e.target.value)}
            placeholder="UUID from Lazy-Bird project"
            className="w-full rounded-md border border-custom-border-200 bg-custom-background-100 px-3 py-2 text-sm text-custom-text-100 placeholder:text-custom-text-400 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100"
            disabled={disabled}
          />
        </div>

        {/* API Connection (per-project override) */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-custom-text-200">
            API Connection
          </legend>
          <p className="text-xs text-custom-text-400">
            Leave empty to use the global configuration from environment variables.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="lb-api-url" className="block text-xs text-custom-text-300">
                API URL
              </label>
              <input
                id="lb-api-url"
                type="url"
                value={form.api_url}
                onChange={(e) => updateField("api_url", e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full rounded-md border border-custom-border-200 bg-custom-background-100 px-3 py-2 text-sm text-custom-text-100 placeholder:text-custom-text-400 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="lb-api-key" className="block text-xs text-custom-text-300">
                API Key
              </label>
              <input
                id="lb-api-key"
                type="password"
                value={form.api_key}
                onChange={(e) => updateField("api_key", e.target.value)}
                placeholder="Enter new key to update"
                className="w-full rounded-md border border-custom-border-200 bg-custom-background-100 px-3 py-2 text-sm text-custom-text-100 placeholder:text-custom-text-400 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100"
                disabled={disabled}
                autoComplete="off"
              />
            </div>
          </div>
        </fieldset>

        {/* State mapping */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-custom-text-200">
            State Mapping
          </legend>
          <p className="text-xs text-custom-text-400">
            Map Plane issue states to automation triggers.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="lb-ready" className="block text-xs text-custom-text-300">
                Ready State
              </label>
              <input
                id="lb-ready"
                type="text"
                value={form.ready_state_name}
                onChange={(e) => updateField("ready_state_name", e.target.value)}
                className="w-full rounded-md border border-custom-border-200 bg-custom-background-100 px-3 py-2 text-sm text-custom-text-100 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="lb-progress" className="block text-xs text-custom-text-300">
                In Progress State
              </label>
              <input
                id="lb-progress"
                type="text"
                value={form.in_progress_state_name}
                onChange={(e) => updateField("in_progress_state_name", e.target.value)}
                className="w-full rounded-md border border-custom-border-200 bg-custom-background-100 px-3 py-2 text-sm text-custom-text-100 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="lb-review" className="block text-xs text-custom-text-300">
                In Review State
              </label>
              <input
                id="lb-review"
                type="text"
                value={form.review_state_name}
                onChange={(e) => updateField("review_state_name", e.target.value)}
                className="w-full rounded-md border border-custom-border-200 bg-custom-background-100 px-3 py-2 text-sm text-custom-text-100 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100"
                disabled={disabled}
              />
            </div>
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-custom-border-200 pt-4">
          <button
            type="submit"
            className="rounded-md bg-custom-primary-100 px-4 py-2 text-sm font-medium text-white hover:bg-custom-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || saving}
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : isNew ? (
              "Create Configuration"
            ) : (
              "Save Changes"
            )}
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-custom-border-200 px-4 py-2 text-sm text-custom-text-200 hover:bg-custom-background-80 disabled:opacity-50"
            onClick={testConnection}
            disabled={disabled || testing}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unplug className="h-4 w-4" />
            )}
            Test Connection
          </button>
        </div>

        {/* Connection result */}
        {connectionResult && (
          <div
            className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm ${
              connectionResult.connected
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {connectionResult.connected ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Connected to Lazy-Bird
                {connectionResult.version && (
                  <span className="text-xs opacity-70">
                    (v{connectionResult.version})
                  </span>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Connection failed
                {connectionResult.error && (
                  <span className="text-xs opacity-70">
                    — {connectionResult.error}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
});
