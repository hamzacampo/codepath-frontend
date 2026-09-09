"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { CoachAvatar } from "@/components/coaching/CoachAvatar";
import type { CoachProfile } from "@/types";

type CoachAvatarEditorProps = {
  coach: CoachProfile;
  onUpdated: (coach: CoachProfile) => void;
};

export function CoachAvatarEditor({ coach, onUpdated }: CoachAvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasAvatar = Boolean(previewUrl ?? coach.user.profile?.avatarUrl);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);
    setError(null);

    try {
      const result = await apiService.uploadCoachAvatar(coach.id, file);
      onUpdated(result.coach);
      setPreviewUrl(null);
    } catch (err) {
      setPreviewUrl(null);
      setError(getApiErrorMessage(err, "Failed to upload photo"));
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!hasAvatar) return;
    if (!window.confirm("Remove this coach profile photo?")) return;

    setDeleting(true);
    setError(null);
    try {
      const result = await apiService.deleteCoachAvatar(coach.id);
      onUpdated(result.coach);
      setPreviewUrl(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to remove photo"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <CoachAvatar coach={coach} size="lg" previewUrl={previewUrl} />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={uploading || deleting}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50"
        >
          <Icon icon="mdi:camera-outline" className="h-4 w-4" aria-hidden />
          {uploading ? "Uploading..." : "Upload photo"}
        </button>
        {hasAvatar && (
          <button
            type="button"
            disabled={uploading || deleting}
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Icon icon="mdi:trash-can-outline" className="h-4 w-4" aria-hidden />
            {deleting ? "Removing..." : "Remove photo"}
          </button>
        )}
      </div>

      {error && <p className="text-center text-xs text-destructive">{error}</p>}
      <p className="text-center text-[11px] text-muted-foreground">
        JPG, PNG, WebP, or GIF · max 5 MB
      </p>
    </div>
  );
}
