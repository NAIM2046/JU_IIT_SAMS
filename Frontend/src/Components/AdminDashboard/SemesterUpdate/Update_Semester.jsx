import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const Update_Semester = () => {
  const AxiosSecure = useAxiosPrivate();
  const [semester, setSemester] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectClass, setSelectClass] = useState("");
  const [updateClass, setUpdateClass] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectChange = (e) => {
    setSelectClass(e.target.value);
  };

  const handleUpdateChange = (e) => {
    setUpdateClass(e.target.value);
  };

  const fetchStudentList = async () => {
    try {
      const res = await AxiosSecure.get(
        `/api/auth/getStudentByClassandSection/${selectClass}`
      );
      setStudentList(res.data);
      setSelectedStudents(res.data.map((student) => student._id)); // Select all by default
    } catch (err) {
      console.error("Failed to fetch student data:", err);
      toast.error("Failed to load student data");
    }
  };

  // ✅ Student select handlers
  const handleStudentSelect = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === studentList.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentList.map((student) => student._id));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await AxiosSecure.get("api/getclassandsub");
        setSemester(res.data);
      } catch (err) {
        console.error("Failed to fetch class & subject data:", err);
        toast.error("Failed to load class and subject data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectClass) {
      fetchStudentList();
    }
  }, [selectClass]);

  const handleUpdateSemester = async () => {
    if (!selectClass || !updateClass) {
      toast.error("Please select both current and update semesters");
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error("No students selected for update");
      return;
    }

    try {
      setIsUpdating(true);
      const res = await AxiosSecure.put("/api/auth/update_class_students", {
        studentIds: selectedStudents,
        newClass: updateClass,
      });
      toast.success(
        `Successfully updated ${res.data.modifiedCount} students to ${updateClass}`
      );
      fetchStudentList(); // Refresh the student list
    } catch (err) {
      console.error("Failed to update students:", err);
      toast.error("Failed to update students");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Update Semester</h1>
          <p className="mt-2 text-sm text-gray-600">
            Select students and update their semester information
          </p>
        </div>

        {/* Semester Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Semester Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-medium text-gray-900">
                Current Semester
              </h3>
            </div>
            <select
              value={selectClass}
              onChange={handleSelectChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="">Select current semester</option>
              {semester.map((item) => (
                <option key={item._id} value={item.class}>
                  {item.class}
                </option>
              ))}
            </select>
          </div>

          {/* Update Semester Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-medium text-gray-900">
                Update Semester
              </h3>
            </div>
            <select
              value={updateClass}
              onChange={handleUpdateChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={loading}
            >
              <option value="">Select new semester</option>
              {semester.map((item) => (
                <option key={item._id} value={item.class}>
                  {item.class}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student List Section */}
        {selectClass && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Student List Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Student List
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Students in {selectClass} - {studentList.length} total
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 mr-3">
                      Selected: <strong>{selectedStudents.length}</strong>
                    </span>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition-colors"
                    >
                      {selectedStudents.length === studentList.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Select
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Photo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Class Roll
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Class
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentList.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentSelect(student._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={student.photoURL}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.class_roll}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.class}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {studentList.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No students found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No students available for the selected semester.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {selectClass && updateClass && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleUpdateSemester}
              disabled={isUpdating || selectedStudents.length === 0}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Update {selectedStudents.length} Student
                  {selectedStudents.length !== 1 ? "s" : ""} to {updateClass}
                </>
              )}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Update_Semester;
