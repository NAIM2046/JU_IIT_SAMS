import { useState, useEffect } from "react";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const ViewsResult = ({ modelInfo, setShowModel }) => {
  const AxiosSecure = useAxiosPrivate();
  const [resultList, setResultList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await AxiosSecure.get(
        `/api/finalmark/get1stand2ndExaminerFinalMarks/${modelInfo.classId}/${modelInfo.batchNumber}/${modelInfo.subject}`
      );
      setResultList(res.data || []); // make sure to get the `data` array
    };
    fetchData();
  }, [modelInfo]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">View Result</h2>
          <button
            onClick={() => setShowModel(false)}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>

        <p>
          <strong>Class ID:</strong> {modelInfo.classId}
        </p>
        <p>
          <strong>Batch Number:</strong> {modelInfo.batchNumber}
        </p>
        <p className="mb-4">
          <strong>Subject:</strong> {modelInfo.subject}
        </p>

        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Roll</th>
              <th className="border px-2 py-1">1st Examiner</th>
              <th className="border px-2 py-1">2nd Examiner</th>
              <th className="border px-2 py-1">Difference</th>
              <th className="border px-2 py-1">3rd Examiner</th>
            </tr>
          </thead>
          <tbody>
            {resultList.map((student, idx) => {
              const mark1 = student.examiner1?.holdquestionobtionmark ?? 0;
              const mark2 = student.examiner2?.holdquestionobtionmark ?? 0;
              const diff = Math.abs(mark1 - mark2);
              const need3rd = diff > 5;

              return (
                <tr key={idx} className="text-center">
                  <td className="border px-2 py-1">{student.name}</td>
                  <td className="border px-2 py-1">{student.class_roll}</td>
                  <td className="border px-2 py-1">{mark1}</td>
                  <td className="border px-2 py-1">{mark2}</td>
                  <td className="border px-2 py-1">{diff}</td>
                  <td className="border px-2 py-1">
                    {need3rd ? (
                      <span className="text-red-500 font-semibold">
                        Required
                      </span>
                    ) : (
                      <span className="text-green-600">Not Needed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewsResult;
