import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const FinalResultPublice = () => {
  const { selectedCommittee } = useOutletContext();
  const [finalResults, setFinalResults] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const AxiosSecure = useAxiosPrivate();

  useEffect(() => {
    if (!selectedCommittee) return;

    const fetchFinalResults = async () => {
      try {
        const response = await AxiosSecure.get(
          `/api/final-results/getFinalResults/${selectedCommittee.classId}/${selectedCommittee.batchNumber}`
        );
        setFinalResults(response.data);
      } catch (error) {
        console.error("Error fetching final results:", error);
      }
    };

    fetchFinalResults();
  }, [selectedCommittee]);

  if (!selectedCommittee) {
    return (
      <p className="text-gray-600 text-center">Loading committee info...</p>
    );
  }

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await AxiosSecure.post(
        `/api/final-results/finalMarkInsert`,
        finalResults
      );
      alert(`${res.data.message}`);
    } catch (error) {
      console.error("Error publishing results:", error);
      alert("Failed to publish results.");
    } finally {
      setIsPublishing(false);
    }
  };
  console.log("Final Results:", finalResults);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Final Results - {selectedCommittee.classId} (Batch{" "}
          {selectedCommittee.batchNumber})
        </h2>
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className={`px-4 py-2 rounded-lg font-semibold text-white shadow-md transition 
          ${isPublishing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isPublishing ? "Publishing..." : "Publish Results"}
        </button>
      </div>

      {finalResults.length === 0 ? (
        <p className="text-gray-500">No results found</p>
      ) : (
        <div className="space-y-6">
          {finalResults.map((student) => (
            <div
              key={student.studentId}
              className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  {student.name}{" "}
                  <span className="text-sm text-gray-500">
                    (Roll: {student.class_roll})
                  </span>
                </h3>
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                  CGPA: {student.cgpa}
                </span>
                {student.isRetake && (
                  <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">
                    Retake
                  </span>
                )}
              </div>

              {/* Subject List Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">
                        Code
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left">
                        Subject
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center">
                        Grade
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center">
                        Point
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.subjectList.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">
                          {sub.subjectCode}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {sub.subjectName}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {sub.grade}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {sub.point}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {sub.credit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinalResultPublice;
