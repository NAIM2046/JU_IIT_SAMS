import { useEffect, useState } from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const SemesterFinalResult = () => {
  const [finalResults, setFinalResults] = useState(null);
  const [classId, setClassId] = useState("");
  const [classIdList, setClassIdList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useStroge();
  const studentId = user?._id;

  const AxiosSecure = useAxiosPrivate();

  // Fetch class list once
  useEffect(() => {
    const fetchStudentClassId = async () => {
      try {
        const response = await AxiosSecure.get(`/api/getclassandsub`);
        setClassIdList(response.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchStudentClassId();
  }, [AxiosSecure]);

  // Fetch final results whenever classId changes
  useEffect(() => {
    if (!classId) {
      setFinalResults(null);
      return;
    }

    const fetchFinalResults = async () => {
      setLoading(true);
      try {
        const response = await AxiosSecure.get(
          `/api/final-results/getFinalResultsAstudent/${studentId}/${classId}`
        );
        setFinalResults(response.data);
      } catch (error) {
        console.error("Error fetching final results:", error);
        setFinalResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalResults();
  }, [studentId, classId, AxiosSecure]);

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-50 text-green-700',
      'A-': 'bg-green-50 text-green-600',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-50 text-blue-700',
      'B-': 'bg-blue-50 text-blue-600',
      'C+': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-yellow-50 text-yellow-700',
      'C-': 'bg-yellow-50 text-yellow-600',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    return gradeColors[grade] || 'bg-gray-100 text-gray-700';
  };

  const getCGPAStatus = (cgpa) => {
    if (cgpa >= 3.5) return 'text-green-600 font-bold';
    if (cgpa >= 2.5) return 'text-blue-600 font-bold';
    if (cgpa >= 2.0) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Semester Final Results
          </h1>
          <p className="text-gray-600">
            View your academic performance for each class
          </p>
        </div>

        {/* Class Selection Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            id="class-select"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
          >
            <option value="">Choose a class...</option>
            {classIdList?.map((classItem) => (
              <option key={classItem._id} value={classItem.class}>
                {classItem.class}
              </option>
            ))}
          </select>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your results...</p>
          </div>
        )}

        {finalResults && !loading && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Results for {classId}
              </h2>
            </div>

            {/* Subjects Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {finalResults.subjectList.map((subject, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subject.subjectCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {subject.subjectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CGPA Section */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">Cumulative GPA (CGPA)</span>
                <span className={`text-2xl ${getCGPAStatus(finalResults.cgpa)}`}>
                  {finalResults.cgpa}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {finalResults.cgpa >= 3.5 && "Excellent performance! Keep up the great work!"}
                {finalResults.cgpa >= 2.5 && finalResults.cgpa < 3.5 && "Good performance! There's room for improvement."}
                {finalResults.cgpa >= 2.0 && finalResults.cgpa < 2.5 && "Satisfactory performance. Consider seeking academic support."}
                {finalResults.cgpa < 2.0 && "Please consult with your academic advisor for guidance."}
              </div>
            </div>
          </div>
        )}

        {!classId && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Selected</h3>
            <p className="text-gray-600">
              Please select a class from the dropdown above to view your results.
            </p>
          </div>
        )}

        {!finalResults && !loading && classId && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-yellow-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-600">
              No results found for the selected class. Please check back later or contact administration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterFinalResult;