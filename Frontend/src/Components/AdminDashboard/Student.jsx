import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEdit, FiTrash2, FiUserPlus, FiX, FiSave } from "react-icons/fi";
import { FaSearch, FaUserGraduate } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

const Student = () => {
  const axiosPrivate = useAxiosPrivate();

  const [student, setStudent] = useState([]);
  const [classlist, setClassList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      class_roll: formData.get("class_roll"),
      exam_roll: formData.get("exam_roll"),
      hall_name: formData.get("hallname"),
      password: "123456",
      gender: formData.get("gender"),
      guardians: {
        fatherName: formData.get("fathername"),
        motherName: formData.get("mothername"),
        phoneNumber: formData.get("phonenumber"),
      },
      email: formData.get("email"),
      photoURL: "https://i.ibb.co/G9wkJbX/user.webp",
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
        if (response.data) {
          toast.success("Student added successfully");
        }
      }
      form.reset();
      setIsEditMode(false);
      setCurrentStudent(null);
      setIsFormOpen(false);
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
    setIsFormOpen(true);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <FaUserGraduate className="text-3xl text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Student Management
            </h1>
            <p className="text-sm text-gray-500">
              {student.length} students registered
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
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
          <button
            onClick={() => {
              setIsFormOpen(true);
              setIsEditMode(false);
              setCurrentStudent(null);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <FiUserPlus /> Add Student
          </button>
        </div>
      </div>

      {/* Add/Edit Student Form - Modal style */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditMode ? "Edit Student" : "Add New Student"}
            </h2>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setIsEditMode(false);
                setCurrentStudent(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleFormSubmission}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
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
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="age"
                    placeholder="Age"
                    required
                    min="5"
                    max="50"
                    defaultValue={currentStudent?.age || ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    defaultValue={currentStudent?.gender || ""}
                  >
                    <option value="" disabled>
                      Choose Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="class"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    defaultValue={currentStudent?.class || ""}
                  >
                    <option value="" disabled>
                      Select Semester
                    </option>
                    {classlist.map((cls, index) => (
                      <option key={index} value={cls.class}>
                        {cls.class}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Roll <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="class_roll"
                    placeholder="Class Roll"
                    required
                    defaultValue={currentStudent?.class_roll || ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Roll <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="exam_roll"
                    placeholder="Exam Roll"
                    required
                    defaultValue={currentStudent?.exam_roll || ""}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hall Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="hallname"
                    placeholder="Hall Name"
                    required
                    defaultValue={currentStudent?.hall_name || ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
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

              {/* Guardian Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name <span className="text-red-500">*</span>
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
                    Mother's Name <span className="text-red-500">*</span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
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
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setIsEditMode(false);
                  setCurrentStudent(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <ImSpinner8 className="animate-spin" />
                    Processing...
                  </>
                ) : isEditMode ? (
                  <>
                    <FiSave />
                    Update Student
                  </>
                ) : (
                  <>
                    <FiUserPlus />
                    Add Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Student List
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredStudents.length} of {student.length} students
            </p>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          )}
        </div>

        {loading && !student.length ? (
          <div className="p-6 text-center">
            <ImSpinner8 className="animate-spin text-2xl text-blue-500 mx-auto" />
            <p className="mt-2 text-gray-500">Loading students...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FaSearch className="mx-auto text-3xl text-gray-300 mb-3" />
            <p>
              No students found {searchTerm && `matching "${searchTerm}"`}
              {!searchTerm && " - Add a new student to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 mx-auto"
              >
                <FiUserPlus /> Add Student
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((s, index) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {s.name}
                          </div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {s.gender} | {s.class_roll}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.class}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.class_roll}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          s.gender === "male"
                            ? "bg-blue-100 text-blue-800"
                            : s.gender === "female"
                              ? "bg-pink-100 text-pink-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {s.gender}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <div className="truncate max-w-xs">{s.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditStudent(s)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
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
