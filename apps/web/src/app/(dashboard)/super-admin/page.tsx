import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@attendance-tracker/shared-types';

export const metadata = { title: 'SuperAdmin Dashboard — Attendance Tracker' };

export default function SuperAdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}>
      <div>
        <h1 className="text-2xl font-bold text-[#121212] mb-2">SuperAdmin Dashboard</h1>
        <p className="text-[#6B7280] text-sm">Phase 3+ content coming soon.</p>
      </div>
    </ProtectedRoute>
  );
}
