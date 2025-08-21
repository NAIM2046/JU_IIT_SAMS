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
  const AxiosSecurse = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    AxiosSecurse.get(`api/getteacherschedule/${user.name}`)
      .then((res) => {
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
  }, [user.name, AxiosSecurse]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Final Mark Input
        </h1>
        <p className="text-gray-600">Select a course to input final marks</p>
      </div>

      {teacherCourse.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No courses assigned.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherCourse.map((course, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-blue-600 px-4 py-3">
                <h2 className="text-lg font-semibold text-white">
                  Class: {course.classId}
                </h2>
                <p className="text-blue-100">Batch: {course.batchNumber}</p>
              </div>
              <div className="p-4">
                <ul className="divide-y divide-gray-100">
                  {course.subjects.map((subj, subIdx) => (
                    <li
                      key={subIdx}
                      className="py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
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
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {subj.code} - {subj.title}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {subj.credit} Cr
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {subj.type}
                            </span>
                          </div>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <FinalmarkInput2ndEx></FinalmarkInput2ndEx>
      </div>

      <div>
        <FirnalmarkInput3rdEx></FirnalmarkInput3rdEx>
      </div>
    </div>
  );
};

export default FinalmarkHome;
