import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  FiPlus,
  FiTrash2,
  FiX,
  FiBook,
  FiSave,
  FiEdit2,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";

const AdminClassManage = () => {
  const axiosPrivate = useAxiosPrivate();
  const [classNumber, setClassNumber] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseCredit, setCourseCredit] = useState("");
  const [courseType, setCourseType] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSubjectInputs, setNewSubjectInputs] = useState({});
  const [activeTab, setActiveTab] = useState("create");

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "success", // success, error, warning, info
    title: "",
    message: "",
    duration: 4000,
  });

  // Confirmation modal state
  const [confirmation, setConfirmation] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger", // danger, warning
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.show, notification.duration]);

  const showNotification = (type, title, message, duration = 4000) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      duration,
    });
  };

  const showConfirmation = (title, message, onConfirm, type = "danger") => {
    setConfirmation({
      show: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/api/getclassandsub");
      setClasses(Array.isArray(res.data) ? res.data : []);
      const inputs = {};
      res.data.forEach((cls) => {
        inputs[cls.class] = { title: "", code: "", credit: "", type: "" };
      });
      setNewSubjectInputs(inputs);
    } catch (err) {
      showNotification("error", "Error", "Failed to fetch classes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubjectToList = () => {
    if (
      !courseTitle.trim() ||
      !courseCode.trim() ||
      !courseCredit ||
      !courseType
    ) {
      showNotification(
        "warning",
        "Missing Information",
        "Please fill all course fields including type"
      );
      return;
    }
    if (subjectList.some((sub) => sub.title === courseTitle)) {
      showNotification(
        "warning",
        "Duplicate Course",
        "This course already exists in the list"
      );
      return;
    }

    const codePattern = /^[A-Z]{3}-\d{4}$/;
    if (!codePattern.test(courseCode.trim())) {
      showNotification(
        "warning",
        "Invalid Format",
        "Course code must be in format ABC-1234"
      );
      return;
    }
    if (isNaN(courseCredit) || courseCredit <= 0) {
      showNotification(
        "warning",
        "Invalid Credit",
        "Credit must be a positive number"
      );
      return;
    }

    setSubjectList([
      ...subjectList,
      {
        title: courseTitle.trim(),
        code: courseCode.trim(),
        credit: parseFloat(courseCredit),
        type: courseType,
      },
    ]);
    setCourseTitle("");
    setCourseCode("");
    setCourseCredit("");
    setCourseType("");

    showNotification(
      "success",
      "Course Added",
      "Course added to the list successfully",
      3000
    );
  };

  const handleRemoveSubjectFromList = (title) => {
    setSubjectList(subjectList.filter((sub) => sub.title !== title));
    showNotification(
      "info",
      "Course Removed",
      "Course removed from the list",
      3000
    );
  };

  const handleCreateClass = async () => {
    if (!classNumber || subjectList.length === 0) {
      showNotification(
        "warning",
        "Missing Information",
        "Please fill class and courses properly"
      );
      return;
    }
    try {
      setLoading(true);
      await axiosPrivate.post("/api/addclassandsub", {
        classNumber,
        subjects: subjectList,
      });
      showNotification(
        "success",
        "Success",
        `Semester ${classNumber} created successfully`
      );
      setClassNumber("");
      setSubjectList([]);
      fetchClasses();
      setActiveTab("manage");
    } catch (err) {
      showNotification("error", "Error", "Failed to create semester");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubjectToExisting = async (classNumber, subjectObj) => {
    if (
      !subjectObj.title ||
      !subjectObj.code ||
      !subjectObj.credit ||
      !subjectObj.type
    ) {
      showNotification(
        "warning",
        "Missing Information",
        "Please fill all fields including type"
      );
      return;
    }
    const codePattern = /^[A-Z]{3}-\d{4}$/;
    if (!codePattern.test(subjectObj.code.trim())) {
      showNotification(
        "warning",
        "Invalid Format",
        "Course code must be in format ABC-1234"
      );
      return;
    }
    if (isNaN(subjectObj.credit) || subjectObj.credit <= 0) {
      showNotification(
        "warning",
        "Invalid Credit",
        "Credit must be a positive number"
      );
      return;
    }

    const subjectObj1 = {
      title: subjectObj.title.trim(),
      code: subjectObj.code.trim(),
      credit: parseFloat(subjectObj.credit),
      type: subjectObj.type,
    };
    try {
      setLoading(true);
      await axiosPrivate.put(`/api/classes/${classNumber}/add-subject`, {
        subject: subjectObj1,
      });
      showNotification(
        "success",
        "Success",
        `Course added to Semester ${classNumber}`
      );
      setNewSubjectInputs((prev) => ({
        ...prev,
        [classNumber]: { title: "", code: "", credit: "", type: "" },
      }));
      fetchClasses();
    } catch (err) {
      showNotification("error", "Error", "Failed to add course");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classNum) => {
    showConfirmation(
      "Delete Semester",
      `Are you sure you want to delete Semester ${classNum} and all its courses? This action cannot be undone.`,
      async () => {
        try {
          setLoading(true);
          await axiosPrivate.delete(`/api/classes/${classNum}`);
          showNotification(
            "success",
            "Success",
            `Semester ${classNum} deleted successfully`
          );
          fetchClasses();
        } catch (err) {
          showNotification("error", "Error", "Failed to delete semester");
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      "danger"
    );
  };

  const handleRemoveSubject = async (classNum, subject) => {
    showConfirmation(
      "Remove Course",
      `Remove "${subject.title}" from Semester ${classNum}?`,
      async () => {
        try {
          setLoading(true);
          await axiosPrivate.put(`/api/classes/${classNum}/remove-subject`, {
            subjectCode: subject.code,
          });
          showNotification(
            "success",
            "Success",
            `Course removed from Semester ${classNum}`
          );
          fetchClasses();
        } catch (err) {
          showNotification("error", "Error", "Failed to remove course");
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      "warning"
    );
  };

  // Notification icons based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="h-6 w-6 text-green-500" />;
      case "error":
        return <FiAlertCircle className="h-6 w-6 text-red-500" />;
      case "warning":
        return <FiAlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "info":
        return <FiInfo className="h-6 w-6 text-blue-500" />;
      default:
        return <FiInfo className="h-6 w-6 text-blue-500" />;
    }
  };

  // Notification background colors
  const getNotificationBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  // Notification text colors
  const getNotificationTextColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Custom Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getNotificationBgColor(notification.type)} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}
        >
          <div className="flex items-start space-x-3">
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <h3
                className={`font-semibold ${getNotificationTextColor(notification.type)}`}
              >
                {notification.title}
              </h3>
              <p
                className={`text-sm mt-1 ${getNotificationTextColor(notification.type)} opacity-90`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
              className={`flex-shrink-0 ${getNotificationTextColor(notification.type)} opacity-70 hover:opacity-100 transition-opacity`}
            >
              <FiX size={18} />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                notification.type === "success"
                  ? "bg-green-500"
                  : notification.type === "error"
                    ? "bg-red-500"
                    : notification.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
              }`}
              style={{
                width: "100%",
                animation: `shrink ${notification.duration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmation.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
                  confirmation.type === "danger"
                    ? "bg-red-100"
                    : "bg-yellow-100"
                }`}
              >
                {confirmation.type === "danger" ? (
                  <FiAlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <FiAlertCircle className="h-6 w-6 text-yellow-600" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                {confirmation.title}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {confirmation.message}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    setConfirmation((prev) => ({ ...prev, show: false }))
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmation.onConfirm();
                    setConfirmation((prev) => ({ ...prev, show: false }));
                  }}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                    confirmation.type === "danger"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Semester & Course Management
          </h1>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === "create" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("create")}
            >
              Create New Semester
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === "manage" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("manage")}
            >
              Manage Semesters
            </button>
          </div>

          {/* Rest of your existing JSX remains the same */}
          {/* Create New Class Section */}
          {activeTab === "create" && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Create New Semester
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester *
                  </label>
                  <select
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Semester</option>
                    <option value="Bsc_1.1">Bsc_1.1</option>
                    <option value="Bsc_1.2">Bsc_1.2</option>
                    <option value="Bsc_2.1">Bsc_2.1</option>
                    <option value="Bsc_2.2">Bsc_2.2</option>
                    <option value="Bsc_3.1">Bsc_3.1</option>
                    <option value="Bsc_3.2">Bsc_3.2</option>
                    <option value="Bsc_4.1">Bsc_4.1</option>
                    <option value="Bsc_4.2">Bsc_4.2</option>
                    <option value="Msc_1.1">Msc_1.1</option>
                    <option value="Msc_1.2">Msc_1.2</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Details *
                    </label>
                    <input
                      type="text"
                      placeholder="Course Title"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <input
                      type="text"
                      placeholder="Course Code (e.g., ICT-1101)"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Credit"
                        value={courseCredit}
                        onChange={(e) => setCourseCredit(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                      <select
                        value={courseType}
                        onChange={(e) => setCourseType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="">Select Type</option>
                        <option value="Lab">Lab</option>
                        <option value="Theory">Theory</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAddSubjectToList}
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <FiPlus /> Add Course
                  </button>
                </div>
              </div>

              {subjectList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Selected Courses:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subjectList.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-blue-800">
                            {sub.title}
                          </p>
                          <p className="text-xs text-blue-600">
                            {sub.code} • {sub.credit} credit • {sub.type}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveSubjectFromList(sub.title)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleCreateClass}
                  disabled={!classNumber || subjectList.length === 0}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${!classNumber || subjectList.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}
                >
                  <FiSave /> Create Semester
                </button>
              </div>
            </div>
          )}

          {/* Manage Classes Section */}
          {activeTab === "manage" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Existing Semesters
                </h2>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FiPlus /> New Semester
                </button>
              </div>

              {loading && !classes.length ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FiBook className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No semesters found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new semester.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab("create")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                      <FiPlus /> Create Semester
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {classes.map((cls) => (
                    <div
                      key={cls._id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                          <FiBook className="text-blue-600" />
                          <span>Semester {cls.class}</span>
                        </h3>
                        <button
                          onClick={() => handleDeleteClass(cls.class)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                          <FiTrash2 /> Delete Semester
                        </button>
                      </div>

                      <div className="p-6">
                        {cls.subjects.length > 0 ? (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Courses in this semester:
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Credit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {cls.subjects.map((sub, idx) => (
                                    <tr key={idx}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {sub.title}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {sub.code}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {sub.credit}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span
                                          className={`px-2 py-1 text-xs rounded-full ${sub.type === "Lab" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}
                                        >
                                          {sub.type}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                          onClick={() =>
                                            handleRemoveSubject(cls.class, sub)
                                          }
                                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                                        >
                                          <FiX size={16} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg mb-6">
                            No courses in this semester yet
                          </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Add New Course to Semester {cls.class}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                              type="text"
                              placeholder="Title"
                              value={newSubjectInputs[cls.class]?.title || ""}
                              onChange={(e) => {
                                const val = e.target.value.trim();
                                setNewSubjectInputs((prev) => ({
                                  ...prev,
                                  [cls.class]: {
                                    ...prev[cls.class],
                                    title: val,
                                  },
                                }));
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                            <input
                              type="text"
                              placeholder="Code"
                              value={newSubjectInputs[cls.class]?.code || ""}
                              onChange={(e) => {
                                setNewSubjectInputs((prev) => ({
                                  ...prev,
                                  [cls.class]: {
                                    ...prev[cls.class],
                                    code: e.target.value,
                                  },
                                }));
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                            <input
                              type="number"
                              placeholder="Credit"
                              value={newSubjectInputs[cls.class]?.credit || ""}
                              onChange={(e) =>
                                setNewSubjectInputs((prev) => ({
                                  ...prev,
                                  [cls.class]: {
                                    ...prev[cls.class],
                                    credit: e.target.value,
                                  },
                                }))
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                            <select
                              value={newSubjectInputs[cls.class]?.type || ""}
                              onChange={(e) =>
                                setNewSubjectInputs((prev) => ({
                                  ...prev,
                                  [cls.class]: {
                                    ...prev[cls.class],
                                    type: e.target.value,
                                  },
                                }))
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                              <option value="">Select Type</option>
                              <option value="Lab">Lab</option>
                              <option value="Theory">Theory</option>
                            </select>
                          </div>
                          <button
                            onClick={() =>
                              handleAddSubjectToExisting(
                                cls.class,
                                newSubjectInputs[cls.class]
                              )
                            }
                            disabled={
                              !newSubjectInputs[cls.class]?.title ||
                              !newSubjectInputs[cls.class]?.code ||
                              !newSubjectInputs[cls.class]?.credit ||
                              !newSubjectInputs[cls.class]?.type
                            }
                            className={`mt-3 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${!newSubjectInputs[cls.class]?.title || !newSubjectInputs[cls.class]?.code || !newSubjectInputs[cls.class]?.credit || !newSubjectInputs[cls.class]?.type ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                          >
                            <FiPlus /> Add Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminClassManage;
