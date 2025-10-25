import React, { useEffect, useState } from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const CommitteeHistory = () => {
  const { user } = useStroge();
  const [committeeList, setCommitteeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const axiosSecure = useAxiosPrivate();

  const fetchCommitteeList = async () => {
    try {
      setLoading(true);
      const result = await axiosSecure.get(
        `/api/examCommittee/getTeacherInvolvementCommittee/${user._id}`
      );

      const sortedData = result.data.sort(
        (a, b) => Number(b.batchNumber) - Number(a.batchNumber)
      );
      setCommitteeList(sortedData);
    } catch (error) {
      console.error("Error fetching committees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommitteeList();
  }, []);

  const handleToggleStatus = async (committee) => {
    const action = committee.status === "running" ? "deactivate" : "activate";
    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this committee?`
    );

    if (!confirmAction) return;

    try {
      setUpdatingId(committee._id);
      const newStatus = committee.status === "running" ? "off" : "running";

      const updatedCommittee = {
        ...committee,
        status: newStatus,
      };

      await axiosSecure.post(
        `/api/examCommittee/add_update_exam_committee`,
        updatedCommittee
      );

      setCommitteeList((prev) =>
        prev.map((c) =>
          c._id === committee._id ? { ...c, status: newStatus } : c
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update committee status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      running: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Active",
      },
      off: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Inactive",
      },
    };

    const config = statusConfig[status] || statusConfig.off;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (committee) => {
    const isChairman = committee?.committeeMembers?.some(
      (member) => member.teacherId === user._id && member.role === "Chairman"
    );

    return isChairman ? (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
        Chairman
      </span>
    ) : (
      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
        Member
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-4"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Committee History
          </h1>
          <p className="text-gray-600">
            View and manage your examination committees
          </p>
        </div>

        {/* Committee List */}
        {committeeList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Committees Found
            </h3>
            <p className="text-gray-500">
              You are not involved in any examination committees yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {committeeList.map((committee) => {
              const isChairman = committee?.committeeMembers?.some(
                (member) =>
                  member.teacherId === user._id && member.role === "Chairman"
              );

              return (
                <div
                  key={committee._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Committee Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Batch {committee.batchNumber}
                        </h3>
                        {getStatusBadge(committee.status)}
                        {getRoleBadge(committee)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                          </svg>
                          <span>Class: {committee.classId}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Batch: {committee.batchNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isChairman && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleToggleStatus(committee)}
                          disabled={updatingId === committee._id}
                          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[160px] justify-center ${
                            committee.status === "running"
                              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md"
                              : "bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingId === committee._id ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-white"
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
                          ) : committee.status === "running" ? (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Deactivate
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                              </svg>
                              Activate
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteeHistory;
