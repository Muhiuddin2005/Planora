import Sidebar from "@/components/dashboard/Sidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* DashboardTopbar hidden on mobile (Sidebar has its own mobile header) */}
        <div className="hidden md:block">
          <DashboardTopbar />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
