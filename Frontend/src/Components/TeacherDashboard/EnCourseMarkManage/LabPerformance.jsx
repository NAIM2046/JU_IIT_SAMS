import React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const LabPerformance = () => {
  const location = useLocation();
  const [allPerformance, setAllPerformance] = useState([]);
  
  return <div>This is performance dashboard</div>;
};

export default LabPerformance;
