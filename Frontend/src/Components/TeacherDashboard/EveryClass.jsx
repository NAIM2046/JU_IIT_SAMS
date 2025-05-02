import React from "react";
import { useLocation } from "react-router-dom";

const EveryClass = () => {
  const location = useLocation();
  const scheduleData = location.state?.schedule || null; // Get the schedule data from the location state
  console.log(scheduleData); // Log the schedule data for debugging
  if (!scheduleData) {
    return <div>No schedule data available.</div>; // Handle the case where no data is passed
  }
  return <div></div>;
};

export default EveryClass;
