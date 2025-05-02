import React, { useState, useEffect } from "react";
import axios from "axios";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const AdminClassManage = () => {
  const [classNumber, setClassNumber] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [classes, setClasses] = useState([]);
  const AxiosSecure = useAxiosPrivate();

  // Fetch all classes on load
  useEffect(() => {
    fetchClasses();
  }, []);
  console.log("Classes:", classes); // ⬅️ Add this line
  const fetchClasses = async () => {
    try {
      const res = await AxiosSecure.get("/api/getclassandsub");
      console.log("Class data:", res.data); // ⬅️ Add this line
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setClasses([]);
    }
  };

  const handleAddSubjectToList = () => {
    if (subjectInput.trim()) {
      setSubjectList([...subjectList, subjectInput.trim()]);
      setSubjectInput("");
    }
  };

  const handleCreateClass = async () => {
    const classnew = {
      class: classNumber,
      subjects: subjectList,
    };
    console.log("Class data:", classnew); // ⬅️ Add this line
    if (!classNumber || subjectList.length === 0)
      return alert("Fill all fields");

    await AxiosSecure.post("/api/addclassandsub", {
      classNumber,
      subjects: subjectList,
    });

    setClassNumber("");
    setSubjectList([]);
    fetchClasses();
  };

  const handleAddSubjectToExisting = async (classNumber, subject) => {
    console.log("Adding subject:", classNumber, subject); // ⬅️ Add this line
    await AxiosSecure.put(`/api/classes/${classNumber}/add-subject`, {
      subject,
    });
    fetchClasses();
  };

  const handleRemoveSubject = async (classNumber, subject) => {
    await AxiosSecure.put(`/api/classes/${classNumber}/remove-subject`, {
      subject,
    });
    fetchClasses();
  };

  const handleDeleteClass = async (classNum) => {
    try {
      await AxiosSecure.delete(`/api/classes/${classNum}`);
      fetchClasses(); // Refresh the class list after deletion
    } catch (err) {
      console.error("Failed to delete class:", err);
      alert("Failed to delete class. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📘 Class & Subject Manager</h2>

      {/* Add New Class Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-xl font-semibold mb-2">➕ Add New Class</h3>
        <input
          type="number"
          placeholder="Class Number"
          value={classNumber}
          onChange={(e) => setClassNumber(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Subject Name"
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={handleAddSubjectToList}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Add Subject
        </button>
        <div className="mt-2">
          {subjectList.map((sub, idx) => (
            <span
              key={idx}
              className="bg-gray-200 px-2 py-1 mr-2 mt-2 inline-block rounded"
            >
              {sub}
            </span>
          ))}
        </div>
        <button
          onClick={handleCreateClass}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          ✅ Create Class
        </button>
      </div>

      {/* All Classes */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">📋 All Classes</h3>
        {classes?.map((cls) => (
          <div key={cls._id} className="mb-4 border-b pb-2">
            <h4 className="font-bold text-lg flex justify-between items-center">
              <span>Class {cls.class}</span>
              <button
                onClick={() => handleDeleteClass(cls.class)}
                className="text-red-500 text-sm"
              >
                🗑️ Delete Class
              </button>
            </h4>
            <ul className="ml-4 mt-2">
              {cls.subjects.map((sub, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{sub}</span>
                  <button
                    onClick={() => handleRemoveSubject(cls.class, sub)}
                    className="text-red-500 text-sm"
                  >
                    ❌ Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="New Subject"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddSubjectToExisting(cls.class, e.target.value);
                    e.target.value = "";
                  }
                }}
                className="border p-1 px-2"
              />
              <span className="text-sm text-gray-500">Press Enter to add</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminClassManage;
