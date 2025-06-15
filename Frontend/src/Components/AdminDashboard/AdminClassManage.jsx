import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiX, FiBook, FiSave } from "react-icons/fi";

const AdminClassManage = () => {
  const axiosPrivate = useAxiosPrivate();
  const [classNumber, setClassNumber] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSubjectInputs, setNewSubjectInputs] = useState({});

  // Fetch all classes on load
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/api/getclassandsub");
      setClasses(Array.isArray(res.data) ? res.data : []);

      // Initialize new subject inputs
      const inputs = {};
      res.data.forEach((cls) => {
        inputs[cls.class] = "";
      });
      setNewSubjectInputs(inputs);
    } catch (err) {
      toast.error("Failed to fetch classes");
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubjectToList = () => {
    if (!subjectInput.trim()) {
      toast.warning("Please enter a subject name");
      return;
    }
    if (subjectList.includes(subjectInput.trim())) {
      toast.warning("This subject already exists in the list");
      return;
    }
    setSubjectList([...subjectList, subjectInput.trim()]);
    setSubjectInput("");
  };

  const handleRemoveSubjectFromList = (subjectToRemove) => {
    setSubjectList(subjectList.filter((sub) => sub !== subjectToRemove));
  };

  const handleCreateClass = async () => {
    if (!classNumber) {
      toast.warning("Please enter a class number");
      return;
    }
    if (subjectList.length === 0) {
      toast.warning("Please add at least one subject");
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
    } catch (err) {
      toast.error("Failed to create class");
      console.error("Failed to create class:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubjectToExisting = async (classNumber, subject) => {
    if (!subject.trim()) {
      toast.warning("Please enter a subject name");
      return;
    }

    try {
      setLoading(true);
      await axiosPrivate.put(`/api/classes/${classNumber}/add-subject`, {
        subject,
      });
      toast.success(`Subject added to Class ${classNumber}`);

      // Clear the input for this class
      setNewSubjectInputs((prev) => ({ ...prev, [classNumber]: "" }));
      fetchClasses();
    } catch (err) {
      toast.error("Failed to add subject");
      console.error("Failed to add subject:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (classNumber, subject) => {
    if (!window.confirm(`Remove "${subject}" from Class ${classNumber}?`))
      return;

    try {
      setLoading(true);
      await axiosPrivate.put(`/api/classes/${classNumber}/remove-subject`, {
        subject,
      });
      toast.success(`Subject removed from Class ${classNumber}`);
      fetchClasses();
    } catch (err) {
      toast.error("Failed to remove subject");
      console.error("Failed to remove subject:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classNum) => {
    if (!window.confirm(`Delete Class ${classNum} and all its subjects?`))
      return;

    try {
      setLoading(true);
      await axiosPrivate.delete(`/api/classes/${classNum}`);
      toast.success(`Class ${classNum} deleted successfully`);
      fetchClasses();
    } catch (err) {
      toast.error("Failed to delete class");
      console.error("Failed to delete class:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Class & Subject Management
        </h1>

        {/* Add New Class Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Create New Class
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Number *
              </label>
              <input
                type="number"
                placeholder="e.g., 6 for Class 6"
                value={classNumber}
                onChange={(e) => setClassNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Subjects *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Subject name"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddSubjectToList()
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddSubjectToList}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                >
                  <FiPlus /> Add
                </button>
              </div>
            </div>
          </div>

          {subjectList.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Subjects to Add:
              </h3>
              <div className="flex flex-wrap gap-2">
                {subjectList.map((sub, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {sub}
                    <button
                      onClick={() => handleRemoveSubjectFromList(sub)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCreateClass}
            disabled={loading || !classNumber || subjectList.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave /> Create Class
          </button>
        </div>

        {/* All Classes Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Existing Classes
          </h2>

          {loading && !classes.length ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No classes found. Create your first class above.
            </div>
          ) : (
            <div className="space-y-6">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <FiBook className="text-blue-500" /> Class {cls.class}
                    </h3>
                    <button
                      onClick={() => handleDeleteClass(cls.class)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                    >
                      <FiTrash2 /> Delete Class
                    </button>
                  </div>

                  {cls.subjects.length > 0 ? (
                    <ul className="mb-4 space-y-2">
                      {cls.subjects.map((sub, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                        >
                          <span>{sub}</span>
                          <button
                            onClick={() => handleRemoveSubject(cls.class, sub)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                          >
                            <FiX /> Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mb-4 text-gray-500 text-sm">
                      No subjects added yet
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add new subject"
                      value={newSubjectInputs[cls.class] || ""}
                      onChange={(e) =>
                        setNewSubjectInputs((prev) => ({
                          ...prev,
                          [cls.class]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddSubjectToExisting(cls.class, e.target.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() =>
                        handleAddSubjectToExisting(
                          cls.class,
                          newSubjectInputs[cls.class] || ""
                        )
                      }
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                      disabled={!newSubjectInputs[cls.class]}
                    >
                      <FiPlus /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClassManage;
