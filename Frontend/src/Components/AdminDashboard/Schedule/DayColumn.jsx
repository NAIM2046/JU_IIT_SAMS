import { useState } from "react";
import { useScheduleStore } from "../../AdminDashboard/stores/scheduleStore";
import TimeSlot from "./TimeSlot";
import EditModal from "./EditModal";

export default function DayColumn({ day }) {
    const { timeSlots } = useScheduleStore();
    const [editingCell, setEditingCell] = useState(null);
  
    return (
      <div className="flex flex-col">
        <div className="p-3 bg-base-200 font-bold text-center sticky top-0 z-10">
          {day}
        </div>
        {timeSlots.map((timeSlot) => (
          <TimeSlot
            key={timeSlot}
            day={day}
            timeSlot={timeSlot}
            onEdit={(d, t) => setEditingCell({ day: d, timeSlot: t })}
          />
        ))}
        {editingCell && (
          <EditModal
            day={editingCell.day}
            timeSlot={editingCell.timeSlot}
            onClose={() => setEditingCell(null)}
          />
        )}
      </div>
    );
  }