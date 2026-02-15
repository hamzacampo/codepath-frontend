import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { StarNetworkBackground } from "@/components/ui/StarNetworkBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-hidden relative">
      <StarNetworkBackground />
      <DashboardSidebar />
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden pt-16 px-4 lg:pt-0 lg:px-0 relative z-10">
        {children}
      </main>
    </div>
  );
}
