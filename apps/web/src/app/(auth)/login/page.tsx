export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-[#F5F5F5]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-[#121212]">Sign In</h1>
        </div>
        <p className="text-[#6B7280] mb-6 text-sm">
          Login form — Phase 2 implementation
        </p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 border border-[#F5F5F5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] bg-[#FAF7F2]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-[#F5F5F5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] bg-[#FAF7F2]"
          />
          <button
            type="button"
            className="w-full py-3 bg-[#FF6B00] text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </main>
  );
}
