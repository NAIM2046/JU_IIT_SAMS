import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const EveryClass = () => {
  // Sample data - in a real app, this would come from your Express API

  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const location = useLocation();
  const scheduleData = location.state?.schedule || null;
  console.log(scheduleData);

  const [students, setStudents] = useState([]);

  const axiosSecure = useAxiosPrivate();
  useEffect(() => {
    if (!scheduleData) return;

    // 1. Load students
    axiosSecure
      .get(`/api/auth/getStudentByClassandSection/${scheduleData.class}`)
      .then((data) => {
        setStudents(data.data);
        console.log("students", students);
        const loadedStudents = data.data;
        setStudents(loadedStudents);

        // 2. Then load attendance info for today + subject
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, "0")}${(
          today.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}${today.getFullYear()}`;

        const studentIds = loadedStudents.map((s) => s._id);

        axiosSecure
          .post("/api/attendance/getAttendanceByDateAndSubject", {
            studentIds,
            date: formattedDate,
            subject: scheduleData.subject,
          })
          .then((response) => {
            const attendanceMap = {};
            response.data.forEach((item) => {
              attendanceMap[item.id] = item.attendance;
            });

            // 3. Update students state with pre-filled attendance
            setStudents((prev) =>
              prev.map((s) => ({
                ...s,
                attendance: attendanceMap[s._id] || "", // fallback to blank if not found
              }))
            );
          });
      });
  }, []);


  useEffect(()=>{
    axiosSecure
      .post(`api/attendance/updateAttendanceAndGetStatus`, {className:scheduleData.class, subject:scheduleData.subject})
      .then(res => {
        console.log("update", res.data);
      });
  }, [])


  // Handle attendance change
  const handleAttendanceChange = (studentId, isPresent) => {
    setStudents(
      students.map((student) =>
        student._id === studentId
          ? { ...student, attendance: isPresent ? "P" : "A" }
          : student
      )
    );
  };

  console.log(students);

  // Handle assessment change

  students.forEach(item => {
    console.log(item.attendance);
  })
  //
  const saveData = async () => {
    try {
      
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const updateAllAttendance = (status) => {
    
  }


  return (
    <div className="p-5 max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Student Attendance & Assessment
      </h2>

      <div className="overflow-x-auto mb-6 shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className=" gap-2 items-center">
                  <div>Attendance</div>
                  <p>set default</p>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      onChange={() => {
                        setSelectedAttendance("P");
                        updateAllAttendance("P");
                      }}
                      checked={selectedAttendance === "P"}
                      name="attendance"
                    />
                    <span className="ml-2 text-sm text-gray-700">P</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      onChange={() => {
                        setSelectedAttendance("A");
                        updateAllAttendance("A");
                      }}
                      checked={selectedAttendance === "A"}
                      name="attendance"
                    />
                    <span className="ml-2 text-sm text-gray-700">A</span>
                  </label>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.roll}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        checked={student.attendance === "P"}
                        onChange={(e) =>
                          handleAttendanceChange(student._id, e.target.checked)
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">P</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        checked={student.attendance === "A"}
                        onChange={(e) =>
                          handleAttendanceChange(student._id, !e.target.checked)
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">A</span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={saveData}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        Finish Class
      </button>
    </div>
  );
};

export default EveryClass;
