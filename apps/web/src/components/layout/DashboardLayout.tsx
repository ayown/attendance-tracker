'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { Role } from '@attendance-tracker/shared-types';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  SUPER_ADMIN: [
    { label: 'Overview', href: '/super-admin', icon: '⊞' },
    { label: 'Cohorts', href: '/super-admin/cohorts', icon: '🏫' },
    { label: 'Admins', href: '/super-admin/admins', icon: '👤' },
  ],
  ADMIN: [
    { label: 'Overview', href: '/admin', icon: '⊞' },
    { label: 'Students', href: '/admin/students', icon: '🎓' },
    { label: 'Batches', href: '/admin/batches', icon: '📦' },
    { label: 'Schedules', href: '/admin/schedules', icon: '📅' },
    { label: 'Reports', href: '/admin/reports', icon: '📊' },
  ],
  MENTOR: [
    { label: 'Overview', href: '/mentor', icon: '⊞' },
    { label: 'Attendance', href: '/mentor/attendance', icon: '✅' },
    { label: 'Schedule', href: '/mentor/schedule', icon: '📅' },
    { label: 'Batches', href: '/mentor/batches', icon: '📦' },
  ],
  STUDENT: [
    { label: 'Dashboard', href: '/student', icon: '⊞' },
    { label: 'My QR Code', href: '/student/attendance', icon: '📱' },
    { label: 'Schedule', href: '/student/schedule', icon: '📅' },
    { label: 'History', href: '/student/attendance/history', icon: '📋' },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] ?? [];

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex bg-[#FAF7F2]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121212] flex flex-col fixed inset-y-0 left-0 z-10">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-white font-semibold text-sm">Attendance Tracker</span>
        </div>

        {/* User badge */}
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-white/90 text-sm font-medium truncate">{user.name}</p>
          <p className="text-white/50 text-xs truncate">{user.email}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-medium">
            {user.role.replace('_', ' ')}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            <span>→</span> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
