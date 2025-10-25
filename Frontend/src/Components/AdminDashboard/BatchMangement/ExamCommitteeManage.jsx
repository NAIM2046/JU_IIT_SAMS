import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const ExamCommitteeManage = () => {
  const AxiosSecure = useAxiosPrivate();
  const location = useLocation();
  const { classSub } = location.state || {};

  const [teacherList, setTeacherList] = useState([]);
  const [existingCommittee, setExistingCommittee] = useState([]);
  const [tempCommittee, setTempCommittee] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Member");
  const [committeeId, setCommitteeId] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  // Fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await AxiosSecure.get("api/auth/getTeacher");
        setTeacherList(res.data);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        showNotification("Failed to fetch teachers", "error");
      }
    };

    const fetchCommittee = async () => {
      try {
        const res = await AxiosSecure.get(
          `api/examCommittee/getCommittee/${classSub.class}/${classSub.batchNumber}`
        );
        setCommitteeId(res.data);
        setExistingCommittee(res.data?.committeeMembers || []);
      } catch (err) {
        console.error("Error fetching committee:", err);
        showNotification("Failed to fetch committee data", "error");
      }
    };

    if (classSub) {
      fetchTeachers();
      fetchCommittee();
    }
  }, [classSub, AxiosSecure]);

  // Add selected teacher to temp committee
  const handleAddMember = () => {
    if (!selectedTeacherId) {
      showNotification("Please select a teacher", "error");
      return;
    }

    const alreadyExists =
      tempCommittee.some((m) => m.teacherId === selectedTeacherId) ||
      existingCommittee.some((m) => m.teacherId === selectedTeacherId);

    if (alreadyExists) {
      showNotification("This teacher is already in the committee", "error");
      return;
    }

    const teacher = teacherList.find((t) => t._id === selectedTeacherId);
    if (teacher) {
      setTempCommittee((prev) => [
        ...prev,
        {
          teacherId: teacher._id,
          name: teacher.name,
          email: teacher.email,
          role: selectedRole,
        },
      ]);
      setSelectedTeacherId("");
      showNotification("Teacher added to temporary committee", "success");
    }
  };

  const handleRemoveTemp = (id) => {
    setTempCommittee((prev) => prev.filter((m) => m.teacherId !== id));
    showNotification("Teacher removed from temporary committee", "info");
  };

  const handleSubmitFinalCommittee = async () => {
    if (tempCommittee.length === 0 && existingCommittee.length === 0) {
      showNotification("Committee cannot be empty", "error");
      return;
    }

    const finalList = [...existingCommittee, ...tempCommittee];
    try {
      await AxiosSecure.post("/api/examCommittee/add_update_exam_committee", {
        classId: classSub.class,
        batchNumber: classSub.batchNumber,
        committeeMembers: finalList,
        status: "running",
        final_mark_submit: [],
        final_result_publish: false,
      });
      showNotification("Committee updated successfully!", "success");
      setExistingCommittee(finalList);
      setTempCommittee([]);
    } catch (err) {
      console.error("Error submitting committee:", err);
      showNotification("Failed to update committee", "error");
    }
  };

  const handleDeleteExistingMember = (index) => {
    const isconfirm = window.confirm(
      "Are you sure you want to remove this member?"
    );
    if (!isconfirm) return;

    const updatedCommittee = [...existingCommittee];
    updatedCommittee.splice(index, 1);
    setExistingCommittee(updatedCommittee);

    AxiosSecure.post("/api/examCommittee/add_update_exam_committee", {
      classId: classSub.class,
      batchNumber: classSub.batchNumber,
      committeeMembers: updatedCommittee,
    })
      .then(() => showNotification("Member removed successfully", "success"))
      .catch((err) => {
        console.error("Error updating committee:", err);
        showNotification("Failed to remove member", "error");
      });
  };

  const handleDeleteCommite = async () => {
    if (!committeeId._id) {
      showNotification("No committee selected to delete", "error");
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the entire committee?"
    );
    if (!confirmDelete) return;

    try {
      const res = await AxiosSecure.delete(
        `/api/examCommittee/deleteCommitte/${committeeId._id}`
      );
      if (res.data) {
        showNotification("Committee deleted successfully!", "success");
        setExistingCommittee([]);
        setTempCommittee([]);
        setCommitteeId({});
      }
    } catch (err) {
      console.error("Error deleting committee:", err);
      showNotification("Failed to delete committee", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
              notification.type === "error"
                ? "bg-red-100 text-red-800"
                : notification.type === "info"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-indigo-700 text-white">
            <h1 className="text-2xl font-bold">Exam Committee Management</h1>
            <p className="text-indigo-100">
              {classSub?.class} - Batch {classSub?.batchNumber}
            </p>
          </div>

          {/* Add Member Section */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Add Committee Members
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Teacher
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a teacher</option>
                  {teacherList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Chairman">Chairman</option>
                  <option value="Member">Member</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>

          {/* Committees Display */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Existing Committee */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Current Committee
                  </h2>
                  <button
                    onClick={handleDeleteCommite}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 focus:outline-none"
                  >
                    Delete Committee
                  </button>
                </div>

                {existingCommittee.length > 0 ? (
                  <ul className="space-y-2">
                    {existingCommittee.map((m, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
                      >
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-sm text-gray-600">{m.email}</p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                              m.role === "Chairman"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {m.role}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteExistingMember(i)}
                          className="text-red-600 hover:text-red-800 focus:outline-none"
                          title="Remove member"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-white p-4 rounded-md text-center text-gray-500">
                    No members in the current committee
                  </div>
                )}
              </div>

              {/* Temporary Committee */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Pending Additions
                </h2>

                {tempCommittee.length > 0 ? (
                  <ul className="space-y-2">
                    {tempCommittee.map((m, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
                      >
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-sm text-gray-600">{m.email}</p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                              m.role === "Chairman"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {m.role}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveTemp(m.teacherId)}
                          className="text-red-600 hover:text-red-800 focus:outline-none"
                          title="Remove from pending"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-white p-4 rounded-md text-center text-gray-500">
                    No pending members to add
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmitFinalCommittee}
                disabled={
                  tempCommittee.length === 0 && existingCommittee.length === 0
                }
                className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  tempCommittee.length === 0 && existingCommittee.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Save Committee Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCommitteeManage;
