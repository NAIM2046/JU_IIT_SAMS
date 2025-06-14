import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

const CurrentExam = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();

  const [currentExam, setCurrentExam] = useState(null);
  const [updatedMarks, setUpdatedMarks] = useState({});

  useEffect(() => {
    AxiosSecure.post("/api/exam/currentExam", { teacherId: user._id })
      .then((res) => {
        console.log("Current Exam Info:", res.data);
        if (res.data) {
          setCurrentExam(res.data);
          // Initialize updatedMarks state with existing marks
          const markData = {};
          res.data.studentsInfo.forEach((student) => {
            markData[student.studentId] = student.marks;
          });
          setUpdatedMarks(markData);
        }
      })
      .catch((err) => {
        console.error("Error fetching current exam info:", err);
      });
  }, []);

  const handleMarkChange = (studentId, value) => {
    setUpdatedMarks((prev) => ({
      ...prev,
      [studentId]: value,
    }));
    AxiosSecure.post("/api/exam/updateOneStudentMark", {
      examId: currentExam._id,
      studentId: studentId,
      marks: value,
    })
      .then((res) => {
        console.log("Marks updated successfully:", res.data);
      })
      .catch((err) => {
        console.error("Error updating marks:", err);
      });
  };

  const handleSave = () => {
    AxiosSecure.post("/api/exam/examSave", { examId: currentExam._id })
      .then((res) => {
        console.log("Marks saved successfully:", res.data);
        // Optionally, you can show a success message or update the UI
        window.location.reload(); // Reload the page to reflect changes
      })
      .catch((err) => {
        console.error("Error saving marks:", err);
      });
  };
  const handleDelete = () => {
    AxiosSecure.delete(`/api/exam/deleteCurrentExam/${currentExam._id}`)
      .then((res) => {
        console.log("Exam deleted successfully:", res.data);
        setCurrentExam(null); // Clear current exam data
      })
      .catch((err) => {
        console.error("Error deleting exam:", err);
      });
  };

  if (currentExam === null) {
    return <div>Loading exam data...</div>;
  }

  if (!currentExam || !currentExam.studentsInfo?.length) {
    return (
      <div className="text-center text-xl text-red-500 mt-10">
        No current exam found.
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Current Exam Info</h2>
      <div className="mb-4">
        <p>
          <strong>Class:</strong> {currentExam.class}
        </p>
        <p>
          <strong>Subject:</strong> {currentExam.subject}
        </p>
        <p>
          <strong>Exam Type:</strong> {currentExam.examType}
        </p>
        <p>
          <strong>Total Mark:</strong> {currentExam.totalMark}
        </p>
      </div>

      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll</th>
            <th>Marks</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {currentExam.studentsInfo?.map((student) => {
            const mark = updatedMarks[student.studentId];
            const percent = (
              (Number(mark) / Number(currentExam.totalMark)) *
              100
            ).toFixed(2);

            return (
              <tr key={student.studentId}>
                <td>{student.Name}</td>
                <td>{student.roll}</td>
                <td>
                  <input
                    type="number"
                    value={mark}
                    onChange={(e) =>
                      handleMarkChange(student.studentId, e.target.value)
                    }
                    className="input input-bordered w-24"
                    min="0"
                    max={currentExam.totalMark}
                  />
                </td>
                <td>{percent}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button onClick={handleSave} className="btn btn-primary mt-5">
        publish Marks
      </button>
      <button
        onClick={() => {
          handleDelete();
        }}
        className="btn btn-secondary mt-5 ml-3"
      >
        Cancel
      </button>
    </div>
  );
};

export default CurrentExam;
