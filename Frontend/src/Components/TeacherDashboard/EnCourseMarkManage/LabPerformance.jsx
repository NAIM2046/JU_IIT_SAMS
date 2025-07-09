import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import axios from "axios";

const LabPerformance = () => {
  const location = useLocation();
  const [performanceInfo, setPerformanceInfo] = useState([]);
  const [totalCounts, setTotalCounts] = useState([]);

  const obj = location.state;
  console.log(obj);
  const axiosSecure = useAxiosPrivate();
  
  useEffect(() => {
    if (!obj) return;
    axiosSecure.post(`/api/performance/ByClassandSubject`, obj).then((res) => {
      console.log(res.data);
      setPerformanceInfo(res.data.performanceInfo);
      setTotalCounts(res.data.countsInfo);
    });
  }, [obj]);

  
  return <div>This is performance dashboard</div>;
};

export default LabPerformance;
