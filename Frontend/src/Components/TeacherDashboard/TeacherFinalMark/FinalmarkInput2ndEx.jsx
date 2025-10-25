import React, { useEffect, useState } from "react";
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
          `/api/examCommittee/getAteacher1st_2nd_3rdExaminersubjectList/${user._id}/${"secondExaminer"}`
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

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin border-4 border-green-300 border-t-green-600 rounded-full w-12 h-12 mb-4"></div>
      <p className="text-gray-600">Loading second examiner subjects...</p>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Subjects Assigned
      </h3>
      <p className="text-gray-500">
        You haven't been assigned any subjects as second examiner yet.
      </p>
    </div>
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-green-500 rounded-full mr-3"></div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Second Examiner Subjects
          </h2>
          <p className="text-gray-600 text-sm">
            Manage marks for subjects where you are the second examiner
          </p>
        </div>
      </div>

      {subjectList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-100 p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-green-600 font-semibold">2nd</span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-green-500 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors">
                {subject.subject || "Unnamed Subject"}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Class {subject.classId}
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
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
                  Batch {subject.batchNumber}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-green-200">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Second Examiner
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinalmarkInput2ndEx;
