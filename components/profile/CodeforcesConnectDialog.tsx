"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CodeforcesConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (handle: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function CodeforcesConnectDialog({
  open,
  onOpenChange,
  onConnect,
  loading = false,
  error = null,
}: CodeforcesConnectDialogProps) {
  const [handle, setHandle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || loading) return;
    await onConnect(handle.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:p-8 bg-[#1a1a1a] border-accent/40">
        <DialogHeader className="items-center text-center gap-3 mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Icon icon="simple-icons:codeforces" className="w-8 h-8" aria-hidden />
          </div>
          <DialogTitle className="text-2xl text-accent">Connect Codeforces</DialogTitle>
          <DialogDescription className="text-muted-foreground max-w-md">
            Enter your Codeforces handle. We will verify it and sync your stats for CodePrint
            analytics and personalized training.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Codeforces handle</span>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. tourist"
              className="bg-secondary/80 border-accent/40 text-foreground"
              autoFocus
              disabled={loading}
            />
          </label>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-accent/40"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!handle.trim() || loading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {loading ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
