import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
// React Icons imports
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaThumbsUp,
  FaToggleOn,
  FaToggleOff,
  FaUserTie,
} from "react-icons/fa";
import ViewsResult from "./ViewsResult";

const ResultApprovalHome = () => {
  const { selectedCommittee } = useOutletContext();
  const AxiosSecure = useAxiosPrivate();
  const [existingExaminer, setExistingExaminer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModel, setShowModel] = useState(false);
  const [modelInfo, setModelInfo] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchExistingExaminer = async () => {
    if (!selectedCommittee) return;
    try {
      const result = await AxiosSecure.get(
        `/api/examCommittee/getExaminerall/${selectedCommittee.classId}/${selectedCommittee.batchNumber}`
      );
      // console.log(result.data);
      setExistingExaminer(result.data);
    } catch (err) {
      console.error("Error fetching existing examiners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingExaminer();
  }, [selectedCommittee]);

  const toggleExaminerStatus = async (
    subjectId,
    examinerType,
    currentStatus
  ) => {
    if (updatingStatus) return;

    try {
      setUpdatingStatus(`${subjectId}-${examinerType}`);

      const newStatus = !currentStatus;

      // Update the local state immediately for better UX
      setExistingExaminer((prev) =>
        prev.map((subject) =>
          subject._id === subjectId
            ? {
                ...subject,
                [`${examinerType}Update`]: newStatus,
              }
            : subject
        )
      );
      // console.log(subjectId, examinerType, newStatus);

      // Send update to backend
      const result = await AxiosSecure.patch(
        `/api/examCommittee/updateExaminerStatus/${subjectId}`,
        {
          examinerType,
          updateStatus: newStatus,
        }
      );
      // console.log(result.data);

      alert(`${result.data.message}`);
      //console.log(`${examinerType} examiner status updated successfully`);
    } catch (error) {
      console.error("Error updating examiner status:", error);
      // Revert on error
      setExistingExaminer((prev) =>
        prev.map((subject) =>
          subject._id === subjectId
            ? {
                ...subject,
                [`${examinerType}Update`]: currentStatus,
              }
            : subject
        )
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const renderExaminerColumn = (
    examinerName,
    examinerSubmit,
    examinerUpdate,
    examinerType,
    subjectId
  ) => {
    const isUpdating = updatingStatus === `${subjectId}-${examinerType}`;

    return (
      <div className="flex flex-col space-y-2">
        <span
          className={`font-medium ${
            examinerName ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {examinerName || "Not Assigned"}
        </span>

        {/* Submission Status */}
        <div className="flex items-center justify-between">
          {renderStatus(examinerSubmit)}

          {/* Update Toggle Button - Only show if examiner is assigned */}
          {examinerName && (
            <button
              onClick={() =>
                toggleExaminerStatus(subjectId, examinerType, examinerUpdate)
              }
              disabled={isUpdating}
              className={`flex items-center px-2 py-1 text-xs rounded-md transition-all ${
                examinerUpdate
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              title={
                examinerUpdate
                  ? "Mark updates enabled"
                  : "Mark updates disabled"
              }
            >
              {isUpdating ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : examinerUpdate ? (
                <FaToggleOn className="mr-1" size={14} />
              ) : (
                <FaToggleOff className="mr-1" size={14} />
              )}
              {examinerUpdate ? "On" : "Off"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderStatus = (submitted) => {
    return submitted ? (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
        <FaCheckCircle className="mr-1" size={12} /> Submitted
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
        <FaTimesCircle className="mr-1" size={12} /> Pending
      </span>
    );
  };

  const canViewResults = (exam) => {
    //console.log("Checking results view for exam:", exam);
    const examiners = [
      { submitted: exam.firstExaminerSubmit, assigned: exam.firstExaminer },
      { submitted: exam.secondExaminerSubmit, assigned: exam.secondExaminer },
      { submitted: exam.thirdExaminerSubmit, assigned: exam.thirdExaminer },
    ];
    console.log(examiners);
    const assignedExaminers = examiners.filter((ex) => ex.assigned !== null);
    const submittedExaminers = assignedExaminers.filter(
      (ex) => ex.submitted === true
    );

    return submittedExaminers.length === assignedExaminers.length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin border-4 border-blue-300 border-t-blue-600 rounded-full w-10 h-10"></div>
        <span className="ml-3 text-gray-600 font-medium">
          Loading subjects...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <FaUserTie className="mr-3" size={28} />
          Result Approval Dashboard
        </h2>
        <p className="text-blue-100">
          Class {selectedCommittee?.classId} • Batch{" "}
          {selectedCommittee?.batchNumber}
        </p>
      </div>

      {existingExaminer.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-xl rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-800 text-white uppercase text-sm sticky top-0">
              <tr>
                <th className="px-6 py-4 font-semibold">Subject Code</th>
                <th className="px-6 py-4 font-semibold">First Examiner</th>
                <th className="px-6 py-4 font-semibold">Second Examiner</th>
                <th className="px-6 py-4 font-semibold">Third Examiner</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {existingExaminer.map((exam, index) => (
                <tr
                  key={exam._id || index}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-base">
                      {exam.subject}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {exam.classId} • Batch {exam.batchNumber}
                    </div>
                  </td>

                  {/* First Examiner */}
                  <td className="px-6 py-4">
                    {renderExaminerColumn(
                      exam.firstExaminer,
                      exam.firstExaminerSubmit,
                      exam.firstExaminerUpdate,
                      "firstExaminer",
                      exam._id
                    )}
                  </td>

                  {/* Second Examiner */}
                  <td className="px-6 py-4">
                    {renderExaminerColumn(
                      exam.secondExaminer,
                      exam.secondExaminerSubmit,
                      exam.secondExaminerUpdate,
                      "secondExaminer",
                      exam._id
                    )}
                  </td>

                  {/* Third Examiner */}
                  <td className="px-6 py-4">
                    {renderExaminerColumn(
                      exam.thirdExaminer,
                      exam.thirdExaminerSubmit,
                      exam.thirdExaminerUpdate,
                      "thirdExaminer",
                      exam._id
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 ">
                    <div className="flex flex-col  items-center">
                      <button
                        disabled={!canViewResults(exam)}
                        onClick={() => {
                          console.log(exam);
                          setShowModel(true);
                          setModelInfo({
                            classId: exam.classId,
                            batchNumber: exam.batchNumber,
                            subject: exam.subject.trim(),
                          });
                        }}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all w-full justify-center ${
                          canViewResults(exam)
                            ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <FaEye className="mr-2" size={14} />
                        View Results
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-yellow-50 border border-yellow-200 p-12 rounded-xl shadow-lg">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="empty"
            className="w-24 h-24 mb-4 opacity-80"
          />
          <p className="text-yellow-700 font-medium text-lg text-center">
            No subjects found for this committee.
          </p>
          <p className="text-yellow-600 text-sm text-center mt-2">
            Please check if the committee has been properly configured.
          </p>
        </div>
      )}

      {/* Results Modal */}
      <div>
        {showModel && (
          <ViewsResult modelInfo={modelInfo} setShowModel={setShowModel} />
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Status Legend:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FaCheckCircle className="text-green-600" />
            <span>Submitted - Examiner has submitted marks</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaTimesCircle className="text-red-600" />
            <span>Pending - Waiting for submission</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaToggleOn className="text-green-600" />
            <span>Updates Enabled - Examiner can modify marks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultApprovalHome;
