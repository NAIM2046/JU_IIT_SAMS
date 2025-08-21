import React from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AttendanceSummaryHome = () => {
  const [loading, setLoading] = React.useState(true);
  const [teacherCourse, setTeacherCourse] = React.useState([]);
  const { user } = useStroge();
  const AxioseSecure = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    AxioseSecure.get(`api/getteacherschedule/${user.name}`)
      .then((res) => {
        console.log(res.data);
        const dedupedData = res.data.map((item) => {
          const subjectMap = item.subjects.reduce((map, subject) => {
            if (!map.has(subject.code.trim())) {
              map.set(subject.code.trim(), subject);
            }
            return map;
          }, new Map());

          const sortedSubjects = Array.from(subjectMap.values()).sort((a, b) =>
            a.code.localeCompare(b.code)
          );

          return {
            ...item,
            subjects: sortedSubjects,
          };
        });

        setTeacherCourse(dedupedData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user.name, AxioseSecure]);
  console.log(teacherCourse);

  const handleViewAttendance = (className, subjectCode, title, batchNumber) => {
    navigate(
      `/teacherDashboard/viewAttendanceSummary/${className}/${subjectCode}`,
      {
        state: {
          classId: className,
          subjectCode: subjectCode,
          title: title,
          batchNumber,
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teaching Schedule</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage attendance for your assigned courses
        </p>
      </div>

      {teacherCourse.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900">
            No courses assigned
          </h3>
          <p className="mt-1 text-gray-500">
            You currently don't have any assigned courses.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {teacherCourse.map((item, idx) => (
            <section key={idx} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Class {item.classId}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {item.subjects.map((subject) => (
                  <div
                    key={subject.code}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-5">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-md bg-indigo-100 text-indigo-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {subject.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Code: {subject.code}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                      <button
                        onClick={() =>
                          handleViewAttendance(
                            item.classId,
                            subject.code,
                            subject.title,
                            item.batchNumber
                          )
                        }
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                      >
                        View Attendance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceSummaryHome;
