import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEdit, FiTrash2, FiUserPlus } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";

const Student = () => {
  const axiosPrivate = useAxiosPrivate();

  const [student, setStudent] = useState([]);
  const [classlist, setClassList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Fetch student data
  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get("/api/auth/getstudent");
      setStudent(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch students");
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch class data
  const fetchClass = async () => {
    try {
      const response = await axiosPrivate.get("/api/getclassandsub");
      setClassList(response.data);
    } catch (error) {
      console.error("Error fetching class data:", error);
    }
  };

  useEffect(() => {
    fetchClass();
    fetchStudent();
  }, []);

  // Handle form submission
  const handleFormSubmission = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const studentInfo = {
      role: "student",
      name: formData.get("name"),
      age: formData.get("age"),
      class: formData.get("class"),
      section: formData.get("section"),
      roll: formData.get("roll"),
      password: "123456",
      gender: formData.get("gender"),
      guardians: {
        fatherName: formData.get("fathername"),
        motherName: formData.get("mothername"),
        phoneNumber: formData.get("phonenumber"),
      },
      email: formData.get("email"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      setLoading(true);
      if (isEditMode && currentStudent) {
        // Update existing student
        await axiosPrivate.put(
          `/api/auth/updateuser/${currentStudent._id}`,
          studentInfo
        );
        toast.success("Student updated successfully");
      } else {
        // Add new student
        const response = await axiosPrivate.post(
          "/api/auth/adduser",
          studentInfo
        );
        const userid = response.data.userId;
        if (userid) {
          await axiosPrivate.post(
            `/api/attendance/initialAttendanceInfo/${userid}`
          );
        }
        toast.success("Student added successfully");
      }
      form.reset();
      setIsEditMode(false);
      setCurrentStudent(null);
      fetchStudent();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit student
  const handleEditStudent = (student) => {
    setIsEditMode(true);
    setCurrentStudent(student);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete student
  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      setLoading(true);
      await axiosPrivate.delete(`/api/auth/deleteuser/${id}`);
      setStudent((prev) => prev.filter((s) => s._id !== id));
      toast.success("Student deleted successfully");
    } catch (error) {
      toast.error("Failed to delete student");
      console.error("Error deleting student:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = student.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
        <div className="relative mt-4 md:mt-0 w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Add/Edit Student Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isEditMode ? "Edit Student" : "Add New Student"}
        </h2>
        <form onSubmit={handleFormSubmission}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name and Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="name"
                placeholder="Student Name"
                required
                defaultValue={currentStudent?.name || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="age"
                placeholder="Age"
                required
                min="5"
                max="25"
                defaultValue={currentStudent?.age || ""}
              />
            </div>

            {/* Class and Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                name="class"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                defaultValue={currentStudent?.class || ""}
              >
                <option value="">Select Class</option>
                {classlist.map((cls, index) => (
                  <option key={index} value={cls.class}>
                    {cls.class}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="section"
                placeholder="Section"
                required
                defaultValue={currentStudent?.section || ""}
              />
            </div>

            {/* Roll and Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="roll"
                placeholder="Roll Number"
                required
                defaultValue={currentStudent?.roll || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                defaultValue={currentStudent?.gender || "choose gender"}
              >
                <option value="choose gender" disabled>
                  Choose Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Parent Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="fathername"
                placeholder="Father's Name"
                required
                defaultValue={currentStudent?.guardians?.fatherName || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mother's Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="mothername"
                placeholder="Mother's Name"
                required
                defaultValue={currentStudent?.guardians?.motherName || ""}
              />
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="phonenumber"
                placeholder="Phone Number"
                required
                defaultValue={currentStudent?.guardians?.phoneNumber || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="email"
                placeholder="Email Address"
                required
                defaultValue={currentStudent?.email || ""}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            {isEditMode && (
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(false);
                  setCurrentStudent(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                "Processing..."
              ) : isEditMode ? (
                <>
                  <FiEdit className="mr-2" />
                  Update Student
                </>
              ) : (
                <>
                  <FiUserPlus className="mr-2" />
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Student List</h2>
        </div>
        {loading && !student.length ? (
          <div className="p-6 text-center">Loading students...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No students found {searchTerm && `matching "${searchTerm}"`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((s, index) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {s.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.roll}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditStudent(s)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FiEdit className="inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(s._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline" />
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

export default Student;
