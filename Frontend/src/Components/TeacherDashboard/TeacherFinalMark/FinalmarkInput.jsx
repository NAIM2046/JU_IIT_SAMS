import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaSave,
  FaSpinner,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const FinalmarkInput = () => {
  const { user } = useStroge();
  const AxiosSecure = useAxiosPrivate();
  const location = useLocation();
  const obj = location.state;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStudents, setExpandedStudents] = useState({});
  const storkey = `${obj.classId}-${obj.subject.trim()}-${obj.batchNumber}-${obj.examiner}`;

  useEffect(() => {
    const localData = localStorage.getItem(storkey);
    if (localData) {
      const parsedData = JSON.parse(localData);
      setStudents(parsedData);
      // Restore expansion state
      const initialExpanded = {};
      parsedData.forEach((student) => {
        initialExpanded[student._id] = false;
      });
      setExpandedStudents(initialExpanded);
      setLoading(false);
      return; // Skip API fetch if local data exists
    }

    const fetchData = async () => {
      try {
        const result = await AxiosSecure.get(
          `api/finalmark/get_students_mark/${obj.classId}/${obj.subject}/${obj.batchNumber}/${obj.examiner}`
        );
        console.log(result.data);
        setStudents(result.data);
        const initialExpanded = {};
        result.data.forEach((student) => {
          initialExpanded[student._id] = false;
        });
        setExpandedStudents(initialExpanded);
      } catch (error) {
        console.error("Error fetching student marks:", error);
        toast.error("Failed to load student marks");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    AxiosSecure,
    obj.classId,
    obj.subject,
    obj.batchNumber,
    obj.examiner,
    storkey,
  ]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter((student) =>
      student.class_roll.toString().includes(searchTerm)
    );
  }, [students, searchTerm]);

  const toggleStudentExpansion = (studentId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const validateMark = (value, maxMark) => {
    if (value === "") return { valid: true };

    if (!/^\d*\.?\d*$/.test(value)) {
      return { valid: false, message: "Please enter a valid number" };
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      return { valid: false, message: "Please enter a valid number" };
    }

    if (num < 0) {
      return { valid: false, message: "Mark cannot be negative" };
    }

    if (num > maxMark) {
      return { valid: false, message: `Mark cannot exceed ${maxMark}` };
    }

    return { valid: true };
  };

  const recalcMarks = (student) => {
    let totalObtained = 0;
    const newErrors = { ...errors };

    student.questionMark.forEach((question, qIndex) => {
      if (question.subQuestions && question.subQuestions.length > 0) {
        let sumSub = 0;
        question.subQuestions.forEach((subQ, subIndex) => {
          const validation = validateMark(subQ.obtainMark, subQ.fullMark);
          const errorKey = `${student._id}-${qIndex}-${subIndex}`;

          if (!validation.valid) {
            newErrors[errorKey] = validation.message;
          } else {
            delete newErrors[errorKey];
          }

          const mark = parseFloat(subQ.obtainMark);
          if (!isNaN(mark)) sumSub += mark;
        });
        question.obtainMark = sumSub.toString();
      } else {
        const errorKey = `${student._id}-${qIndex}`;
        const validation = validateMark(question.obtainMark, question.fullMark);

        if (!validation.valid) {
          newErrors[errorKey] = validation.message;
        } else {
          delete newErrors[errorKey];
        }
      }

      const qMark = parseFloat(question.obtainMark);
      if (!isNaN(qMark)) totalObtained += qMark;
    });

    setErrors(newErrors);
    student.holdquestionobtionmark = totalObtained.toString();
  };

  const handleMarkChange = (
    studentId,
    questionIndex,
    subQuestionIndex,
    value
  ) => {
    if (value !== "" && !/^(\d+\.?\d*|\.\d+)$/.test(value)) return;

    setStudents((prev) => {
      const newStudents = prev.map((student) => {
        if (student._id === studentId) {
          const updatedStudent = { ...student };

          if (subQuestionIndex !== null) {
            updatedStudent.questionMark[questionIndex].subQuestions[
              subQuestionIndex
            ].obtainMark = value;
          } else {
            updatedStudent.questionMark[questionIndex].obtainMark = value;
          }

          recalcMarks(updatedStudent);
          return updatedStudent;
        }
        return student;
      });

      // ✅ Update localStorage with the latest full list
      localStorage.setItem(storkey, JSON.stringify(newStudents));

      return newStudents;
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const res = await AxiosSecure.post(
        "api/finalmark/updata_students_marks",
        {
          students,
          teacherId: user._id,
          submitInfo: {
            classId: obj.classId,
            subject: obj.subject,
            batchNumber: obj.batchNumber,
            examinerType: obj.examiner,
          },
        }
      );
      console.log(res.data);
      toast.success("Marks saved successfully!");
      localStorage.removeItem(storkey);
    } catch (error) {
      console.error("Error saving marks:", error);
      toast.error("Failed to save marks");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Input Marks for {obj.subject}
            </h1>
            <p className="text-gray-600">
              Batch: {obj.batchNumber} | Examiner: {obj.examiner}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by roll number..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-blue-800 font-medium">
            Instructions: Enter marks for each question/sub-question. The system
            will automatically calculate totals.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">
              No students found matching your search
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleStudentExpansion(student._id)}
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {student.studentName}
                  </h2>
                  <p className="text-gray-600">Roll: {student.class_roll}</p>
                  {student.isRetake && (
                    <span className="text-red-500 text-sm">(Retake)</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 px-3 py-1 rounded-md">
                    <p className="font-bold text-green-800">
                      Total: {student.holdquestionobtionmark || "0"} /{" "}
                      {student.holdquestionfullmark}
                    </p>
                  </div>
                  {expandedStudents[student._id] ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
              </div>

              {expandedStudents[student._id] && (
                <div className="border-t p-4">
                  <div className="space-y-4">
                    {student.questionMark.map((question, qIndex) => (
                      <div
                        key={qIndex}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-800">
                            Question {question.qNo}
                            <span className="ml-2 text-gray-600">
                              (Obtained: {question.obtainMark || "0"} / Full:{" "}
                              {question.fullMark})
                            </span>
                          </h3>
                        </div>

                        {question.subQuestions &&
                        question.subQuestions.length > 0 ? (
                          <div className="ml-4 space-y-3">
                            {question.subQuestions.map((subQ, subIndex) => {
                              const errorKey = `${student._id}-${qIndex}-${subIndex}`;
                              return (
                                <div
                                  key={subIndex}
                                  className="flex flex-wrap items-center gap-3"
                                >
                                  <label className="w-48 md:w-64 text-gray-700">
                                    Sub-question {subQ.number}
                                    <span className="text-gray-500 ml-1">
                                      (Max: {subQ.fullMark})
                                    </span>
                                  </label>
                                  <input
                                    type="text"
                                    value={subQ.obtainMark || ""}
                                    onChange={(e) =>
                                      handleMarkChange(
                                        student._id,
                                        qIndex,
                                        subIndex,
                                        e.target.value
                                      )
                                    }
                                    className={`border rounded px-3 py-1 w-24 ${errors[errorKey] ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="0"
                                  />
                                  {errors[errorKey] && (
                                    <span className="text-red-500 text-sm">
                                      {errors[errorKey]}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <label className="text-gray-700">Mark:</label>
                            <input
                              type="text"
                              value={question.obtainMark || ""}
                              onChange={(e) =>
                                handleMarkChange(
                                  student._id,
                                  qIndex,
                                  null,
                                  e.target.value
                                )
                              }
                              className={`border rounded px-3 py-1 w-24 ${errors[`${student._id}-${qIndex}`] ? "border-red-500" : "border-gray-300"}`}
                              placeholder="0"
                            />
                            {errors[`${student._id}-${qIndex}`] && (
                              <span className="text-red-500 text-sm">
                                {errors[`${student._id}-${qIndex}`]}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(errors).length > 0}
          className={`flex items-center px-6 py-3 rounded-full shadow-lg ${submitting || Object.keys(errors).length > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white font-medium transition-colors`}
        >
          {submitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              Save All Marks
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FinalmarkInput;
