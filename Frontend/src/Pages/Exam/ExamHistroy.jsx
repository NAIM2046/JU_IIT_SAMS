import { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

const ExamHistroy = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const [examhistroy, setExamhistroy] = useState([]);
  useEffect(() => {
    AxiosSecure.get(`/api/exam/allExams/${user._id}`).then((res) => {
      console.log(res.data);
      setExamhistroy(res.data);
    });
  }, []);
  const handleUpdate = (examId) => {
    const teacherId = user._id;

    AxiosSecure.post("/api/exam/updateExam", { examId, teacherId }).then(
      (res) => {
        console.log(res.data);
        window.location.reload();
      }
    );
  };
  return (
    <div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Your Exam History</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Tittle</th>
                <th className="border px-4 py-2">subject</th>
                <th className="border px-4 py-2">class</th>
                <th className="border px-4 py-2">Actions</th>
                <th className="border px-4 py-2">Total mark</th>
              </tr>
            </thead>
            <tbody>
              {examhistroy.length > 0 ? (
                examhistroy?.map((exam) => (
                  <tr key={exam._id}>
                    <td className="border px-4 py-2">
                      {exam.examType}-{exam.examNumber}
                    </td>
                    <td className="border px-4 py-2">{exam.subject}</td>
                    <td className="border px-4 py-2">{exam.class}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleUpdate(exam._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Update
                      </button>
                    </td>
                    <td className="border px-4 py-2"> {exam.totalMark}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No exam history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamHistroy;
