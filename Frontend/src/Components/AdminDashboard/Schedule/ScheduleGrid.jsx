import { useState } from "react";
import { useScheduleStore } from "../stores/scheduleStore";
import TimeSlot from "./TimeSlot";
import DayColumn from "./DayColumn";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

export default function ScheduleGrid() {
    const axiosSecure = useAxiosPrivate();


    const { days, timeSlots, addTimeSlot, schedule } = useScheduleStore();

    const handleSaveSchedule = () => {
      // Logic to save the schedule (e.g., send to server) 
      axiosSecure.post('/api/addschedule', schedule)
      .then(response => {
          console.log("Schedule saved successfully:", response.data);
      }).catch(error => {
          console.error("Error saving schedule:", error);
      });
    };

    const [newTime, setNewTime] = useState('');
  
    const handleAddTimeSlot = () => {
      if (newTime.trim()) {
        addTimeSlot(newTime);
        setNewTime('');
      }
    };
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Class Schedule</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New time slot (e.g., 11:00 AM)"
              className="input input-bordered"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSaveSchedule}>
              Save
            </button>
            <button className="btn btn-primary" onClick={handleAddTimeSlot}>
              Add Time Slot
            </button>
          </div>
        </div>
  
        <div className="flex overflow-x-auto pb-4">
          {/* Time slot header column */}
          <div className="flex flex-col min-w-[120px]">
            <div className="p-3 h-[60px]"></div>
            {timeSlots.map((timeSlot) => (
              <TimeSlot
                key={`header-${timeSlot}`}
                timeSlot={timeSlot}
                isHeader
              />
            ))}
          </div>
  
          {/* Day columns */}
          {days.map((day) => (
            <DayColumn key={day} day={day} />
          ))}
        </div>
      </div>
    );
  }