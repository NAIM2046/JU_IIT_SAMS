import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { FaTrash, FaEdit, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Teacher = () => {
  const axiosPrivate = useAxiosPrivate();
  const [teacherList, setTeacherList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/api/auth/getTeacher");
      setTeacherList(res.data);
    } catch (error) {
      toast.error("Failed to fetch teachers");
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = {
      name: form.name.value,
      age: form.age.value,
      fathername: form.fathername.value,
      mothername: form.mothername.value,
      description: form.description.value,
      email: form.email.value,
      password: form.password.value,
      role: "teacher",
    };

    // Validate form
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.age || isNaN(formData.age))
      errors.age = "Valid age is required";
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
      toast.success("Teacher added successfully!");
      form.reset();
      fetchTeachers(); // Refresh the teacher list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add teacher");
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
      toast.success("Teacher deleted successfully!");
      setTeacherList((prev) => prev.filter((teacher) => teacher._id !== id));
    } catch (error) {
      toast.error("Failed to delete teacher");
      console.error("Error deleting teacher:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add Teacher Form */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaUserTie className="mr-2 text-blue-600" />
            Add New Teacher
          </h2>

          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Teacher's full name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.age ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Age"
                />
                {formErrors.age && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fathername"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Father's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother's Name
                </label>
                <input
                  type="text"
                  name="mothername"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Mother's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Email address"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.password ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Create password"
                />
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="Teacher's bio or description"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Add Teacher"}
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
                      Age
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
                              {teacher.description?.substring(0, 30)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteTeacher(teacher._id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 mr-4 disabled:opacity-50"
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
