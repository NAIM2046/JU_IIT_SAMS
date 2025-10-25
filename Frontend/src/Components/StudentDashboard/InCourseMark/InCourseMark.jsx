import React, { useEffect, useState } from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import StudentMarkShow from "./StudentMarkShow";

const InCourseMark = () => {
  const AxiosSecure = useAxiosPrivate();
  const [examData, setExamData] = useState([]);
  const [classInfo, setClassInfo] = useState([]);
  const [loading, setLoading] = useState({
    classes: true,
    marks: false,
    initial: true,
  });
  const { user } = useStroge();
  const [selectedClass, setSelectedClass] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [error, setError] = useState("");

  // Fetch all classes + their subjects
  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        setLoading((prev) => ({ ...prev, classes: true, initial: true }));
        setError("");
        const response = await AxiosSecure.get("/api/getclassandsub");
        setClassInfo(response.data);

        // Auto-select user's class if available
        const userClass = response.data.find(
          (item) => item.class === user.class
        );
        if (userClass) {
          setSelectedClass(userClass.class);
          setSubjectList(userClass.subjects);
        }
      } catch (error) {
        console.error("Error fetching class info:", error);
        setError("Failed to load classes. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, classes: false, initial: false }));
      }
    };
    fetchClassInfo();
  }, [AxiosSecure, user.class]);

  // Handle class selection and update subjects
  const handleClassChange = (e) => {
    const selected = e.target.value;
    setSelectedClass(selected);
    const foundClass = classInfo.find((item) => item.class === selected);
    setSubjectList(foundClass ? foundClass.subjects : []);
    setSelectedSubject(""); // reset previous subject
    setExamData([]); // clear previous marks
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  // Fetch marks when subject is selected
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSubject) return;

      try {
        setLoading((prev) => ({ ...prev, marks: true }));
        setError("");
        const result = await AxiosSecure.post(
          "/api/incoursemark/getAstudent_Mark",
          {
            classId: selectedClass,
            subjectCode: selectedSubject,
            studentId: user._id,
          }
        );
        setExamData(result.data);
      } catch (error) {
        console.error("Error fetching marks:", error);
        setError("Failed to load marks. Please try again.");
        setExamData([]);
      } finally {
        setLoading((prev) => ({ ...prev, marks: false }));
      }
    };

    fetchData();
  }, [selectedSubject, selectedClass, user._id, AxiosSecure]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="w-1/2 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="w-1/2 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <span className="mr-2">🎓</span>
            In-Course Marks
          </h2>
          <p className="text-gray-600">
            View your academic performance across different subjects
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <div className="text-red-500 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading.initial ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Selection Cards */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📚 Select Semester
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={handleClassChange}
                      disabled={loading.classes}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Your Semester --</option>
                      {classInfo.map((item) => (
                        <option key={item.class} value={item.class}>
                          {item.class}
                        </option>
                      ))}
                    </select>
                    {loading.classes && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject Selection */}
                {selectedClass && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📖 Select Course
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSubject}
                        onChange={handleSubjectChange}
                        disabled={loading.marks}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Choose a Subject --</option>
                        {subjectList.map((sub) => (
                          <option key={sub.code} value={sub.code}>
                            {sub.title} ({sub.code})
                          </option>
                        ))}
                      </select>
                      {loading.marks && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Marks Display */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {loading.marks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading marks data...</p>
                </div>
              ) : selectedSubject && examData.length > 0 ? (
                <StudentMarkShow data={examData} />
              ) : selectedSubject ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-3">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Marks Available
                  </h3>
                  <p className="text-gray-500">
                    No marks found for {selectedSubject} in {selectedClass}.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-300 mb-4">
                    <svg
                      className="w-20 h-20 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">
                    Select a semester and Course
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Choose your class and subject from the dropdown menus above
                    to view your in-course marks.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InCourseMark;
