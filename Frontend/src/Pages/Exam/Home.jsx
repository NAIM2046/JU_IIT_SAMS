import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

export const Home = () => {
  const { classlist } = useStroge();
  const teacherClasses = [];
  const teacherSubject = [];
  const [selectedClass, setSelectedClass] = useState("6");
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [allSchedules, setAllSchedules] = useState([]);
  const [currentExamArray, setCurrentExamArray] = useState([]);
  const [currentExamTotalMark, setCurrentExamTotalMark] = useState(1);
  const [currentRoll, setCurrentRoll] = useState(0);
  const [allExams, setAllExams] = useState([]);
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();

  const [currentExamId, setCurrentExamId] = useState(0);
  const [{examType, subject, class:className, totalMark}, setCurrentExamInfo] = useState([]);
  console.log(user);

  useEffect(()=>{
    AxiosSecure.post("/api/exam/currentExam", {examId:1})
      .then((res) => {
        console.log("currentExam", res.data);
        setCurrentExamArray(res.data.currentExamInfo.studentsInfo);
        setCurrentExamTotalMark(res.data.currentExamInfo.totalMark);
        setCurrentExamId(res.data.currentExamId);
        setCurrentExamInfo(res.data.currentExamInfo);
      })
  }, []);


  useEffect(()=>{
      AxiosSecure.post('api/exam/currentExam', {examId:currentExamId})
        .then((res) => {
          setCurrentExamArray(res.data.currentExamInfo.studentsInfo);
          setCurrentExamTotalMark(res.data.currentExamInfo.totalMark);
          setCurrentExamId(res.data.currentExamId);
          setCurrentExamInfo(res.data.currentExamInfo);
          setCurrentRoll(0);
        })
  }, [currentExamId, currentRoll]);


  useEffect(()=>{
    AxiosSecure.get('/api/exam/allExams')
      .then((res) => {
        console.log("all exams", res.data);
        setAllExams(res.data);
      })
  }, [currentExamId]);


  useEffect(() => {
    // Simulated API data
    AxiosSecure.get("/api/getallschedule")
      .then((res) => {
        console.log(res.data);
        setAllSchedules(res.data);
      })
      .catch((error) => {
        console.error("Error fetching schedules:", error);
      });
  }, []);


  allSchedules.map((item) => {
    const days = Object.keys(item.schedule);
    const object1 = item.schedule;
    days.forEach((item) => {
      const object2 = Object.keys(object1[item]);
      const object3 = object1[item];
      object2.forEach((item) => {
        if (object3[item].teacher === user.name) {
          teacherClasses.push(object3[item].class);
          teacherSubject.push(object3[item].subject);
        }
      });
    });
  });

  console.log([...new Set(teacherClasses)]);
  console.log([...new Set(teacherSubject)]);

  console.log(classlist);

  const handleSubmit = (e) => {
    e.preventDefault();
    document.getElementById("my_modal_3").close();
    const form = e.target;
    const examType = form.examType.value;
    const totalMark = form.totalMark.value;
    console.log({ examType, totalMark, selectedClass, selectedSubject });

    AxiosSecure.get(
      `/api/auth/getStudentByClassandSection/${selectedClass}`
    ).then((result) => {
      setAllStudents(result.data);
    });

    const examInfo = {
      examType,
      class: selectedClass,
      subject: selectedSubject,
      totalMark: totalMark,
      teacherId: user.id
    }

    AxiosSecure.post(`/api/exam/createNewExam`, examInfo).then(res => {
      console.log(res.data);
      setCurrentExamId(res.data.examHistory.insertedId);
    });
  };

  const handleMarksAddition = (roll) => {
    const mark = document.getElementById(`${roll}`).value;
    console.log(currentExamId);
    const obj = {
      examId: currentExamId, 
      roll: roll, 
      marks: mark
    }
    AxiosSecure.post('/api/exam/updateOneStudentMark', obj)
      .then((res) => {
        console.log("marks updated successfully", res.data);
        setCurrentRoll(roll);
      })
  }

  const handleCurrentExamId = (id) =>{
    console.log(id);
    setCurrentExamId(id);
  }

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => document.getElementById("my_modal_3").showModal()}
      >
        Create New Exam
      </button>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label">Exam Type</label>
                <input
                  type="text"
                  className="input"
                  name="examType"
                  placeholder="Exam Type"
                />
              </div>
              <div>
                <label className="label">Class List</label>
                <select
                  defaultValue="Select A Class"
                  // value={selectedClass}
                  onChange={(e) => {
                    const currentClass = e.target.value;
                    console.log(currentClass);
                    setSelectedClass(currentClass);
                  }}
                  className="select"
                >
                  <option disabled={true}>Pick a Class</option>
                  {[...new Set(teacherClasses)].map((cls, indx) => (
                    <option className="text-xl w-full" key={indx} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid mt-5 grid-cols-2 gap-5">
              <div>
                <label className="label">Subject List</label>
                <select
                  defaultValue="Select A Subject"
                  // value={selectedSubject}
                  onChange={(e) => {
                    const currentSubject = e.target.value;
                    console.log(currentSubject);
                    setSelectedSubject(currentSubject);
                  }}
                  className="select"
                >
                  <option disabled={true}>Pick a Subject</option>
                  {[...new Set(teacherSubject)].map((cls, indx) => (
                    <option className="text-xl w-full" key={indx} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Total Mark</label>
                <input
                  type="text"
                  className="input"
                  name="totalMark"
                  placeholder="Total Mark"
                />
              </div>
            </div>
            <button className="btn mt-5">Submit</button>
          </form>
        </div>
      </dialog>


      {/* current Exam Section */}
      {currentExamArray.length !=0 && (
        <div>
          <h1 className="text-2xl font-bold my-5">Currently Working Exam: </h1>
          <div>
            <div className="text-sm font-bold flex gap-5">
              <h1>Exam Name: {examType}</h1>
              <h1>Subject: {subject}</h1>
            </div>
            <div className="text-sm font-bold flex gap-5">
              <h1>Class: {className}</h1>
              <h1>TotalMark: {totalMark}</h1>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead className="bg-amber-500">
                <tr>
                  <th>Name</th>
                  <th>Roll</th>
                  <th className="text-center">Marks</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                  {
                    currentExamArray.map((item, indx) => 
                      <tr key={indx}>
                        <td>{item.Name}</td>
                        <td>{item.roll}</td>
                        <td className="flex gap-2 justify-center items-center">
                          <input type="text" defaultValue={item.marks} id={`${item.roll}`} className="input" placeholder="Marks"/>
                          <button className="btn btn-neutral" onClick={() => handleMarksAddition(item.roll)}>Update</button>
                        </td>
                        <td>{(item.marks/parseInt(currentExamTotalMark))*100} %</td>
                      </tr>
                    )
                  }
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* showing all exams */}
      {
        <div>
          <h1 className="text-2xl font-bold my-5">Previous Exams:  </h1>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead className="bg-amber-500">
                <tr>
                  <th>Exam Name</th>
                  <th>Class Name</th>
                  <th>Subject</th>
                  <th>Total Mark</th>
                </tr>
              </thead>
              <tbody>
                  {
                    allExams.map((item, indx) => 
                      <tr key={indx} onDoubleClick={() => {
                        setCurrentExamArray(item.studentsInfo);
                        setCurrentExamTotalMark(item.totalMark);
                        console.log("doubled clicked", item);
                        setCurrentExamId(item._id);
                        setCurrentExamInfo(item);
                      }}>
                        <td>{item.examType}</td>
                        <td>{item.class}</td>
                        <td>{item.subject}</td>
                        <td>{item.totalMark}</td>
                      </tr>
                    )
                  }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  );
};
