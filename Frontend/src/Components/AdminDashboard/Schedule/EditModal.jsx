import { useState } from "react";
import { useScheduleStore } from "../stores/scheduleStore";

export default function EditModal({ day, timeSlot, onClose }) {
    const { schedule, updateCell } = useScheduleStore();
    const [formData, setFormData] = useState(
      schedule[day]?.[timeSlot] || { teacher: '', room: '', subject: '' }
    );
  
    const handleSave = () => {
      updateCell(day, timeSlot, formData);
      onClose();
    };
  
    return (
      <dialog open className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {day} - {timeSlot}
          </h3>
          <div className="space-y-4 py-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Teacher</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                value={formData.teacher}
                onChange={(e) =>
                  setFormData({ ...formData, teacher: e.target.value })
                }
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Room Number</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Subject</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </label>
          </div>
          <div className="modal-action">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </dialog>
    );
  }