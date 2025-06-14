import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import CurrentExam from "./CurrentExam";
import ExamHistroy from "./ExamHistroy";

const ExamHome = () => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [totalMark, setTotalMark] = useState("");
  const [examNumber, setExamNumber] = useState(1); // Assuming examNumber is used for some purpose

  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();

  useEffect(() => {
    AxiosSecure.get("/api/getallschedule").then((res) => {
      setTeacherClasses(res.data);
    });
  }, []);

  const handleClassChange = (e) => {
    const classNumber = e.target.value;
    setSelectedClass(classNumber);

    const selected = teacherClasses.find(
      (cls) => cls.classNumber === classNumber
    );
    if (!selected) return;

    const subjectSet = new Set();
    Object.values(selected.schedule).forEach((daySchedule) => {
      Object.values(daySchedule).forEach((slot) => {
        if (slot.subject && slot.subject.trim() !== "") {
          subjectSet.add(slot.subject);
        }
      });
    });

    setSubjects([...subjectSet]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const examInfo = {
      examType,
      examNumber,
      classNumber: selectedClass,
      subject: selectedSubject,
      totalMark,
      teacherId: user._id, // Assuming user._id is the teacher's ID
      teacherName: user.name, // Assuming user.name is the teacher's name
    };

    console.log("Created Exam Info:", examInfo);
    document.getElementById("my_modal_3").close();
    AxiosSecure.post("/api/exam/createNewExam", examInfo).then((res) => {
      console.log("Exam Created:", res.data);
      // reload the page or update state to reflect the new exam
      window.location.reload(); // Reload the page to see the new exam
    });
    // Optional: Send to backend
    // AxiosSecure.post('/api/create-exam', examInfo).then((res) => {
    //   console.log("Exam Created:", res.data);
    // });
  };

  return (
    <div>
      <div className="btn btn-active">
        <button
          onClick={() => document.getElementById("my_modal_3").showModal()}
        >
          Create Exam
        </button>
      </div>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleSubmit} method="dialog">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label">Exam Type</label>
                <select
                  className="select select-bordered w-full"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                >
                  <option disabled value="">
                    Pick Exam Type
                  </option>
                  <option value="Class Test">Class Test</option>
                  <option value="Half Yearly">Half Yearly</option>
                  <option value="Final Exam">Final Exam</option>
                </select>
              </div>
              <div>
                <label className="label">Exam No: </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={examNumber}
                  onChange={(e) => setExamNumber(e.target.value)}
                  placeholder="Exam Number"
                />
              </div>

              <div>
                <label className="label">Class List</label>
                <select
                  value={selectedClass}
                  onChange={handleClassChange}
                  className="select select-bordered w-full"
                >
                  <option disabled value="">
                    Pick a Class
                  </option>
                  {teacherClasses.map((cls) => (
                    <option key={cls._id} value={cls.classNumber}>
                      Class {cls.classNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid mt-5 grid-cols-2 gap-5">
              <div>
                <label className="label">Subject List</label>
                <select
                  className="select select-bordered w-full"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option disabled value="">
                    Pick a Subject
                  </option>
                  {subjects.map((subj, idx) => (
                    <option key={idx} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Total Mark</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={totalMark}
                  onChange={(e) => setTotalMark(e.target.value)}
                  placeholder="Total Mark"
                />
              </div>
            </div>

            <button type="submit" className="btn mt-5">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-error mt-5"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
              Close
            </button>
          </form>
        </div>
      </dialog>
      <div>
        <h1 className="text-2xl font-bold mb-4">Exam Management</h1>
        <CurrentExam></CurrentExam>
      </div>
      <div>
        <ExamHistroy></ExamHistroy>
      </div>
    </div>
  );
};

export default ExamHome;
