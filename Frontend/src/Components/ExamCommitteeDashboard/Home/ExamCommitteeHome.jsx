import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import useStroge from "../../../stroge/useStroge";

const ExamCommitteeHome = () => {
  const { selectedCommittee } = useOutletContext();
  const AxiosSecure = useAxiosPrivate();
  const [committeeDetails, setCommitteeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useStroge();
  useEffect(() => {
    const getCommitteeDetails = async () => {
      try {
        setLoading(true);
        const response = await AxiosSecure.get(
          `/api/examCommittee/getCommitteeDetails/${selectedCommittee._id}`
        );
        setCommitteeDetails(response.data);
      } catch (error) {
        console.error("Error fetching committee details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCommittee) {
      getCommitteeDetails();
    }
  }, [selectedCommittee, AxiosSecure]);

  const chermanId = committeeDetails?.committeeMembers?.find(
    (member) => member.role === "Chairman"
  );
  console.log(chermanId);
  console.log(user);
  const handleToggleStatus = async () => {
    if (!committeeDetails || updating) return;

    const confirmAction = window.confirm(
      "Are you sure you want to change the committee status?"
    );
    if (!confirmAction) return;

    try {
      setUpdating(true);
      const newStatus =
        committeeDetails.status === "running" ? "off" : "running";

      const updatedCommittee = {
        ...committeeDetails,
        status: newStatus,
      };

      setCommitteeDetails(updatedCommittee);

      const res = await AxiosSecure.post(
        `/api/examCommittee/add_update_exam_committee`,
        updatedCommittee
      );

      // Show success notification instead of alert
      console.log(res.data.message || "Committee status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert on error
      setCommitteeDetails(committeeDetails);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!committeeDetails) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">
          Failed to load committee details
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Examination Committee
            </h1>
            <p className="text-lg text-gray-600">
              Class {committeeDetails.classId} • Batch{" "}
              {committeeDetails.batchNumber}
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      committeeDetails.status === "running"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  <span className="font-semibold capitalize">
                    {committeeDetails.status}
                  </span>
                </div>
              </div>
              {user._id === chermanId.teacherId && (
                <button
                  onClick={handleToggleStatus}
                  disabled={updating}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    committeeDetails.status === "running"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {updating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </span>
                  ) : committeeDetails.status === "running" ? (
                    "Deactivate Committee"
                  ) : (
                    "Activate Committee"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Committee Members Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Committee Members
            </h2>
          </div>

          <div className="space-y-4">
            {committeeDetails.committeeMembers?.map((member, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-blue-600">
                    {member.role.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {member.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {member.email}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full capitalize">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-green-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Results Status
            </h2>
          </div>

          {/* Results Submitted */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700">Results Submitted</h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {committeeDetails.final_mark_submit?.length || 0} subjects
              </span>
            </div>

            {committeeDetails.final_mark_submit?.length > 0 ? (
              <div className="space-y-2">
                {committeeDetails.final_mark_submit.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-green-50 rounded"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{subject}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <span className="text-gray-500">No results submitted yet</span>
              </div>
            )}
          </div>

          {/* Final Result Published */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">
                Final Result Published
              </h3>
              <div
                className={`px-3 py-1 rounded-full font-medium ${
                  committeeDetails.final_result_publish
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {committeeDetails.final_result_publish
                  ? "Published"
                  : "Not Published"}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {committeeDetails.final_result_publish
                ? "The final result has been published to students"
                : "Final result is pending publication"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCommitteeHome;
