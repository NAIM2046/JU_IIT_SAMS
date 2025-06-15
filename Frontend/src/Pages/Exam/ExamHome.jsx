import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import CurrentExam from "./CurrentExam";
import ExamHistroy from "./ExamHistroy";
import { FaChalkboardTeacher, FaPlus, FaTimes } from "react-icons/fa";
import { FiBook, FiAward, FiCalendar, FiHash } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";

const ExamHome = () => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [totalMark, setTotalMark] = useState("");
  const [examNumber, setExamNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await AxiosSecure.get("/api/getallschedule");
        setTeacherClasses(res.data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };
    fetchClasses();
  }, [AxiosSecure]);

  const handleClassChange = (e) => {
    const classNumber = e.target.value;
    setSelectedClass(classNumber);
    setSelectedSubject("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const examInfo = {
        examType,
        examNumber,
        classNumber: selectedClass,
        subject: selectedSubject,
        totalMark,
        teacherId: user._id,
        teacherName: user.name,
      };

      await AxiosSecure.post("/api/exam/createNewExam", examInfo);
      setModalOpen(false);
      // You might want to add a toast notification here for success
      window.location.reload();
    } catch (error) {
      console.error("Failed to create exam:", error);
      // You might want to add a toast notification here for error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <FaChalkboardTeacher className="mr-3 text-blue-600" />
            Exam Management
          </h1>
          <p className="text-gray-600">
            Create and manage exams for your classes
          </p>
        </div>

        {/* Create Exam Button */}
        <div className="mb-8">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
          >
            <FaPlus className="mr-2" /> Create New Exam
          </button>
        </div>

        {/* Create Exam Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Create New Exam
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Exam Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center">
                          <FiAward className="mr-2" /> Exam Type
                        </div>
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select Exam Type
                        </option>
                        <option value="Class Test">Class Test</option>
                        <option value="Half Yearly">Half Yearly</option>
                        <option value="Final Exam">Final Exam</option>
                      </select>
                    </div>

                    {/* Exam Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center">
                          <FiHash className="mr-2" /> Exam Number
                        </div>
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={examNumber}
                        onChange={(e) => setExamNumber(e.target.value)}
                        placeholder="Exam Number"
                        required
                        min="1"
                      />
                    </div>

                    {/* Class List */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center">
                          <FaChalkboardTeacher className="mr-2" /> Class
                        </div>
                      </label>
                      <select
                        value={selectedClass}
                        onChange={handleClassChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="" disabled>
                          Select Class
                        </option>
                        {teacherClasses.map((cls) => (
                          <option key={cls._id} value={cls.classNumber}>
                            Class {cls.classNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject List */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center">
                          <FiBook className="mr-2" /> Subject
                        </div>
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        required
                        disabled={!selectedClass}
                      >
                        <option value="" disabled>
                          Select Subject
                        </option>
                        {subjects.map((subj, idx) => (
                          <option key={idx} value={subj}>
                            {subj}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Total Mark */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2" /> Total Marks
                        </div>
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={totalMark}
                        onChange={(e) => setTotalMark(e.target.value)}
                        placeholder="Total Marks"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <ImSpinner8 className="animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Exam"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Current Exams Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Current Exams
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <CurrentExam />
          </div>
        </div>

        {/* Exam History Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Exam History
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ExamHistroy />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHome;
