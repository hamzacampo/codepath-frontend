"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import type { SkillLevelOption, SkillLevelPreference } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

interface LevelPreferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: SkillLevelOption[];
  currentPreference?: SkillLevelPreference | null;
  optionsLoading?: boolean;
  saving?: boolean;
  errorMessage?: string | null;
  mandatory?: boolean;
  onConfirm: (preference: SkillLevelPreference) => Promise<void>;
}

const OPTION_COPY: Record<
  Extract<SkillLevelPreference, "blended" | "codeforces" | "codepath">,
  { title: string; description: string; icon: string; recommended?: boolean }
> = {
  blended: {
    title: "Everything combined",
    description:
      "Blends your Codeforces rating with your CodePath solve history. Best for most learners.",
    icon: "mdi:chart-donut",
    recommended: true,
  },
  codeforces: {
    title: "Codeforces only",
    description: "Your level follows your connected Codeforces rating.",
    icon: "simple-icons:codeforces",
  },
  codepath: {
    title: "CodePath only",
    description: "Your level is based on problems you have solved on CodePath.",
    icon: "mdi:code-braces",
  },
};

function tierBadge(tier: string, rating: number | null | undefined) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
      {tier}
      {rating != null ? ` · ${rating}` : ""}
    </span>
  );
}

function resolveInitialPreference(
  options: SkillLevelOption[],
  currentPreference?: SkillLevelPreference | null,
): SkillLevelPreference {
  const available = new Set(options.map((o) => o.preference));

  if (currentPreference && available.has(currentPreference)) {
    return currentPreference;
  }

  if (currentPreference === "auto" && available.has("blended")) {
    return "blended";
  }

  const legacyMap: Partial<Record<SkillLevelPreference, SkillLevelPreference>> = {
    placement: "codepath",
    contest: "codepath",
    auto: "blended",
  };
  const mapped = currentPreference ? legacyMap[currentPreference] : undefined;
  if (mapped && available.has(mapped)) {
    return mapped;
  }

  const blended = options.find((o) => o.preference === "blended");
  return blended?.preference ?? options[0]?.preference ?? "blended";
}

export function LevelPreferenceDialog({
  open,
  onOpenChange,
  options,
  currentPreference = null,
  optionsLoading = false,
  saving = false,
  errorMessage = null,
  mandatory = false,
  onConfirm,
}: LevelPreferenceDialogProps) {
  const [selectedPreference, setSelectedPreference] =
    useState<SkillLevelPreference>("blended");

  useEffect(() => {
    if (!open || options.length === 0) return;
    setSelectedPreference(resolveInitialPreference(options, currentPreference));
  }, [open, options, currentPreference]);

  const handleConfirm = async () => {
    await onConfirm(selectedPreference);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (mandatory && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-xl bg-card text-foreground border border-border overflow-hidden p-0 gap-0 shadow-2xl">
        <div className="border-b border-border bg-linear-to-br from-accent/15 via-transparent to-transparent px-6 sm:px-8 pt-7 pb-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent ring-1 ring-accent/25">
                <Icon icon="mdi:target-account" className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight">
                  How should we calculate your level?
                </DialogTitle>
                <DialogDescription className="text-sm mt-2 leading-relaxed">
                  Choose how CodePath weighs your Codeforces account and your
                  on-platform solves. Your level updates after you save.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 sm:px-8 py-5 space-y-4 max-h-[min(60vh,520px)] overflow-y-auto overscroll-contain">
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <Icon
                icon="mdi:alert-circle-outline"
                className="w-5 h-5 shrink-0 mt-0.5"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          {optionsLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-muted-foreground">
              <Icon
                icon="svg-spinners:ring-resize"
                className="w-9 h-9 text-accent"
              />
              <p className="text-sm">Loading your options…</p>
            </div>
          ) : options.length === 0 && !errorMessage ? (
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-8 text-center">
              <Icon
                icon="mdi:information-outline"
                className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your Codeforces account to choose how your level is
                calculated.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {options.map((option) => {
                const active = selectedPreference === option.preference;
                const copy =
                  option.preference in OPTION_COPY
                    ? OPTION_COPY[
                        option.preference as keyof typeof OPTION_COPY
                      ]
                    : {
                        title: option.label,
                        description: option.description,
                        icon: "mdi:chart-line",
                      };

                return (
                  <button
                    key={option.preference}
                    type="button"
                    onClick={() => setSelectedPreference(option.preference)}
                    className={`relative w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                      active
                        ? "border-accent bg-accent/10 ring-2 ring-accent/35 shadow-sm"
                        : "border-border hover:border-accent/35 hover:bg-accent/5"
                    }`}
                  >
                    {copy.recommended && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
                        Recommended
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon icon={copy.icon} className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-sm text-foreground">
                            {copy.title}
                          </span>
                          {tierBadge(option.tier, option.rating)}
                        </div>
                        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {copy.description}
                        </p>
                      </div>

                      <div
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background"
                        }`}
                      >
                        {active && <Icon icon="mdi:check" className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border px-6 sm:px-8 py-4 bg-muted/20">
          {!mandatory && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          )}
          <Button
            className="w-full sm:w-auto gap-2"
            onClick={handleConfirm}
            disabled={saving || optionsLoading || options.length === 0}
          >
            {saving ? (
              <>
                <Icon icon="svg-spinners:ring-resize" className="w-4 h-4" />
                Updating level…
              </>
            ) : (
              <>
                <Icon icon="mdi:check" className="w-4 h-4" />
                Save level settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
