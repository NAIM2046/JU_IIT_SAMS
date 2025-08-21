import React, { useState, useEffect } from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const FinalmarkInput2ndEx = () => {
  const { user } = useStroge();
  const [subjectList, setSubjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const AxiosSecure = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await AxiosSecure.get(
          `/api/examCommittee/getAteacher2ndExaminersubjectList/${user._id}`
        );
        setSubjectList(result.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchData();
    }
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin border-4 border-blue-300 border-t-blue-600 rounded-full w-10 h-10"></div>
        <span className="ml-3 text-gray-600">Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📚 Second Examiner Subject List
      </h2>
      {subjectList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectList.map((subject, index) => (
            <div
              key={index}
              onClick={() =>
                navigate(
                  `/teacherDashboard/finalMarkInput/${subject.classId}/${subject.subject}/${subject.batchNumber}/2nd`,
                  {
                    state: {
                      classId: subject.classId,
                      subject: subject.subject,
                      batchNumber: subject.batchNumber,
                      examiner: "2nd",
                    },
                  }
                )
              }
              className="bg-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg p-4 cursor-pointer border hover:border-blue-400"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {subject.subject || "Unnamed Subject"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Class: <span className="font-medium">{subject.classId}</span>
              </p>
              <p className="text-sm text-gray-500">
                Batch:{" "}
                <span className="font-medium">{subject.batchNumber}</span>
              </p>
              <span className="inline-block mt-3 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                2nd Examiner
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-700 font-medium">
            No subjects assigned yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default FinalmarkInput2ndEx;
