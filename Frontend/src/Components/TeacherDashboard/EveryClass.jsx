import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useAxiosPrivate from '../../TokenAdd/useAxiosPrivate';

const EveryClass = () => {
  // Sample data - in a real app, this would come from your Express API
  const location = useLocation();
  const scheduleData = location.state?.schedule || null;
  console.log(scheduleData);
  const [students, setStudents] = useState([]);

  const axiosSecure = useAxiosPrivate();
  useEffect(()=>{
    axiosSecure.get(`/api/auth/getStudentByClassandSection/${scheduleData.class}`).then(data => {
      setStudents(data.data);
    })
  }, [])

  // Handle attendance change
  const handleAttendanceChange = (studentId, isPresent) => {
    setStudents(students.map(student => 
      student._id === studentId 
        ? { ...student, attendance: isPresent ? 'P' : 'A' } 
        : student
    ));
  };

  // Handle assessment change
  const handleAssessmentChange = (studentId, assessment) => {
    setStudents(students.map(student => 
      student._id === studentId 
        ? { ...student, assessment } 
        : student
    ));
  };

  // Save to MongoDB via Express API
  const saveData = async () => {
    try {
      // const response = await fetch('/api/students', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(students)
      // });
      // const data = await response.json();
      console.log('Data to save:', students);
      alert('Data saved successfully (check console)');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  return (
    <div className="p-5 max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Student Attendance & Assessment</h2>
      
      <div className="overflow-x-auto mb-6 shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class Assessment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.roll}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        checked={student.attendance !== 'A'}
                        onChange={(e) => handleAttendanceChange(student._id, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">P</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        checked={student.attendance === 'A'}
                        onChange={(e) => handleAttendanceChange(student._id, !e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">A</span>
                    </label>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name={`assessment-${student._id}`}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        value="G"
                        checked={student.assessment === 'G' || !student.assessment}
                        onChange={() => handleAssessmentChange(student._id, 'G')}
                      />
                      <span className="ml-2 text-sm text-gray-700">G</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name={`assessment-${student._id}`}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        value="B"
                        checked={student.assessment === 'B'}
                        onChange={() => handleAssessmentChange(student._id, 'B')}
                      />
                      <span className="ml-2 text-sm text-gray-700">B</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name={`assessment-${student._id}`}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        value="E"
                        checked={student.assessment === 'E'}
                        onChange={() => handleAssessmentChange(student._id, 'E')}
                      />
                      <span className="ml-2 text-sm text-gray-700">E</span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={saveData}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        Save Data
      </button>
    </div>
  );
};

export default EveryClass;