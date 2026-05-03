'use client';

import { AttendanceStatus } from '@attendance-tracker/shared-types';
import { StudentAttendanceCard } from './StudentAttendanceCard';

interface AttendanceListProps {
  attendances: any[];
  onUpdateStatus: (id: string, status: AttendanceStatus) => void;
  isUpdating: boolean;
}

export function AttendanceList({ attendances, onUpdateStatus, isUpdating }: AttendanceListProps) {
  if (attendances.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500">No attendance records found for this schedule.</p>
        <p className="text-sm text-gray-400 mt-1">
          Scan a QR code or enter a manual code to start.
        </p>
      </div>
    );
  }

  // Group by status for better overview
  const present = attendances.filter((a) => a.status === AttendanceStatus.PRESENT);
  const absent = attendances.filter((a) => a.status === AttendanceStatus.ABSENT);
  const late = attendances.filter((a) => a.status === AttendanceStatus.LATE);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4 text-sm font-medium">
        <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 text-center text-[#121212]">
          <span className="block text-2xl font-bold text-green-600">{present.length}</span>
          Present
        </div>
        <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 text-center text-[#121212]">
          <span className="block text-2xl font-bold text-red-600">{absent.length}</span>
          Absent
        </div>
        <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 text-center text-[#121212]">
          <span className="block text-2xl font-bold text-yellow-600">{late.length}</span>
          Late
        </div>
      </div>

      <div className="space-y-3">
        {attendances.map((record) => (
          <StudentAttendanceCard
            key={record.id}
            attendance={record}
            onUpdateStatus={onUpdateStatus}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
