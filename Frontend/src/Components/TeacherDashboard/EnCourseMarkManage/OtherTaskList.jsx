import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const OtherTaskList = ({ classId, subjectCode, taskType, setActive }) => {
  const AxiosSecure = useAxiosPrivate();
  const [tasklist, setTasklist] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AxiosSecure.get(
          `/api/incoursemark/otherTaskList/${classId}/${taskType}/${subjectCode}`
        );
        console.log(res.data.data);
        setTasklist(res.data.data); // update state
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };
    fetchData();
  }, [classId, taskType, subjectCode, AxiosSecure]);

  // dummy handlers (replace with your actual API calls)
  const handleEdit = async (taskId) => {
    const storageKey = `mark_${classId}_${subjectCode}_${taskType}`;
    console.log("Edit task with id:", taskId);
    const res = await AxiosSecure.get(`/api/incoursemark/edittaske/${taskId}`);
    console.log(res.data);
    localStorage.setItem(storageKey, JSON.stringify(res.data));
    setActive(true);
  };

  const handleDelete = async (taskId) => {
    console.log("Delete task with id:", taskId);
    try {
      await AxiosSecure.delete(`/api/incoursemark/deleteTask/${taskId}`);
      // filter out deleted task from UI
      setTasklist((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div>
      <h1>Complete Task List</h1>
      <div className="space-y-4">
        {tasklist.length === 0 && <p>No tasks found.</p>}
        {tasklist.map((task) => (
          <div key={task._id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{task.title || "Task"}</h2>
            <p>
              Type: {task.type} - {task.Number}
            </p>
            <p>Subject: {task.subjectCode}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEdit(task._id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherTaskList;
