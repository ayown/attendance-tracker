'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ManualCodeInputProps {
  onSubmit: (code: string) => void;
  isProcessing: boolean;
}

export function ManualCodeInput({ onSubmit, isProcessing }: ManualCodeInputProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length >= 6) {
      onSubmit(code.trim());
      setCode('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB] w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-[#121212]">Manual Code Entry</h3>
        <p className="text-sm text-[#6B7280] mt-1">
          Enter the 6-digit code provided by the student
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. AB12CD"
            maxLength={6}
            disabled={isProcessing}
            className="w-full text-center text-4xl font-bold tracking-[0.25em] py-4 rounded-xl border border-[#D1D5DB] focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-all uppercase placeholder:text-gray-300 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={code.length < 6 || isProcessing}
          className="w-full py-4 bg-[#FF6B35] hover:bg-[#E85D2A] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-[56px]"
        >
          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Mark Attendance'}
        </button>
      </form>
    </div>
  );
}
