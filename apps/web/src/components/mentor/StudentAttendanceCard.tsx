'use client';

import { AttendanceStatus } from '@attendance-tracker/shared-types';
import { CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface StudentAttendanceCardProps {
  attendance: any;
  onUpdateStatus: (id: string, status: AttendanceStatus) => void;
  isUpdating: boolean;
}

export function StudentAttendanceCard({
  attendance,
  onUpdateStatus,
  isUpdating,
}: StudentAttendanceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusColors = {
    [AttendanceStatus.PRESENT]: 'bg-green-50 text-green-700 border-green-200',
    [AttendanceStatus.ABSENT]: 'bg-red-50 text-red-700 border-red-200',
    [AttendanceStatus.LATE]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  const StatusIcon = {
    [AttendanceStatus.PRESENT]: CheckCircle2,
    [AttendanceStatus.ABSENT]: XCircle,
    [AttendanceStatus.LATE]: Clock,
  }[attendance.status as AttendanceStatus];

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col">
          <span className="font-semibold text-[#121212]">{attendance.student.user.name}</span>
          <span className="text-xs text-[#6B7280]">{attendance.student.regno}</span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[attendance.status as AttendanceStatus]}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {attendance.status}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 flex gap-2 justify-end">
          <button
            onClick={() => onUpdateStatus(attendance.id, AttendanceStatus.PRESENT)}
            disabled={isUpdating || attendance.status === AttendanceStatus.PRESENT}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors"
          >
            Mark Present
          </button>
          <button
            onClick={() => onUpdateStatus(attendance.id, AttendanceStatus.ABSENT)}
            disabled={isUpdating || attendance.status === AttendanceStatus.ABSENT}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
          >
            Mark Absent
          </button>
          <button
            onClick={() => onUpdateStatus(attendance.id, AttendanceStatus.LATE)}
            disabled={isUpdating || attendance.status === AttendanceStatus.LATE}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 transition-colors"
          >
            Mark Late
          </button>
        </div>
      )}
    </div>
  );
}
