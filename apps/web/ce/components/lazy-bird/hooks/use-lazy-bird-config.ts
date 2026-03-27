/**
 * useLazyBirdConfig — Fetch and manage automation config for a project.
 *
 * Returns config data, form state, save/testConnection actions, and loading/error state.
 * Handles 404 (new config) vs existing config automatically.
 */

import { useCallback, useEffect, useState } from "react";

import { lazyBirdService } from "../api";
import type {
  TLazyBirdAutomationConfig,
  TLazyBirdTestConnectionResponse,
} from "../types";

export type ConfigFormState = {
  lazy_bird_project_id: string;
  enabled: boolean;
  ready_state_name: string;
  in_progress_state_name: string;
  review_state_name: string;
  api_url: string;
  api_key: string;
};

const DEFAULT_FORM: ConfigFormState = {
  lazy_bird_project_id: "",
  enabled: false,
  ready_state_name: "Ready",
  in_progress_state_name: "In Progress",
  review_state_name: "In Review",
  api_url: "",
  api_key: "",
};

type UseLazyBirdConfigReturn = {
  form: ConfigFormState;
  updateField: <K extends keyof ConfigFormState>(key: K, value: ConfigFormState[K]) => void;
  loading: boolean;
  saving: boolean;
  isNew: boolean;
  error: string | null;
  saveSuccess: boolean;
  save: (e: React.FormEvent) => Promise<void>;
  testing: boolean;
  connectionResult: TLazyBirdTestConnectionResponse | null;
  testConnection: () => Promise<void>;
};

export function useLazyBirdConfig(projectId: string): UseLazyBirdConfigReturn {
  const [form, setForm] = useState<ConfigFormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionResult, setConnectionResult] =
    useState<TLazyBirdTestConnectionResponse | null>(null);

  // Fetch existing config
  const fetchConfig = useCallback(async () => {
    try {
      setError(null);
      const config = await lazyBirdService.getConfig(projectId);
      setForm({
        lazy_bird_project_id: config.lazy_bird_project_id,
        enabled: config.enabled,
        ready_state_name: config.ready_state_name,
        in_progress_state_name: config.in_progress_state_name,
        review_state_name: config.review_state_name,
        api_url: config.api_url || "",
        api_key: "", // Never pre-filled — write-only on backend
      });
      setIsNew(false);
    } catch (err: any) {
      if (err?.status === 404 || err?.detail === "Not found.") {
        setIsNew(true);
      } else {
        setError("Failed to load configuration");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateField = useCallback(
    <K extends keyof ConfigFormState>(key: K, value: ConfigFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const save = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setSaveSuccess(false);
      setError(null);
      try {
        await lazyBirdService.upsertConfig(projectId, form);
        setSaveSuccess(true);
        setIsNew(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err: any) {
        setError(err?.detail || "Failed to save configuration");
      } finally {
        setSaving(false);
      }
    },
    [projectId, form]
  );

  const testConnection = useCallback(async () => {
    setTesting(true);
    setConnectionResult(null);
    try {
      const result = await lazyBirdService.testConnection({});
      setConnectionResult(result);
    } catch (err: any) {
      setConnectionResult({
        connected: false,
        error: err?.detail || "Connection failed",
      });
    } finally {
      setTesting(false);
    }
  }, []);

  return {
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
  };
}
