// ============================================================
// Vision Glass & Interior — Topbar Component
// ============================================================

'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/store/uiStore';
import { cn, getInitials } from '@/lib/utils';
import { MobileSidebar } from './MobileSidebar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
};

export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, toggleMobileSidebar } = useUiStore();

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] || 'Vision Glass & Interior';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-20 h-16 flex items-center justify-between px-6',
          'bg-[#000000]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]',
          'transition-all duration-300',
          sidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-[88px]'
        )}
      >
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-[6px] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#111111] transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-2 rounded-[6px] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#111111] transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn('transition-transform duration-300', !sidebarOpen && 'rotate-180')}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div>
            <h1 className="text-lg font-semibold text-[#f9fafb]">{pageTitle}</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session?.user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-[#f9fafb]">
                  {session.user.name}
                </p>
                <p className="text-xs text-[#4b5563]">{session.user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-xs font-bold text-white">
                {getInitials(session.user.name || 'U')}
              </div>
            </div>
          )}
        </div>
      </header>

      <MobileSidebar />
    </>
  );
}
