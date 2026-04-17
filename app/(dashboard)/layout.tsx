// ============================================================
// Vision Glass & Interior — Dashboard Layout Shell
// ============================================================

'use client';

import { useUiStore } from '@/store/uiStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-[#000000]">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'
        )}
      >
        <Topbar />
        <main className="p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
