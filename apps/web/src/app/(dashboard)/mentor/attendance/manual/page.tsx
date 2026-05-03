'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@attendance-tracker/shared-types';
import { ManualCodeInput } from '@/components/mentor/ManualCodeInput';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MentorManualEntryPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleManualSubmit = async (code: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const data = await apiClient('/api/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({ code }),
        baseURL: process.env.NEXT_PUBLIC_ATTENDANCE_SERVICE_URL,
      });

      toast({
        title: 'Attendance Marked!',
        description: `${data.student.user.name} has been marked present.`,
      });
    } catch (err: any) {
      toast({
        title: 'Entry Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[Role.MENTOR]}>
      <div className="max-w-md mx-auto pt-4 pb-12">
        <Link
          href="/mentor/attendance"
          className="inline-flex items-center text-sm font-medium text-[#6B7280] hover:text-[#121212] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <ManualCodeInput onSubmit={handleManualSubmit} isProcessing={isProcessing} />
      </div>
    </ProtectedRoute>
  );
}
