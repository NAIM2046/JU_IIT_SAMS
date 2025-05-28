import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

const ClassHistory = () => {
  const { user } = useStroge();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const AxiosSecure = useAxiosPrivate();
  const teacherName = user.name;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await AxiosSecure.get(
          `/api/classHistory/byTeacher?teacherName=${teacherName}`
        );
        setHistory(res.data);
      } catch (err) {
        setError("Failed to load class history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [teacherName]);

  const handleEnterClass = (classData) => {
    const schedule = {
      class: classData.className,
      subject: classData.subject,
    };
    const formattedDate = classData.date;
    // You can navigate using class name, ID, or other info
    navigate(`/teacherDashboard/Class/${schedule.class}`, {
      state: { schedule, formattedDate, teacherName: user.name },
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Class History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : history.length === 0 ? (
        <p>No class history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Class</th>
                <th className="border px-4 py-2">Subject</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Total</th>
                <th className="border px-4 py-2">Present</th>
                <th className="border px-4 py-2">Absent</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.className}</td>
                  <td className="border px-4 py-2">{item.subject}</td>
                  <td className="border px-4 py-2">{item.date}</td>
                  <td className="border px-4 py-2">{item.status}</td>
                  <td className="border px-4 py-2">{item.totalStudents}</td>
                  <td className="border px-4 py-2">{item.totalPresent}</td>
                  <td className="border px-4 py-2">{item.totalAbsent}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleEnterClass(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Enter Class
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassHistory;
