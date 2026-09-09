import type { BookingStatus } from "@/types";

const styles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  CONFIRMED: "bg-green-500/20 text-green-400 border-green-500/30",
  COMPLETED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CANCELLED: "bg-destructive/20 text-destructive border-destructive/30",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}
