import { create } from 'zustand';

export const useScheduleStore = create((set) => ({
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  timeSlots: ['8:00 AM - 9.00 AM'],
  schedule: {}, // Format: { day: { timeSlot: { teacher, room, subject } } }
  
  // Add new time slot
  addTimeSlot: (newTime) => set((state) => ({
    timeSlots: [...state.timeSlots, newTime]
  })),
  
  // Update a single cell's data
  updateCell: (day, timeSlot, data) => set((state) => {
    const updatedSchedule = {
      ...state.schedule,
      [day]: {
        ...(state.schedule[day] || {}),
        [timeSlot]: data
      }
    };
    
    return { schedule: updatedSchedule };
  }),
  
  // Edit time slot label (and update all references in schedule)
  editTimeSlot: (oldTime, newTime) => set((state) => {
    // Update timeSlots array
    const updatedTimeSlots = state.timeSlots.map(t => t === oldTime ? newTime : t);
    
    // Deep clone and update schedule
    const updatedSchedule = JSON.parse(JSON.stringify(state.schedule));
    for (const day in updatedSchedule) {
      if (updatedSchedule[day][oldTime]) {
        updatedSchedule[day][newTime] = updatedSchedule[day][oldTime];
        delete updatedSchedule[day][oldTime];
      }
    }
    
    return {
      timeSlots: updatedTimeSlots,
      schedule: updatedSchedule
    };
  })
}));