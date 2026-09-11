import type { NearbyMentee } from "@/types";

export function getMenteeInitials(peer: NearbyMentee): string {
  const source = peer.fullName?.trim() || peer.username;
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function formatMenteeRatingLine(peer: NearbyMentee): string {
  const rating = peer.rating != null ? `Rating: ${peer.rating}` : "Rating: —";
  return `${rating} • ${peer.proximityLabel}`;
}

export async function connectWithMentee(peer: NearbyMentee): Promise<string> {
  if (peer.codeforcesHandle) {
    const url = `https://codeforces.com/profile/${peer.codeforcesHandle}`;
    window.open(url, "_blank", "noopener,noreferrer");
    return `Opened Codeforces profile for @${peer.username}`;
  }

  const handle = `@${peer.username}`;
  await navigator.clipboard.writeText(handle);
  return `Copied ${handle} to clipboard`;
}
