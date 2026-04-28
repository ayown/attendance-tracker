import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign In — Attendance Tracker' };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#121212]">Attendance Tracker</h1>
            <p className="text-xs text-[#6B7280]">College management system</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-[#121212] mb-1">Welcome back</h2>
          <p className="text-[#6B7280] text-sm mb-6">Sign in to your account to continue</p>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-[#6B7280] mt-6">
          Access is managed by your institution administrator.
        </p>
      </div>
    </main>
  );
}
