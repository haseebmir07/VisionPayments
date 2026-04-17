// ============================================================
// Vision Glass & Interior — Sidebar Component
// ============================================================

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn, getInitials } from '@/lib/utils';
import { useUiStore } from '@/store/uiStore';
import { NAV_ITEMS } from '@/types';
import { Badge } from '@/components/ui/Card';

// SVG Icons
const icons: Record<string, React.ReactNode> = {
  LayoutDashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Receipt: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17.5v-11" />
    </svg>
  ),
  FileBarChart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-4" /><path d="M8 18v-2" /><path d="M16 18v-6" />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen } = useUiStore();

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30',
        'bg-[#0a0a0a] border-r border-[rgba(255,255,255,0.06)]',
        'transition-all duration-300 ease-out',
        sidebarOpen ? 'w-64' : 'w-[72px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center flex-shrink-0">
          <Image src="/logo.png" alt="Vision Glass Logo" width={32} height={32} className="object-contain" priority />
        </div>
        {sidebarOpen && (
          <span className="text-lg font-bold text-[#f9fafb] tracking-tight">
            Vision Glass & Interiors
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]'
                  : 'text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#111111]'
              )}
              title={item.label}
            >
              <span className="flex-shrink-0">{icons[item.icon]}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {session?.user && (
        <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className={cn('flex items-center gap-3', sidebarOpen ? 'px-3 py-2' : 'justify-center py-2')}>
            <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {getInitials(session.user.name || 'U')}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#f9fafb] truncate">
                  {session.user.name}
                </p>
                <Badge variant={session.user.role === 'admin' ? 'admin' : 'user'}>
                  {session.user.role}
                </Badge>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-[8px] text-sm text-[#9ca3af] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] transition-all duration-200',
              !sidebarOpen && 'justify-center'
            )}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
