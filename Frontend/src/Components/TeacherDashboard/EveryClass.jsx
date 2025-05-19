import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const EveryClass = () => {
  const location = useLocation();
  const schedule = location.state?.schedule;
  const [students, setStudents] = useState([]);
  const [defaultAttendance, setDefaultAttendance] = useState("");
  const [isAttendanceSubmitted, setIsAttendanceSubmitted] = useState(false); // "P", "A", or ""

  const AxiosSecure = useAxiosPrivate();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!schedule?.class || !schedule?.subject) return;

      const date = new Date();
      const formattedDate = `${String(date.getDate()).padStart(2, "0")}${String(
        date.getMonth() + 1
      ).padStart(2, "0")}${date.getFullYear()}`; // e.g., 19052025

      try {
        // 1. Get student list
        const res = await AxiosSecure.get(
          `/api/auth/getStudentByClassandSection/${schedule.class}`
        );

        let updatedStudents = res.data.map((student) => ({
          ...student,
          attendance: "", // no default
        }));

        // 2. Check attendance record
        try {
          const attendanceRes = await AxiosSecure.get(
            `/api/attendance/check/${schedule.class}/${schedule.subject}/${formattedDate}`
          );

          const existingAttendance = attendanceRes.data;
          if (existingAttendance && existingAttendance.records) {
            setIsAttendanceSubmitted(true);
            updatedStudents = updatedStudents.map((student) => {
              const match = existingAttendance.records.find(
                (rec) => rec.studentId === student._id
              );
              return {
                ...student,
                attendance: match ? match.status : "",
              };
            });
          }
        } catch (error) {
          // No attendance found — skip
          setIsAttendanceSubmitted(false);
        }

        setStudents(updatedStudents);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    };

    fetchStudents();
  }, [schedule?.class, schedule?.subject]);

  // Handle individual student attendance change
  const updateSingleStudentAttendance = async (studentId, roll, status) => {
    if (!schedule?.class || !schedule?.subject) return;

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${today.getFullYear()}`;

    try {
      await AxiosSecure.post("/api/attendance/update-single", {
        className: schedule.class,
        subject: schedule.subject,
        date: dateStr,
        studentId,
        roll,
        status,
        students, // send all students so backend can create new attendance if needed
      });

      setStudents((prev) =>
        prev.map((student) =>
          student._id === studentId
            ? { ...student, attendance: status }
            : student
        )
      );
    } catch (err) {
      console.error("Failed to update single student attendance:", err);
    }
  };

  // Handle default attendance for all
  const handleDefaultAttendanceChange = async (status) => {
    if (!schedule?.class || !schedule?.subject) return;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${today.getFullYear()}`;

    try {
      await AxiosSecure.post("/api/attendance/set-default", {
        className: schedule.class,
        subject: schedule.subject,
        date: dateStr,
        students,
        defaultStatus: status,
      });

      // Update local state
      setStudents((prev) =>
        prev.map((student) => ({
          ...student,
          attendance: status,
        }))
      );
      setDefaultAttendance(status);
    } catch (err) {
      console.error("Failed to set default attendance:", err);
    }
  };
  // console.log(schedule.subject);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Students in Class {schedule?.class}
      </h2>
      <table className="table-auto border border-gray-300 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Roll</th>
            <th className="border border-gray-300 px-4 py-2">Homework</th>
            <th className="border border-gray-300 px-4 py-2">Performance</th>
            <th className="border border-gray-300 px-4 py-2 text-center">
              <div>Attendance</div>
              <div className="flex justify-center gap-4 mt-1">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={defaultAttendance === "P"}
                    disabled={isAttendanceSubmitted}
                    onChange={() => handleDefaultAttendanceChange("P")}
                  />
                  P
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={defaultAttendance === "A"}
                    disabled={isAttendanceSubmitted}
                    onChange={() => handleDefaultAttendanceChange("A")}
                  />
                  A
                </label>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {students?.map((student) => (
            <tr key={student._id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">
                {student.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {student.roll}
              </td>
              <td className="border border-gray-300 px-4 py-2">N/A</td>
              <td className="border border-gray-300 px-4 py-2">N/A</td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex justify-center gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name={`attendance-${student._id}`}
                      value="P"
                      checked={student.attendance === "P"}
                      onChange={() =>
                        updateSingleStudentAttendance(
                          student._id,
                          student.roll,
                          "P"
                        )
                      }
                    />
                    P
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name={`attendance-${student._id}`}
                      value="A"
                      checked={student.attendance === "A"}
                      onChange={() =>
                        updateSingleStudentAttendance(
                          student._id,
                          student.roll,
                          "A"
                        )
                      }
                    />
                    A
                  </label>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EveryClass;
