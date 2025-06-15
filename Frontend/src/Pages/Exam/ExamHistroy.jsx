import { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import { FiBook, FiHome, FiRefreshCw, FiAward, FiHash } from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

const ExamHistroy = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchExamHistory = async () => {
      try {
        const res = await AxiosSecure.get(`/api/exam/allExams/${user._id}`);
        setExamHistory(res.data);
      } catch (error) {
        console.error("Error fetching exam history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamHistory();
  }, [user._id, AxiosSecure]);

  const handleUpdate = async (examId) => {
    setUpdating(examId);
    try {
      await AxiosSecure.post("/api/exam/updateExam", {
        examId,
        teacherId: user._id,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error updating exam:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ImSpinner8 className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FiAward className="mr-3 text-blue-600" />
          Exam History
        </h2>

        {examHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBook className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Exam History Found
            </h3>
            <p className="text-gray-500">
              You haven't conducted any exams yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiAward className="mr-2" /> Exam Title
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiBook className="mr-2" /> Subject
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiHome className="mr-2" /> Class
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiHash className="mr-2" /> Total Marks
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examHistory.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {exam.examType} - {exam.examNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {exam.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {exam.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {exam.totalMark}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdate(exam._id)}
                        disabled={updating === exam._id}
                        className={`text-blue-600 hover:text-blue-900 flex items-center justify-end ${
                          updating === exam._id
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {updating === exam._id ? (
                          <>
                            <ImSpinner8 className="animate-spin mr-1" />{" "}
                            Updating...
                          </>
                        ) : (
                          <>
                            <FiRefreshCw className="mr-1" /> Update
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamHistroy;
