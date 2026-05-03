'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role, AttendanceStatus } from '@attendance-tracker/shared-types';
import { AttendanceList } from '@/components/mentor/AttendanceList';
import { BatchSelector } from '@/components/mentor/BatchSelector';
import { useAuth } from '@/hooks/useAuth';
import { Camera, Keyboard } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export default function MentorAttendancePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Note: in a real app, this would fetch from schedule-service
  useEffect(() => {
    async function fetchSchedules() {
      try {
        // Placeholder: Since we don't have a schedule-service endpoint for mentors yet,
        // we'll mock it or you can implement the endpoint in Phase 8.
        setSchedules([
          // { id: 'mock-uuid', period: 1, startTime: '09:00', endTime: '10:00', batch: { name: 'Batch A' } }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === Role.MENTOR) {
      fetchSchedules();
    }
  }, [user]);

  useEffect(() => {
    async function fetchAttendance() {
      if (!selectedScheduleId) return;
      try {
        const data = await apiClient(`/api/attendance/schedule/${selectedScheduleId}`, {
          baseURL: process.env.NEXT_PUBLIC_ATTENDANCE_SERVICE_URL,
        });
        setAttendances(data.data);
      } catch (err: any) {
        toast({
          title: 'Error fetching attendance',
          description: err.message,
          variant: 'destructive',
        });
      }
    }

    fetchAttendance();
  }, [selectedScheduleId]);

  const handleUpdateStatus = async (id: string, status: AttendanceStatus) => {
    setIsUpdating(true);
    try {
      await apiClient(`/api/attendance/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        baseURL: process.env.NEXT_PUBLIC_ATTENDANCE_SERVICE_URL,
      });

      setAttendances((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      toast({ title: 'Status updated', description: `Attendance marked as ${status}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[Role.MENTOR]}>
      <div className="max-w-3xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#121212]">Today's Classes</h1>
          <p className="text-[#6B7280] mt-1">Select a batch to manage attendance</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/mentor/attendance/scan"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#FF6B35] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <span className="font-semibold text-[#121212]">Scan QR Code</span>
          </Link>

          <Link
            href="/mentor/attendance/manual"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#FF6B35] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Keyboard className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <span className="font-semibold text-[#121212]">Manual Entry</span>
          </Link>
        </div>

        {!isLoading && (
          <BatchSelector
            schedules={schedules}
            selectedScheduleId={selectedScheduleId}
            onSelect={setSelectedScheduleId}
          />
        )}

        {selectedScheduleId && (
          <AttendanceList
            attendances={attendances}
            onUpdateStatus={handleUpdateStatus}
            isUpdating={isUpdating}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
