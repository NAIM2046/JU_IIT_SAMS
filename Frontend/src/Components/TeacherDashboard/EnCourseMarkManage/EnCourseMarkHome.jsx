import React, { useEffect, useState } from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import {
  FiBook,
  FiUsers,
  FiFileText,
  FiClipboard,
  FiAward,
  FiLayers,
  FiCode,
  FiFilePlus,
} from "react-icons/fi";

const EnCourseMarkHome = () => {
  const { user } = useStroge();
  const [teacherCourse, setTeacherCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const AxiosSecurse = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    AxiosSecurse.get(`api/getteacherschedule/${user.name}`)
      .then((res) => {
        const dedupedData = res.data.map((item) => {
          // Deduplicate
          const subjectMap = item.subjects.reduce((map, subject) => {
            if (!map.has(subject.code.trim())) {
              map.set(subject.code.trim(), subject);
            }
            return map;
          }, new Map());

          // Convert to array and sort by code
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
  }, [user.name, AxiosSecurse]);
  console.log(teacherCourse);

  const handleNavigate = (
    classId,
    subjecttitle,
    subjectCode,
    batchNumber,
    taskType
  ) => {
    navigate(`/teacherDashboard/incoursemark/${taskType}`, {
      state: { classId, subjectCode, taskType, subjecttitle, batchNumber },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-8xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Course Mark Management
        </h1>
        <p className="text-gray-600">Manage student marks for your courses</p>
      </div>

      {teacherCourse.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <FiBook className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">
            No courses assigned
          </h3>
          <p className="text-gray-500 mt-2">
            You don't have any courses to manage marks for yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {teacherCourse.map((course, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
                <h2 className="text-xl font-semibold text-white">
                  Semester: {course.classId}
                </h2>
              </div>

              <div className="p-4 md:p-6">
                {course.subjects.map((subject, subIdx) => (
                  <div key={subIdx} className="mb-6 last:mb-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">
                          {subject.title} ({subject.code})
                        </h3>
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                            subject.type === "Theory"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {subject.type}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {/* Common buttons for both theory and lab */}
                      <button
                        onClick={() =>
                          navigate("/teacherDashboard/attendancemark", {
                            state: {
                              subject,
                              classId: course.classId,
                              batchNumber: course.batchNumber,
                            },
                          })
                        }
                        className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-3 rounded-lg transition-colors"
                      >
                        <FiUsers className="text-lg" />
                        Attendance
                      </button>

                      {subject.type === "Theory" ? (
                        <>
                          <button
                            onClick={() =>
                              handleNavigate(
                                course.classId,
                                subject.title,
                                subject.code,
                                course.batchNumber,
                                "assignment"
                              )
                            }
                            className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg transition-colors"
                          >
                            <FiFileText className="text-lg" />
                            Assignment
                          </button>
                          <button
                            onClick={() =>
                              handleNavigate(
                                course.classId,
                                subject.title,
                                subject.code,
                                course.batchNumber,
                                "classtest"
                              )
                            }
                            className="flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-3 rounded-lg transition-colors"
                          >
                            <FiClipboard className="text-lg" />
                            Class Test
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              navigate("/teacherDashboard/performanceMarks", {
                                state: {
                                  classId: course.classId,
                                  title: subject.title,
                                  subjectCode: subject.code,
                                  batchNumber: course.batchNumber,
                                },
                              })
                            }
                            className="flex items-center justify-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-3 rounded-lg transition-colors"
                          >
                            <FiAward className="text-lg" />
                            Performance
                          </button>
                          <button
                            onClick={() =>
                              handleNavigate(
                                course.classId,
                                subject.title,
                                subject.code,
                                course.batchNumber,
                                "labtest"
                              )
                            }
                            className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg transition-colors"
                          >
                            <FiLayers className="text-lg" />
                            Lab Test
                          </button>
                          <button
                            onClick={() =>
                              handleNavigate(
                                course.classId,
                                subject.title,
                                subject.code,
                                course.batchNumber,
                                "project"
                              )
                            }
                            className="flex items-center justify-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-800 px-4 py-3 rounded-lg transition-colors"
                          >
                            <FiCode className="text-lg" />
                            Project
                          </button>
                          <button
                            onClick={() =>
                              handleNavigate(
                                course.classId,
                                subject.title,
                                subject.code,
                                course.batchNumber,
                                "viva"
                              )
                            }
                            className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-3 rounded-lg transition-colors"
                          >
                            <FiUsers className="text-lg" />
                            Viva
                          </button>
                          <button
                            onClick={() =>
                              handleNavigate(
                                course.classId,
                                subject.title,
                                subject.code,
                                course.batchNumber,
                                "report"
                              )
                            }
                            className="flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-3 rounded-lg transition-colors"
                          >
                            <FiFilePlus className="text-lg" />
                            Report
                          </button>
                        </>
                      )}

                      {/* Final Mark button (common for both) */}
                      <button
                        onClick={() =>
                          navigate(
                            `/teacherDashboard/incoursefinalmark/${subject.title}`,
                            {
                              state: {
                                subjectCode: subject,
                                title: subject.title,
                                classId: course.classId,
                                batchNumber: course.batchNumber,
                              },
                            }
                          )
                        }
                        className="flex items-center justify-center gap-2 bg-lime-100 hover:bg-lime-200 text-lime-800 px-4 py-3 rounded-lg transition-colors"
                      >
                        <FiAward className="text-lg" />
                        Final Mark
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnCourseMarkHome;
