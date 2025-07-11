import React, { useEffect, useState } from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const EnCourseMarkHome = () => {
  const { user } = useStroge();
  const [teacherCourse, setTeacherCourse] = useState([]);
  const AxiosSecurse = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    AxiosSecurse.get(`api/getteacherschedule/${user.name}`)
      .then((res) => {
        console.log(res.data);
        setTeacherCourse(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  console.log(teacherCourse);

  const handleNavigate = (classId, subjectCode, taskType) => {
    navigate(`/teacherDashboard/incoursemark/${taskType}`, {
      state: { classId, subjectCode, taskType },
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">EnCourse Mark Home</h1>

      {teacherCourse.map((course, idx) => (
        <div key={idx} className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            Class: {course.classId}
          </h2>

          {course.subjects.map((subject, subIdx) => (
            <div key={subIdx} className="mb-4">
              <h3 className="text-lg font-medium mb-1">
                {subject.title} ({subject.code}) - {subject.type}
              </h3>

              {subject.type === "Theory" ? (
                <div className="flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() =>
                      navigate("/teacherDashboard/attendancemark", {
                        state: { subject, classId: course.classId },
                      })
                    }
                  >
                    Attendance
                  </button>
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() =>
                      handleNavigate(course.classId, subject.code, "assignment")
                    }
                  >
                    Assignment
                  </button>
                  <button
                    className="bg-purple-500 text-white px-3 py-1 rounded"
                    onClick={() =>
                      handleNavigate(course.classId, subject.code, "classtest")
                    }
                  >
                    Class Test
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() =>
                      navigate("/teacherDashboard/attendancemark", {
                        state: { subject, classId: course.classId },
                      })
                    }
                  >
                    Attendance
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                    onClick={() =>
                      navigate("/teacherDashboard/performanceMarks", {
                        state: {
                          courseId: course.classId,
                          courseCode: subject.code,
                        },
                      })
                    }
                  >
                    Performance
                  </button>
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() =>
                      handleNavigate(course.classId, subject.code, "labtest")
                    }
                  >
                    Lab Test
                  </button>
                  <button
                    className="bg-pink-500 text-white px-3 py-1 rounded"
                    onClick={() =>
                      handleNavigate(course.classId, subject.code, "project")
                    }
                  >
                    Project
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() =>
                      handleNavigate(course.classId, subject.code, "viva")
                    }
                  >
                    Viva
                  </button>
                  <button
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                    onClick={() =>
                      handleNavigate(course.classId, subject.code, "report")
                    }
                  >
                    Report
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default EnCourseMarkHome;
