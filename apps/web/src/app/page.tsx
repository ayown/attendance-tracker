import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2]">
      <div className="text-center space-y-6 p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#FF6B00] flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-4xl font-bold text-[#121212]">Attendance Tracker</h1>
        </div>
        <p className="text-[#6B7280] text-lg max-w-md">
          All-in-one college attendance tracking system with dynamic QR codes and intelligent
          scheduling.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-[#FF6B00] text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
