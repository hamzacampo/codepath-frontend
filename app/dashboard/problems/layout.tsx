import { StarNetworkBackground } from "@/components/ui/StarNetworkBackground";

/**
 * Full-viewport layout for CodePath problem solving — no site header, footer, or dashboard sidebar.
 */
export default function CodePathProblemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full flex-col bg-background overflow-hidden">
      <StarNetworkBackground />
      <div className="relative z-0 flex h-full min-h-0 w-full flex-1">{children}</div>
    </div>
  );
}
