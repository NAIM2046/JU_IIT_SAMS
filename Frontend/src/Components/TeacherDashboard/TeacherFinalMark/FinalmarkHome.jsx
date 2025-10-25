import React, { useEffect, useState } from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import FinalmarkInput2ndEx from "./FinalmarkInput2ndEx";
import FirnalmarkInput3rdEx from "./FirnalmarkInput3rdEx";

const FinalmarkHome = () => {
  const { user } = useStroge();
  const [teacherCourse, setTeacherCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("first");
  const AxiosSecurse = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    AxiosSecurse.get(
      `/api/examCommittee/getAteacher1st_2nd_3rdExaminersubjectList/${user._id}/${"firstExaminer"}`
    )
      .then((res) => {
        console.log(res.data);
        const grouped = res.data.reduce((acc, item) => {
          const key = `${item.classId}_${item.batchNumber}`;
          if (!acc[key]) {
            acc[key] = {
              classId: item.classId,
              batchNumber: item.batchNumber,
              subjects: [],
            };
          }
          acc[key].subjects.push({
            code: item.subject,
          });
          return acc;
        }, {});

        const courses = Object.values(grouped);
        setTeacherCourse(courses);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user._id, AxiosSecurse]);

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-64 py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">Loading courses...</p>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
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
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );

  const TabButton = ({ active, onClick, children, icon }) => (
    <button
      className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
        active
          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <span className="mr-2 text-lg">{icon}</span>
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Final Mark Input
              </h1>
              <p className="text-gray-600">
                Manage and input final marks for your assigned courses
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 inline-block">
                <span className="text-sm text-gray-500">Welcome,</span>
                <span className="ml-1 font-medium text-gray-900">
                  {user?.name || "Teacher"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <TabButton
              active={activeTab === "first"}
              onClick={() => setActiveTab("first")}
              icon="👨‍🏫"
            >
              First Examiner
            </TabButton>
            <TabButton
              active={activeTab === "second"}
              onClick={() => setActiveTab("second")}
              icon="👩‍🏫"
            >
              Second Examiner
            </TabButton>
            <TabButton
              active={activeTab === "third"}
              onClick={() => setActiveTab("third")}
              icon="🧑‍🏫"
            >
              Third Examiner
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* First Examiner Tab */}
              {activeTab === "first" && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-blue-500 rounded-full mr-3"></div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      First Examiner Courses
                    </h2>
                  </div>

                  {teacherCourse.length === 0 ? (
                    <EmptyState message="No courses assigned for first examiner" />
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {teacherCourse.map((course, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h2 className="text-lg font-semibold text-white mb-1">
                                  Class {course.classId}
                                </h2>
                                <p className="text-blue-100 text-sm">
                                  Batch {course.batchNumber}
                                </p>
                              </div>
                              <span className="bg-blue-800 text-blue-100 text-xs px-2 py-1 rounded-full font-medium">
                                {course.subjects.length}{" "}
                                {course.subjects.length === 1
                                  ? "Subject"
                                  : "Subjects"}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3">
                              {course.subjects.map((subj, subIdx) => (
                                <div
                                  key={subIdx}
                                  className="group bg-white rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-all duration-200 border border-gray-100 hover:border-blue-200"
                                  onClick={() =>
                                    navigate(
                                      `/teacherDashboard/finalMarkInput/${course.classId}/${subj.code}/${course.batchNumber}/1st`,
                                      {
                                        state: {
                                          classId: course.classId,
                                          subject: subj.code,
                                          batchNumber: course.batchNumber,
                                          examiner: "1st",
                                        },
                                      }
                                    )
                                  }
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                      <span className="font-medium text-gray-900 group-hover:text-blue-700">
                                        {subj.code}
                                      </span>
                                    </div>
                                    <svg
                                      className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-transform"
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
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Second Examiner Tab */}
              {activeTab === "second" && (
                <div className="p-6">
                  <FinalmarkInput2ndEx />
                </div>
              )}

              {/* Third Examiner Tab */}
              {activeTab === "third" && (
                <div className="p-6">
                  <FirnalmarkInput3rdEx />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalmarkHome;
