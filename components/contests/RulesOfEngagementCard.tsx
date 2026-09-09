interface RulesOfEngagementCardProps {
  rules: string[];
  className?: string;
}

export function RulesOfEngagementCard({ rules, className = "" }: RulesOfEngagementCardProps) {
  if (rules.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border border-border/60 bg-[#1a1a1a] p-6 sm:p-8 ${className}`}
    >
      <h2 className="text-xl font-bold text-white mb-5">Rules of Engagement</h2>
      <ul className="flex flex-col gap-4">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-sm bg-[#7c3aed]" aria-hidden />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
