'use client';

interface BatchSelectorProps {
  schedules: any[];
  selectedScheduleId: string | null;
  onSelect: (scheduleId: string) => void;
}

export function BatchSelector({ schedules, selectedScheduleId, onSelect }: BatchSelectorProps) {
  if (schedules.length === 0) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200">
        No schedules assigned for today.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E7EB] mb-6">
      <label className="block text-sm font-semibold text-[#121212] mb-2">
        Select Batch / Schedule
      </label>
      <select
        value={selectedScheduleId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-[#F3F4F6] border-none rounded-lg py-3 px-4 text-[#121212] focus:ring-2 focus:ring-[#FF6B35] focus:bg-white transition-colors cursor-pointer"
      >
        <option value="" disabled>
          Select a batch to manage
        </option>
        {schedules.map((s) => (
          <option key={s.id} value={s.id}>
            {s.batch.name} — Period {s.period} ({s.startTime} - {s.endTime})
          </option>
        ))}
      </select>
    </div>
  );
}
