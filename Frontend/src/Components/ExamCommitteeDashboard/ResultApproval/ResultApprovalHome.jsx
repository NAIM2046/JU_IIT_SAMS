import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
// React Icons imports
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaThumbsUp,
} from "react-icons/fa";
import ViewsResult from "./ViewsResult";

const ResultApprovalHome = () => {
  const { selectedCommittee } = useOutletContext();
  const AxiosSecure = useAxiosPrivate();
  const [existingExaminer, setExistingExaminer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModel, setShowModel] = useState(false);
  const [modelInfo, setModelInfo] = useState({});
  const fetchExistingExaminer = async () => {
    if (!selectedCommittee) return;
    try {
      const result = await AxiosSecure.get(
        `/api/examCommittee/getExaminerall/${selectedCommittee.classId}/${selectedCommittee.batchNumber}`
      );
      console.log(result.data);
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

  const renderStatus = (submitted) => {
    return submitted ? (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
        <FaCheckCircle className="mr-1" size={14} /> Submitted
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
        <FaTimesCircle className="mr-1" size={14} /> Pending
      </span>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        📑 Result Approval Dashboard
      </h2>

      {existingExaminer.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm sticky top-0">
              <tr>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">First Examiner</th>
                <th className="px-6 py-3">Second Examiner</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {existingExaminer.map((exam, index) => (
                <tr
                  key={exam._id || index}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {exam.subject}
                  </td>

                  {/* First Examiner */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {exam.firstExaminer || "N/A"}
                      </span>
                      {renderStatus(exam.firstExaminerSubmit)}
                    </div>
                  </td>

                  {/* Second Examiner */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {exam.secondExaminer || "N/A"}
                      </span>
                      {renderStatus(exam.secondExaminerSubmit)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      disabled={
                        !exam.firstExaminerSubmit || !exam.secondExaminerSubmit
                      }
                      onClick={() => {
                        console.log(exam);
                        setShowModel(true);
                        setModelInfo({
                          classId: exam.classId,
                          batchNumber: exam.batchNumber,
                          subject: exam.subject,
                        });
                      }}
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition ${
                        exam.firstExaminerSubmit && exam.secondExaminerSubmit
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <FaEye className="mr-1" size={14} /> View
                    </button>
                    <button
                      onClick={() => console.log("Approve", exam)}
                      disabled={
                        !exam.firstExaminerSubmit || !exam.secondExaminerSubmit
                      }
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition ${
                        exam.firstExaminerSubmit && exam.secondExaminerSubmit
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <FaThumbsUp className="mr-1" size={14} /> Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-yellow-50 border border-yellow-200 p-8 rounded-xl">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="empty"
            className="w-20 h-20 mb-4 opacity-80"
          />
          <p className="text-yellow-700 font-medium text-center">
            No subjects found for this committee.
          </p>
        </div>
      )}

      <div className="">
        {showModel && (
          <ViewsResult
            modelInfo={modelInfo}
            setShowModel={setShowModel}
          ></ViewsResult>
        )}
      </div>
    </div>
  );
};

export default ResultApprovalHome;
