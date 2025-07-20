import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiX, FiBook, FiSave, FiEdit2 } from "react-icons/fi";

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

  useEffect(() => {
    fetchClasses();
  }, []);

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
      toast.error("Failed to fetch classes");
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
      toast.warning("Please fill all course fields including type");
      return;
    }
    if (subjectList.some((sub) => sub.title === courseTitle)) {
      toast.warning("This course already exists in the list");
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
  };

  const handleRemoveSubjectFromList = (title) => {
    setSubjectList(subjectList.filter((sub) => sub.title !== title));
  };

  const handleCreateClass = async () => {
    if (!classNumber || subjectList.length === 0) {
      toast.warning("Please fill class and courses properly");
      return;
    }
    try {
      setLoading(true);
      await axiosPrivate.post("/api/addclassandsub", {
        classNumber,
        subjects: subjectList,
      });
      toast.success(`Class ${classNumber} created successfully`);
      setClassNumber("");
      setSubjectList([]);
      fetchClasses();
      setActiveTab("manage");
    } catch (err) {
      toast.error("Failed to create class");
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
      toast.warning("Please fill all fields including type");
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
      toast.success(`Course added to Class ${classNumber}`);
      setNewSubjectInputs((prev) => ({
        ...prev,
        [classNumber]: { title: "", code: "", credit: "", type: "" },
      }));
      fetchClasses();
    } catch (err) {
      toast.error("Failed to add course");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classNum) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Class ${classNum} and all its courses?`
      )
    )
      return;
    try {
      setLoading(true);
      await axiosPrivate.delete(`/api/classes/${classNum}`);
      toast.success(`Class ${classNum} deleted successfully`);
      fetchClasses();
    } catch (err) {
      toast.error("Failed to delete class");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (classNum, subject) => {
    if (!window.confirm(`Remove ${subject.title} from Class ${classNum}?`))
      return;
    try {
      setLoading(true);
      await axiosPrivate.put(`/api/classes/${classNum}/remove-subject`, {
        subjectCode: subject.code,
      });
      toast.success(`Course removed from Class ${classNum}`);
      fetchClasses();
    } catch (err) {
      toast.error("Failed to remove course");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                  <input
                    type="text"
                    placeholder="e.g., Bsc_1.1"
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: Degree_Semester (e.g., Bsc_1.1)
                  </p>
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
                      placeholder="Course Code"
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
                              onChange={(e) =>
                                setNewSubjectInputs((prev) => ({
                                  ...prev,
                                  [cls.class]: {
                                    ...prev[cls.class],
                                    title: e.target.value,
                                  },
                                }))
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                            <input
                              type="text"
                              placeholder="Code"
                              value={newSubjectInputs[cls.class]?.code || ""}
                              onChange={(e) =>
                                setNewSubjectInputs((prev) => ({
                                  ...prev,
                                  [cls.class]: {
                                    ...prev[cls.class],
                                    code: e.target.value,
                                  },
                                }))
                              }
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
    </div>
  );
};

export default AdminClassManage;
