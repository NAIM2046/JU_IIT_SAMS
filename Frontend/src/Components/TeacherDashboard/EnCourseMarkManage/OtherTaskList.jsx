import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const OtherTaskList = ({ classId, subjectCode, taskType, setActive }) => {
  const AxiosSecure = useAxiosPrivate();
  const [tasklist, setTasklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AxiosSecure.get(
          `/api/incoursemark/otherTaskList/${classId}/${taskType}/${subjectCode}`
        );
        setTasklist(res.data.data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, taskType, subjectCode, AxiosSecure]);

  const handleEdit = async (taskId) => {
    try {
      const storageKey = `mark_${classId}_${subjectCode}_${taskType}`;
      const res = await AxiosSecure.get(
        `/api/incoursemark/edittaske/${taskId}`
      );
      localStorage.setItem(storageKey, JSON.stringify(res.data));
      setActive(true);
    } catch (err) {
      console.error("Edit failed:", err);
      setError("Failed to load task for editing.");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await AxiosSecure.delete(`/api/incoursemark/deleteTask/${taskId}`);
      setTasklist((prev) => prev.filter((task) => task._id !== taskId));
      setConfirmDelete(null);
      window.location.reload();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  const formatTaskTitle = (task) => {
    return `${task.type}-${task.Number}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mx-auto max-w-8xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task List</h1>
        <div className="text-sm text-gray-500">
          {tasklist.length} {tasklist.length === 1 ? "task" : "tasks"} found
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tasklist.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No tasks found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no {taskType} tasks for this subject yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasklist.map((task) => (
            <div
              key={task._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-3 md:mb-0">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {formatTaskTitle(task)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Subject: {task.subjectCode} | Class: {task.classId}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(task._id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(task._id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>

              {confirmDelete === task._id && (
                <div className="mt-3 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700 mb-2">
                    Are you sure you want to delete this task?
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OtherTaskList;
