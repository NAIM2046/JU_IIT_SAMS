import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const ExamRoutineCreate = () => {
  const { selectedCommittee } = useOutletContext();
  const [courselist, setCourseList] = useState([]);
  const [examName, setExamName] = useState("");
  const [routines, setRoutines] = useState([]);
  const [existingRoutine, setExistingRoutine] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const axiosPrivate = useAxiosPrivate();
  console.log(selectedCommittee);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCommittee?.classId) return;

      setIsLoading(true);
      try {
        const [courseResult, routineResult] = await Promise.all([
          axiosPrivate.get(
            `/api/getsubjectbyclass/${selectedCommittee.classId}`
          ),
          axiosPrivate.get(
            `/api/exam_routine/get/${selectedCommittee.classId}/${selectedCommittee.batchNumber}`
          ),
        ]);

        setCourseList(courseResult.data?.subjects || []);
        if (routineResult.data) {
          setExistingRoutine(routineResult.data || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrorMessage("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCommittee?.classId, selectedCommittee?.batchNumber]);

  const handleAddRoutine = () => {
    setRoutines([
      ...routines,
      {
        courseCode: "",
        courseTitle: "",
        examDates: [""],
        time: { start: "", end: "" },
        type: "",
      },
    ]);
  };

  const handleRemoveRoutine = (index) => {
    const updated = routines.filter((_, i) => i !== index);
    setRoutines(updated);
  };

  const handleRoutineChange = (
    routineIndex,
    field,
    value,
    dateIndex = null
  ) => {
    const updated = [...routines];
    if (field === "courseCode") {
      const subject = courselist.find((s) => s.code === value);
      if (subject) {
        updated[routineIndex].courseCode = subject.code;
        updated[routineIndex].courseTitle = subject.title;
        updated[routineIndex].type = subject.type;
      }
    } else if (field === "examDates" && dateIndex !== null) {
      updated[routineIndex].examDates[dateIndex] = value;
    } else if (field === "start") {
      updated[routineIndex].time.start = value;
    } else if (field === "end") {
      updated[routineIndex].time.end = value;
    } else {
      updated[routineIndex][field] = value;
    }
    setRoutines(updated);
  };

  const handleAddExamDate = (routineIndex) => {
    const updated = [...routines];
    updated[routineIndex].examDates.push("");
    setRoutines(updated);
  };

  const handleRemoveExamDate = (routineIndex, dateIndex) => {
    const updated = [...routines];
    updated[routineIndex].examDates.splice(dateIndex, 1);
    setRoutines(updated);
  };

  const handleSubmit = async () => {
    if (!examName.trim()) {
      setErrorMessage("Please enter an exam name");
      return;
    }

    if (routines.length === 0) {
      setErrorMessage("Please add at least one subject to the routine");
      return;
    }

    // Validate all routines
    for (let i = 0; i < routines.length; i++) {
      const routine = routines[i];
      if (!routine.courseCode) {
        setErrorMessage(`Please select a subject for routine #${i + 1}`);
        return;
      }
      if (routine.examDates.some((date) => !date)) {
        setErrorMessage(
          `Please fill all exam dates for ${routine.courseTitle}`
        );
        return;
      }
      if (!routine.time.start || !routine.time.end) {
        setErrorMessage(
          `Please set both start and end time for ${routine.courseTitle}`
        );
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      classId: selectedCommittee?.classId,
      batchNumber: selectedCommittee?.batchNumber,
      examName,
      routines,
    };

    try {
      const res = await axiosPrivate.post(
        "/api/exam_routine/add_update",
        payload
      );
      setSuccessMessage("Routine saved successfully!");
      setExistingRoutine(payload);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving routine:", err);
      setErrorMessage("Failed to save routine. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoutine = (routine) => {
    setExamName(routine.examName || "");
    setRoutines(routine.routines || []);
    setErrorMessage("");
    setSuccessMessage("");

    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearForm = () => {
    setExamName("");
    setRoutines([]);
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (isLoading && routines.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              Create Exam Routine
            </h1>
            <p className="text-blue-100 mt-1">
              {selectedCommittee?.classId
                ? `Class: ${selectedCommittee.classId} - Batch: ${selectedCommittee.batchNumber}`
                : "Please select a class"}
            </p>
          </div>

          {/* Messages */}
          <div className="px-6 py-4">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
            )}
          </div>

          {/* Main Form */}
          <div className="px-6 py-4 space-y-6">
            {/* Exam Name Input */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Semester Final, Midterm, Quiz Test"
              />
            </div>

            {/* Routines List */}
            <div className="space-y-4">
              {routines.map((routine, routineIndex) => (
                <div
                  key={routineIndex}
                  className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">
                      Subject #{routineIndex + 1}
                    </h3>
                    <button
                      onClick={() => handleRemoveRoutine(routineIndex)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                      title="Remove subject"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Subject Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={routine.courseCode}
                        onChange={(e) =>
                          handleRoutineChange(
                            routineIndex,
                            "courseCode",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">-- Choose a Subject --</option>
                        {courselist.map((subj) => (
                          <option key={subj.code} value={subj.code}>
                            {subj.title} ({subj.code}) - {subj.type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Exam Dates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exam Dates <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {routine.examDates.map((date, dateIndex) => (
                          <div
                            key={dateIndex}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="date"
                              value={date || ""}
                              onChange={(e) =>
                                handleRoutineChange(
                                  routineIndex,
                                  "examDates",
                                  e.target.value,
                                  dateIndex
                                )
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                            {routine.examDates.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExamDate(routineIndex, dateIndex)
                                }
                                className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                title="Remove date"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddExamDate(routineIndex)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Add Another Date
                        </button>
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={routine.time.start}
                          onChange={(e) =>
                            handleRoutineChange(
                              routineIndex,
                              "start",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={routine.time.end}
                          onChange={(e) =>
                            handleRoutineChange(
                              routineIndex,
                              "end",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Auto-filled Info */}
                    {routine.courseTitle && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">
                          <strong>Selected:</strong> {routine.courseTitle} (
                          {routine.courseCode}) - {routine.type}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleAddRoutine}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Subject
              </button>

              <button
                onClick={handleSubmit}
                disabled={isLoading || routines.length === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Save Routine
                  </>
                )}
              </button>

              <button
                onClick={handleClearForm}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Clear Form
              </button>
            </div>
          </div>
        </div>

        {/* Existing Routines Section */}
        {existingRoutine.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                Existing Routines
              </h2>
              <p className="text-gray-200 text-sm">
                Click Edit to modify an existing routine
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {existingRoutine.map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {r.examName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Class: {r.classId} • Batch: {r.batchNumber} • Subjects:{" "}
                        {r.routines?.length || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEditRoutine(r)}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamRoutineCreate;
