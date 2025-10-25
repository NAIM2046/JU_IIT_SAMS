import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { FaTrash, FaEdit, FaUserTie, FaTimes, FaCheck } from "react-icons/fa";

const Teacher = () => {
  const axiosPrivate = useAxiosPrivate();
  const [teacherList, setTeacherList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState({
    show: false,
    message: "",
    type: "", // 'success' or 'error'
  });

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (showNotification.show) {
      const timer = setTimeout(() => {
        setShowNotification({ show: false, message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification.show]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/api/auth/getTeacher");
      setTeacherList(res.data);
    } catch (error) {
      setShowNotification({
        show: true,
        message: "Error fetching teachers",
        type: "error",
      });
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = {
      fullname: form.fullname.value,
      name: form.name.value,
      age: form.age.value,
      active: form.active.checked,
      academicNumber: form.academicNumber.value === "yes",
      description: form.description.value,
      email: form.email.value,
      password: "123456",
      role: "teacher",
      photoURL: "https://i.ibb.co/G9wkJbX/user.webp",
    };

    // Validate form
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Valid email is required";
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      setLoading(true);
      const response = await axiosPrivate.post("/api/auth/adduser", formData);
      if (response.data) {
        setShowNotification({
          show: true,
          message: "Teacher added successfully!",
          type: "success",
        });
      }

      form.reset();
      fetchTeachers(); // Refresh the teacher list
    } catch (error) {
      setShowNotification({
        show: true,
        message: error.response?.data?.message || "Failed to add teacher",
        type: "error",
      });
      console.error("Error adding teacher:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;

    try {
      setLoading(true);
      await axiosPrivate.delete(`/api/auth/deleteuser/${id}`);
      setShowNotification({
        show: true,
        message: "Teacher deleted successfully!",
        type: "success",
      });
      setTeacherList((prev) => prev.filter((teacher) => teacher._id !== id));
    } catch (error) {
      setShowNotification({
        show: true,
        message: "Failed to delete teacher",
        type: "error",
      });
      console.error("Error deleting teacher:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentTeacher(null);
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = {
      fullname: form.fullname.value,
      name: form.name.value,
      age: form.age.value,
      active: form.active.checked,
      academicNumber: form.academicNumber.value === "yes",
      description: form.description.value,
      email: form.email.value,
    };

    // Validate form
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      setLoading(true);
      const response = await axiosPrivate.put(
        `/api/auth/updateuser/${currentTeacher._id}`,
        formData
      );
      if (response.data) {
        setShowNotification({
          show: true,
          message: "Teacher updated successfully!",
          type: "success",
        });
        setIsEditing(false);
        setCurrentTeacher(null);
        fetchTeachers(); // Refresh the teacher list
        form.reset();
      }
    } catch (error) {
      setShowNotification({
        show: true,
        message: error.response?.data?.message || "Failed to update teacher",
        type: "error",
      });
      console.error("Error updating teacher:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {showNotification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            showNotification.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{showNotification.message}</span>
            <button
              onClick={() =>
                setShowNotification({ show: false, message: "", type: "" })
              }
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Teacher Form */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaUserTie className="mr-2 text-blue-600" />
            {isEditing ? "Edit Teacher" : "Add New Teacher"}
          </h2>

          <form
            onSubmit={isEditing ? handleUpdateTeacher : handleAddTeacher}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullname"
                  defaultValue={isEditing ? currentTeacher.fullname : ""}
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.fullname ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Teacher's full name"
                />
                {formErrors.fullname && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.fullname}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={isEditing ? currentTeacher.name : ""}
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Teacher's short name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  defaultValue={isEditing ? currentTeacher.age : ""}
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.age ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Age"
                />
                {formErrors.age && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Number
                </label>
                <select
                  name="academicNumber"
                  defaultValue={
                    isEditing
                      ? currentTeacher.academicNumber
                        ? "yes"
                        : "no"
                      : "yes"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={isEditing ? currentTeacher.email : ""}
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Email address"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  defaultChecked={isEditing ? currentTeacher.active : true}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="active"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Active Teacher
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={isEditing ? currentTeacher.description : ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="Teacher's bio or description"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <FaTimes className="inline mr-1" /> Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  "Processing..."
                ) : isEditing ? (
                  <>
                    <FaCheck className="inline mr-1" /> Update Teacher
                  </>
                ) : (
                  "Add Teacher"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Teacher List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Teacher List
          </h2>

          {loading && teacherList.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : teacherList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No teachers found. Add a teacher to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teacherList.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUserTie className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {teacher.fullname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            teacher.academicNumber
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {teacher.academicNumber ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            teacher.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {teacher.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditTeacher(teacher)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                          title="Edit teacher"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher._id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete teacher"
                        >
                          <FaTrash />
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
    </div>
  );
};

export default Teacher;
