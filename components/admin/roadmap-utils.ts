export const ROADMAP_LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-[#aa97ce]",
  Intermediate: "bg-[#8465c2]",
  Advanced: "bg-[#572bae]",
  Expert: "bg-[#572bae]",
  Master: "bg-[#4a2399]",
};

export function formatRoadmapDate(value: string | Date): string {
  const date = new Date(value);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd} - ${mm} - ${yyyy}`;
}

export function jsonFieldToText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.objective === "string") return obj.objective;
    if (typeof obj.text === "string") return obj.text;
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function textToJsonField(text: string): string {
  const trimmed = text.trim();
  return trimmed;
}

export function parseProblemInput(
  raw: string,
  platform: "Codeforces" | "CodePath",
): string {
  const value = raw.trim();
  if (!value) return "";

  if (platform === "CodePath") {
    const slugMatch = value.match(/\/dashboard\/problems\/([^/?#]+)/i);
    if (slugMatch) return slugMatch[1];
    const segments = value.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? value;
  }

  const cfMatch = value.match(/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
  if (cfMatch) return `${cfMatch[1]}${cfMatch[2]}`;

  const contestMatch = value.match(/\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
  if (contestMatch) return `${contestMatch[1]}${contestMatch[2]}`;

  return value.replace(/\s+/g, "");
}
