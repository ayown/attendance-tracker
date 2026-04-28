import Link from 'next/link';

export const metadata = { title: 'Unauthorized — Attendance Tracker' };

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
          <span className="text-3xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-[#121212]">Access Denied</h1>
        <p className="text-[#6B7280] text-sm max-w-sm">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}
