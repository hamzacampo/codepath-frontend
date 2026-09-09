import { Icon } from "@iconify/react";

type CoachingStatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: string;
};

export function CoachingStatCard({ label, value, hint, icon }: CoachingStatCardProps) {
  return (
    <article className="flex flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-4 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon icon={icon} className="h-6 w-6 shrink-0 text-primary" aria-hidden />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </article>
  );
}
