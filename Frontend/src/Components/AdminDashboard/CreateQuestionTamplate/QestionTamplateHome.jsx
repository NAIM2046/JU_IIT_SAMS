import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import {
  FaTrash,
  FaPlus,
  FaSave,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QuestionTemplateHome = () => {
  const AxiosSecure = useAxiosPrivate();
  const [class_subject, setClass_subject] = useState([]);
  const [selectClass, setSelectClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectSubject, setSelectSubject] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [holdQuestionFullMark, setHoldQuestionFullMark] = useState("");
  const [questions, setQuestions] = useState([
    {
      qNo: "",
      fullMark: "",
      obtainMark: "",
      subQuestions: [{ number: "", fullMark: "", obtainMark: "" }],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await AxiosSecure.get("api/getclassandsub");
        const filterdata = res.data.filter((cls) => cls?.batchNumber !== "");
        setClass_subject(filterdata);
      } catch (err) {
        console.error("Failed to fetch class & subject data:", err);
        toast.error("Failed to load class and subject data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [AxiosSecure]);

  const handleSelectChange = (e) => {
    const selectClassName = e.target.value;
    setSelectClass(selectClassName);
    setSelectSubject("");
    const selectedData = class_subject.find(
      (item) => item.class === selectClassName
    );
    if (selectedData) {
      setSubjects(selectedData.subjects || []);
      setBatchNumber(selectedData.batchNumber || "");
    } else {
      setSubjects([]);
      setBatchNumber("");
    }
  };

  const handleSubjectChange = (e) => {
    setSelectSubject(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectClass && selectSubject && batchNumber) {
        setIsLoading(true);
        try {
          const res = await AxiosSecure.get(
            `/api/finalmark/get_question_template/${selectClass}/${selectSubject}/${batchNumber}`
          );

          const data = res.data;
          //console.log(data);
          setHoldQuestionFullMark(String(data?.holdquestionfullmark || ""));
          setQuestions(data?.questionMark || []);

          // Expand all questions when loading template
          if (data?.questionMark?.length) {
            setExpandedQuestions(data.questionMark.map((_, i) => i));
          }
        } catch (error) {
          console.error("Error fetching question template:", error);
          toast.error("Failed to load question template");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [selectSubject, selectClass, batchNumber, AxiosSecure]);

  const validateQuestionMarks = () => {
    if (!holdQuestionFullMark) {
      alert("Please enter total full mark");
      return false;
    }

    let totalQuestionFullMark = 0;

    for (const question of questions) {
      if (!question.qNo) {
        alert(
          `Please enter question number for question ${questions.indexOf(question) + 1}`
        );
        return false;
      }

      const qFullMark = Number(question.fullMark);
      if (isNaN(qFullMark)) {
        alert(`Please enter valid full mark for question ${question.qNo}`);
        return false;
      }

      totalQuestionFullMark += qFullMark;

      const subTotal = question.subQuestions.reduce(
        (sum, subQ) => sum + Number(subQ.fullMark),
        0
      );

      if (subTotal !== qFullMark) {
        alert(
          `Sub-question total (${subTotal}) does not match full mark (${qFullMark}) for Question ${question.qNo}`
        );
        return false;
      }
    }

    if (totalQuestionFullMark < Number(holdQuestionFullMark)) {
      alert(
        `Total of all question full marks (${totalQuestionFullMark}) does not match overall full mark (${holdQuestionFullMark})`
      );
      return false;
    }

    return true;
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubQuestionChange = (qIndex, subIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].subQuestions[subIndex][field] = value;
    setQuestions(updated);
  };

  const addSubQuestion = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].subQuestions.push({
      number: "",
      fullMark: "",
      obtainMark: "",
    });
    setQuestions(updated);
  };

  const deleteSubQuestion = (qIndex, subIndex) => {
    const updated = [...questions];
    updated[qIndex].subQuestions.splice(subIndex, 1);
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        qNo: "",
        fullMark: "",
        obtainMark: "",
        subQuestions: [{ number: "", fullMark: "", obtainMark: "" }],
      },
    ]);
    // Expand the newly added question
    setExpandedQuestions([...expandedQuestions, questions.length]);
  };

  const deleteQuestion = (index) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    // Remove from expanded questions if needed
    setExpandedQuestions(expandedQuestions.filter((i) => i !== index));
  };

  const toggleQuestionExpand = (index) => {
    if (expandedQuestions.includes(index)) {
      setExpandedQuestions(expandedQuestions.filter((i) => i !== index));
    } else {
      setExpandedQuestions([...expandedQuestions, index]);
    }
  };

  const handleSubmit = async () => {
    if (!validateQuestionMarks()) {
      return;
    }

    const payload = {
      classId: selectClass,
      subject: selectSubject,
      batchNumber,
      holdquestionfullmark: Number(holdQuestionFullMark),
      holdquestionobtionmark: "",
      questionMark: questions,
    };

    setIsSaving(true);
    try {
      await AxiosSecure.post(
        "api/finalmark/add_update_Question_Tamplate",
        payload
      );
      alert("Question template saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving template: " + (error?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Question Template Management
      </h1>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <FaSpinner className="animate-spin text-blue-500 text-3xl mb-3" />
            <p className="text-gray-700">Loading data...</p>
          </div>
        </div>
      )}

      {/* Class & Subject Dropdowns */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Template Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Semester:
            </label>
            <select
              value={selectClass}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            >
              <option value="">-- Select Semester --</option>
              {class_subject.map((item) => (
                <option key={item._id} value={item.class}>
                  {item.class} (Batch {item.batchNumber})
                </option>
              ))}
            </select>
          </div>

          {subjects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Subject:
              </label>
              <select
                value={selectSubject}
                onChange={handleSubjectChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((subj, index) => (
                  <option key={index} value={subj.code}>
                    {subj.title} ({subj.code}) — {subj.type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Total Full Mark */}
          {selectSubject && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Full Mark:
              </label>
              <input
                type="text"
                placeholder="e.g., 100"
                value={holdQuestionFullMark}
                onChange={(e) => setHoldQuestionFullMark(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4 mb-6">
        {questions.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No questions added yet. Click "Add Question" to get started.
            </p>
          </div>
        )}

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 transition-all duration-200"
          >
            <div
              className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => toggleQuestionExpand(qIndex)}
            >
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-800">
                  Question {qIndex + 1} {q.qNo && `(Q. ${q.qNo})`}
                </h3>
                {q.fullMark && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {q.fullMark} marks
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQuestion(qIndex);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center p-1 rounded hover:bg-red-50"
                  title="Delete question"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
                {expandedQuestions.includes(qIndex) ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </div>
            </div>

            {expandedQuestions.includes(qIndex) && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Number
                    </label>
                    <input
                      type="text"
                      placeholder="Q. No"
                      value={q.qNo}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "qNo", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Mark
                    </label>
                    <input
                      type="text"
                      placeholder="Full Mark"
                      value={q.fullMark}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "fullMark", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Sub Questions */}
                <div className="ml-2 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Sub-questions:
                    </h4>
                    <button
                      onClick={() => addSubQuestion(qIndex)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                    >
                      <FaPlus className="w-3 h-3 mr-1" />
                      Add Sub-question
                    </button>
                  </div>

                  {q.subQuestions.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      No sub-questions added
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {q.subQuestions.map((sub, subIndex) => (
                        <div
                          key={subIndex}
                          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-gray-50 p-3 rounded"
                        >
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Number
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., a, b"
                              value={sub.number}
                              onChange={(e) =>
                                handleSubQuestionChange(
                                  qIndex,
                                  subIndex,
                                  "number",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Full Mark
                            </label>
                            <input
                              type="text"
                              placeholder="Full Mark"
                              value={sub.fullMark}
                              onChange={(e) =>
                                handleSubQuestionChange(
                                  qIndex,
                                  subIndex,
                                  "fullMark",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <button
                              onClick={() =>
                                deleteSubQuestion(qIndex, subIndex)
                              }
                              className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center justify-center text-sm"
                              title="Remove sub-question"
                            >
                              <FaTrash className="w-3 h-3 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center disabled:bg-green-400"
          disabled={!selectSubject || isLoading}
        >
          <FaPlus className="w-3 h-3 mr-2" />
          Add Question
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center disabled:bg-blue-400"
          disabled={
            !selectSubject || isLoading || isSaving || questions.length === 0
          }
        >
          {isSaving ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="w-3 h-3 mr-2" />
              Save Template
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuestionTemplateHome;
