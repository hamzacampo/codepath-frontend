"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogAction = "confirm" | "delete" | "disconnect";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  variant?: "default" | "destructive";
  action?: ConfirmDialogAction;
}

function getDialogIcon(variant: "default" | "destructive", action: ConfirmDialogAction): string {
  if (action === "delete") return "mdi:trash-can-outline";
  if (action === "disconnect") return "mdi:link-variant-off";
  if (variant === "destructive") return "mdi:alert-circle-outline";
  return "mdi:help-circle-outline";
}

function resolveAction(
  variant: "default" | "destructive",
  action?: ConfirmDialogAction,
): ConfirmDialogAction {
  if (action) return action;
  return variant === "destructive" ? "disconnect" : "confirm";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  variant = "default",
  action,
}: ConfirmDialogProps) {
  const resolvedAction = resolveAction(variant, action);
  const dialogIcon = getDialogIcon(variant, resolvedAction);

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (loading) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="p-6 sm:p-8 bg-card border border-accent/30 shadow-2xl shadow-primary/10">
        <DialogHeader className="gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              variant === "destructive"
                ? "bg-destructive/15 text-destructive"
                : "bg-accent/20 text-accent"
            }`}
          >
            <Icon
              icon={dialogIcon}
              className="w-6 h-6"
              aria-hidden
            />
          </div>
          <DialogTitle className="text-xl text-foreground">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-border text-foreground hover:bg-secondary"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
            className={
              variant === "destructive"
                ? undefined
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
