"use client";

import * as React from "react";
import Link from "next/link";

import type {
  AiCredentialApi,
  AiModelApi,
  AiModelsResponse,
  AiSettingsForm,
} from "@/types/ai-credentials-api";
import { ApiError, apiJson } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function aiSettingsDefaults(): AiSettingsForm {
  return {
    credentialId: "",
    model: "",
    systemPrompt: "",
    temperature: "0.7",
    maxTokens: "",
    continuousChat: false,
  };
}

export function parseAiSettingsFromRecord(
  settings: Record<string, unknown> | null | undefined
): AiSettingsForm {
  const d = aiSettingsDefaults();
  if (!settings) return d;
  return {
    credentialId:
      typeof settings.credentialId === "string" ? settings.credentialId : "",
    model: typeof settings.model === "string" ? settings.model : "",
    systemPrompt:
      typeof settings.systemPrompt === "string" ? settings.systemPrompt : "",
    temperature:
      typeof settings.temperature === "number"
        ? String(settings.temperature)
        : d.temperature,
    maxTokens:
      typeof settings.maxTokens === "number" ? String(settings.maxTokens) : "",
    continuousChat: settings.continuousChat === true,
  };
}

export function buildAiSettingsPayload(
  form: AiSettingsForm,
  opts?: { includeContinuousChat?: boolean }
): {
  credentialId: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number | null;
  continuousChat?: boolean;
} {
  const maxTok = form.maxTokens.trim();
  const payload: {
    credentialId: string;
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number | null;
    continuousChat?: boolean;
  } = {
    credentialId: form.credentialId.trim(),
    systemPrompt: form.systemPrompt.trim() || undefined,
    temperature: Number.parseFloat(form.temperature) || 0.7,
    maxTokens:
      maxTok === "" ? null : Math.max(1, Number.parseInt(maxTok, 10) || 512),
    ...(opts?.includeContinuousChat
      ? { continuousChat: form.continuousChat }
      : {}),
  };
  if (form.model.trim()) {
    payload.model = form.model.trim();
  }
  return payload;
}

export function aiSettingsFormValid(form: AiSettingsForm): boolean {
  return form.credentialId.trim().length > 0;
}

type CredentialModelFieldsProps = {
  credentials: AiCredentialApi[];
  value: AiSettingsForm;
  onChange: (next: AiSettingsForm) => void;
  /** Show continuous chat toggle (auto-reply). Default false. */
  showContinuousChat?: boolean;
  disabled?: boolean;
};

const CREDENTIAL_NONE = "__none__";
const MODEL_DEFAULT = "__default__";

