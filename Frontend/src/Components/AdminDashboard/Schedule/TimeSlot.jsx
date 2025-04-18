import { useState } from "react";
import { useScheduleStore } from "../../AdminDashboard/stores/scheduleStore";

export default function TimeSlot({ day, timeSlot, isHeader = false, onEdit }) {
    const { schedule } = useScheduleStore();
    const cellData = schedule[day]?.[timeSlot] || {};
  
    return (
      <div
        className={`p-3 border border-base-200 min-h-16 cursor-pointer hover:bg-base-100 transition-colors ${
          isHeader ? 'bg-base-200 font-bold' : 'bg-base-100'
        }`}
        onDoubleClick={!isHeader ? () => onEdit(day, timeSlot) : null}
      >
        {isHeader ? (
          <EditableTimeSlot timeSlot={timeSlot} />
        ) : (
          <div className="space-y-1">
            {cellData.teacher && <p className="text-sm">{cellData.teacher}</p>}
            {cellData.room && <p className="text-xs opacity-70">Room: {cellData.room}</p>}
            {cellData.subject && <p className="text-xs badge badge-neutral">{cellData.subject}</p>}
          </div>
        )}
      </div>
    );
  }
  
  function EditableTimeSlot({ timeSlot }) {
    const [editing, setEditing] = useState(false);
    const [newTime, setNewTime] = useState(timeSlot);
    const { editTimeSlot } = useScheduleStore();
  
    const handleSave = () => {
      editTimeSlot(timeSlot, newTime);
      setEditing(false);
    };
  
    return editing ? (
      <div className="flex gap-2">
        <input
          type="text"
          className="input input-xs w-full"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
        />
        <button className="btn btn-xs btn-success" onClick={handleSave}>
          ✓
        </button>
      </div>
    ) : (
      <div
        className="hover:bg-base-300 px-2 py-1 rounded cursor-pointer flex justify-between"
        onClick={() => setEditing(true)}
      >
        {timeSlot}
      </div>
    );
  }