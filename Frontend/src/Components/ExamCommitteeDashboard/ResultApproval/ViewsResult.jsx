import { useState, useEffect } from "react";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { useOutletContext } from "react-router-dom";

const ViewsResult = ({ modelInfo, setShowModel }) => {
  const { selectedCommittee } = useOutletContext();
  const AxiosSecure = useAxiosPrivate();
  const [resultList, setResultList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(null);

  //console.log(selectedCommittee);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await AxiosSecure.get(
          `/api/finalmark/get1st_2nd_3rd_ExaminerFinalMarks/${modelInfo.classId}/${modelInfo.batchNumber}/${modelInfo.subject}`
        );
        console.log(res.data);
        setResultList(res.data || []);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [modelInfo, AxiosSecure]);

  // helper to find examiner marks
  const getExaminerMark = (examinerList, examinerName) => {
    const ex = examinerList.find((e) => e.examiner === examinerName);
    return ex?.holdquestionobtionmark !== ""
      ? Number(ex.holdquestionobtionmark)
      : null;
  };

  // calculate final mark logic
  const calculateFinalMark = (first, second, third) => {
    if (first !== null && second !== null) {
      const diff = Math.abs(first - second);

      if (diff <= 10) {
        // ✅ Case 1: small difference → average of 1st & 2nd
        return ((first + second) / 2).toFixed(2);
      } else {
        // ✅ Case 2: large difference → check 3rd examiner
        if (third !== null) {
          // Pick the 2 closest marks and average them
          const marks = [first, second, third];
          let bestAvg = null;
          let minDiff = Infinity;

          for (let i = 0; i < marks.length; i++) {
            for (let j = i + 1; j < marks.length; j++) {
              const diffPair = Math.abs(marks[i] - marks[j]);
              if (diffPair < minDiff) {
                minDiff = diffPair;
                bestAvg = ((marks[i] + marks[j]) / 2).toFixed(2);
              }
            }
          }
          return bestAvg; // ✅ average of closest 2
        } else {
          return "⚠️ Need 3rd";
        }
      }
    } else if (first !== null || second !== null) {
      // ✅ Case 3: only one examiner mark available
      const availableMark = first !== null ? first : second;
      return availableMark.toFixed(2);
    }
    return "-";
  };

  const handleApprove = async () => {
    setApproving(true);
    setApprovalSuccess(null);

    // Call API to approve the result
    const payload = resultList.map((student) => ({
      _id: student._id,
      finalMark: calculateFinalMark(
        getExaminerMark(student.examinerList, "1st"),
        getExaminerMark(student.examinerList, "2nd"),
        getExaminerMark(student.examinerList, "3rd")
      ),
    }));

    const committeeUpdate = {
      _id: selectedCommittee._id,
      subject: modelInfo.subject,
    };

    try {
      const response = await AxiosSecure.post(
        "/api/finalmark/updateExamCommiteFinalMark",
        { payload, committeeUpdate }
      );
      console.log("Approval response:", response.data);
      setApprovalSuccess(true);
      setTimeout(() => setApprovalSuccess(null), 3000);
    } catch (error) {
      console.error("Error approving results:", error);
      setApprovalSuccess(false);
      setTimeout(() => setApprovalSuccess(null), 3000);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Exam Results</h2>
          <button
            onClick={() => setShowModel(false)}
            className="text-gray-500 hover:text-red-500 transition-colors duration-200 rounded-full p-1 hover:bg-red-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Class ID</p>
            <p className="font-medium">{modelInfo.classId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Batch Number</p>
            <p className="font-medium">{modelInfo.batchNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Subject</p>
            <p className="font-medium">{modelInfo.subject}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      1st Examiner
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      2nd Examiner
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difference
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      3rd Examiner
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final Mark
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultList.length > 0 ? (
                    resultList.map((student) => {
                      const first = getExaminerMark(
                        student.examinerList,
                        "1st"
                      );
                      const second = getExaminerMark(
                        student.examinerList,
                        "2nd"
                      );
                      const third = getExaminerMark(
                        student.examinerList,
                        "3rd"
                      );

                      const diff =
                        first !== null && second !== null
                          ? Math.abs(first - second)
                          : null;

                      const finalMark = calculateFinalMark(
                        first,
                        second,
                        third
                      );

                      return (
                        <tr
                          key={student._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.class_roll}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 flex items-center gap-2">
                            {student.name}{" "}
                            {student.isRetake && (
                              <p className="text-red-500">(Retake)</p>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                            {first !== null ? first : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                            {second !== null ? second : "-"}
                          </td>
                          <td
                            className={`px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${
                              diff !== null && diff > 10
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {diff !== null ? diff : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                            {third !== null ? third : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-center text-blue-700">
                            {finalMark}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No results found for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div>
                {approvalSuccess === true && (
                  <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Results approved successfully!
                  </div>
                )}
                {approvalSuccess === false && (
                  <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Error approving results. Please try again.
                  </div>
                )}
              </div>

              <button
                onClick={handleApprove}
                disabled={approving || resultList.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors duration-200"
              >
                {approving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Approve Results
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewsResult;