export function CredentialModelFields({
  credentials,
  value,
  onChange,
  showContinuousChat = false,
  disabled = false,
}: CredentialModelFieldsProps) {
  const [models, setModels] = React.useState<AiModelApi[]>([]);
  const [modelsLoading, setModelsLoading] = React.useState(false);
  const [modelsError, setModelsError] = React.useState<string | null>(null);

  const activeCredentials = React.useMemo(
    () =>
      (Array.isArray(credentials) ? credentials : []).filter((c) => c.active),
    [credentials]
  );

  const selectedCredential = activeCredentials.find(
    (c) => c.id === value.credentialId
  );

  // Base UI Select crashes when value is "" / unknown and no matching SelectItem exists.
  const credentialSelectValue =
    value.credentialId.trim() &&
    activeCredentials.some((c) => c.id === value.credentialId)
      ? value.credentialId
      : CREDENTIAL_NONE;
  const modelInList = models.some(
    (m) => m.id === value.model || m.modelId === value.model
  );
  const modelSelectValue =
    value.model.trim() && modelInList ? value.model : MODEL_DEFAULT;

  React.useEffect(() => {
    if (!selectedCredential) {
      setModels([]);
      setModelsError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const res = await apiJson<AiModelsResponse>(
          `/v1/ai/models?provider=${encodeURIComponent(selectedCredential.provider)}`
        );
        if (cancelled) return;
        setModels(res.models);
        const stillValid = res.models.some(
          (m) => m.id === value.model || m.modelId === value.model
        );
        if (value.model && !stillValid) {
          onChange({ ...value, model: "" });
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiError ? err.message : "Could not load models.";
        setModelsError(msg);
        setModels([]);
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when provider/credential changes
  }, [selectedCredential?.id, selectedCredential?.provider]);

  const freeModels = models.filter((m) => m.tier === "free");
  const paidModels = models.filter((m) => m.tier === "paid");

  function providerLabel(p: string): string {
    return p === "gemini" ? "Gemini" : "OpenRouter";
  }

  return (
    <div className="space-y-4">
      {activeCredentials.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          No AI credentials yet.{" "}
          <Link
            href="/ai-credentials"
            className="font-semibold underline underline-offset-2"
          >
            Add a Gemini or OpenRouter key
          </Link>{" "}
          first.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs font-semibold">
            Credential <span className="text-red-600 dark:text-red-400">*</span>
          </Label>
          <Select
            value={credentialSelectValue}
            onValueChange={(v) => {
              const id = !v || v === CREDENTIAL_NONE ? "" : v;
              // Keep model empty until list loads / user picks an override.
              // Setting credential.model immediately can crash Select when that
              // id is not yet present in SelectItem options.
              onChange({
                ...value,
                credentialId: id,
                model: "",
              });
            }}
            disabled={disabled || activeCredentials.length === 0}
          >
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Select credential" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CREDENTIAL_NONE}>
                Select credential…
              </SelectItem>
              {activeCredentials.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} · {providerLabel(c.provider)} ({c.apiKeyMasked})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs font-semibold">
            Model override{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Select
            value={modelSelectValue}
            onValueChange={(v) =>
              onChange({
                ...value,
                model: !v || v === MODEL_DEFAULT ? "" : v,
              })
            }
            disabled={disabled || !selectedCredential || modelsLoading}
          >
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue
                placeholder={
                  modelsLoading
                    ? "Loading models…"
                    : selectedCredential
                      ? selectedCredential.modelLabel ??
                        "Use credential default"
                      : "Pick a credential first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MODEL_DEFAULT}>
                {selectedCredential?.modelLabel
                  ? `Default · ${selectedCredential.modelLabel}`
                  : "Use credential default"}
              </SelectItem>
              {freeModels.length > 0 ? (
                <>
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Free
                  </div>
                  {freeModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </>
              ) : null}
              {paidModels.length > 0 ? (
                <>
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Paid
                  </div>
                  {paidModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </>
              ) : null}
            </SelectContent>
          </Select>
          {modelsError ? (
            <p className="text-[11px] text-red-600 dark:text-red-400">
              {modelsError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">System prompt (optional)</Label>
        <Textarea
          value={value.systemPrompt}
          onChange={(e) =>
            onChange({ ...value, systemPrompt: e.target.value })
          }
          placeholder="You are a helpful assistant…"
          className="min-h-20 rounded-xl"
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Temperature</Label>
          <Input
            type="number"
            step="0.1"
            min={0}
            max={2}
            value={value.temperature}
            onChange={(e) =>
              onChange({ ...value, temperature: e.target.value })
            }
            className="rounded-xl"
            disabled={disabled}
          />
          <p className="text-[11px] text-muted-foreground">0.0 – 2.0 (default 0.7)</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Max tokens (optional)</Label>
          <Input
            value={value.maxTokens}
            onChange={(e) => onChange({ ...value, maxTokens: e.target.value })}
            placeholder="Leave empty for default"
            className="rounded-xl"
            disabled={disabled}
          />
        </div>
      </div>

      {showContinuousChat ? (
        <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 p-3 dark:border-violet-900/50 dark:bg-violet-950/25">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Continuous AI chat
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Stored for future use: AI continues until a human sends a message.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={value.continuousChat}
                onChange={(e) =>
                  onChange({ ...value, continuousChat: e.target.checked })
                }
                className="sr-only"
                disabled={disabled}
              />
              <span
                className={
                  value.continuousChat
                    ? "relative h-7 w-12 shrink-0 rounded-full border border-emerald-500 bg-emerald-500"
                    : "relative h-7 w-12 shrink-0 rounded-full border border-slate-200 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
                }
              >
                <span
                  className={
                    value.continuousChat
                      ? "absolute left-0.5 top-0.5 size-6 translate-x-5 rounded-full bg-white shadow transition-transform"
                      : "absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform"
                  }
                />
              </span>
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
