import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const AddNewBatchandUpdate = () => {
  const AxioseSecure = useAxiosPrivate();
  const [classandSubjects, setClassandSubjects] = useState([]);
  const [batchlist, setBatchList] = useState([]);
  const [activeForm, setActiveForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const navigate = useNavigate();

  const [newBatch, setNewBatch] = useState({
    batchNumber: "",
    session: "",
  });

  const [selectedBatches, setSelectedBatches] = useState({});

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const getClassandSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await AxioseSecure.get("/api/getclassandsub");
      const sortedData = response.data.sort((a, b) =>
        a.class.localeCompare(b.class)
      );
      setClassandSubjects(sortedData);
    } catch (error) {
      console.error("Failed to fetch class and subjects", error);
      showNotification("Failed to fetch classes and subjects", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getBatch = async () => {
      try {
        setIsLoading(true);
        const response = await AxioseSecure.get("/api/getbatch");
        setBatchList(response.data);
      } catch (error) {
        console.error("Failed to fetch batch list", error);
        showNotification("Failed to fetch batch list", "error");
      } finally {
        setIsLoading(false);
      }
    };

    getBatch();
    getClassandSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBatch({ ...newBatch, [name]: value });
  };

  const handleAddBatch = async () => {
    if (!newBatch.batchNumber || !newBatch.session) {
      showNotification("Please fill all fields", "error");
      return;
    }

    try {
      setIsLoading(true);
      await AxioseSecure.post("/api/addnewbatch", newBatch);
      const updatedBatchList = await AxioseSecure.get("/api/getbatch");
      setBatchList(updatedBatchList.data);
      setNewBatch({ batchNumber: "", session: "" });
      setActiveForm(false);
      showNotification("Batch added successfully", "success");
    } catch (error) {
      console.error("Failed to add batch", error);
      showNotification("Failed to add batch", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBatch = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this batch? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      await AxioseSecure.delete(`/api/deletebatch/${id}`);
      const updatedBatchList = await AxioseSecure.get("/api/getbatch");
      setBatchList(updatedBatchList.data);
      showNotification("Batch deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete batch", error);
      showNotification("Failed to delete batch", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (classId, value) => {
    setSelectedBatches({ id: classId, batchNumber: value });
  };

  const handleUpdateSingleBatch = async () => {
    // if (!selectedBatches.id || !selectedBatches.batchNumber) {
    //   showNotification("Please select a batch", "error");
    //   return;
    // }

    try {
      setIsLoading(true);
      await AxioseSecure.post("/api/update-running-batches", selectedBatches);
      showNotification("Batch updated successfully", "success");
      setSelectedBatches({});
      getClassandSubjects();
    } catch (error) {
      console.error("Failed to update batch", error);
      showNotification("Failed to update batch", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
              notification.type === "error"
                ? "bg-red-100 text-red-800"
                : notification.type === "info"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Batch Management Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-700 text-white">
            <h1 className="text-2xl font-bold">Batch Management</h1>
            <p className="text-indigo-100">Create and manage batches</p>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                All Batches
              </h2>
              <button
                onClick={() => setActiveForm(!activeForm)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                {activeForm ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add New Batch
                  </>
                )}
              </button>
            </div>

            {activeForm && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Add New Batch
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={newBatch.batchNumber}
                      onChange={handleChange}
                      placeholder="e.g., Batch-1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session
                    </label>
                    <input
                      type="text"
                      name="session"
                      value={newBatch.session}
                      onChange={handleChange}
                      placeholder="e.g., 2023-2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddBatch}
                    disabled={
                      !newBatch.batchNumber || !newBatch.session || isLoading
                    }
                    className={`px-4 py-2 rounded-md text-white ${
                      !newBatch.batchNumber || !newBatch.session || isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isLoading ? "Processing..." : "Save Batch"}
                  </button>
                </div>
              </div>
            )}

            {batchlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {batchlist.map((batch) => (
                  <div
                    key={batch._id}
                    className="p-4 border rounded-lg bg-white hover:shadow-md transition flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {batch.batchNumber}
                      </h3>
                      <p className="text-sm text-gray-500">{batch.session}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBatch(batch._id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition"
                      title="Delete Batch"
                      disabled={isLoading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-700">
                  No batches found
                </h3>
                <p className="mt-1 text-gray-500">
                  Add a new batch to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Class & Batch Assignment Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-700 text-white">
            <h1 className="text-2xl font-bold">Class Batch Assignment</h1>
            <p className="text-indigo-100">Assign batches to classes</p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading classes...</p>
              </div>
            ) : classandSubjects.length > 0 ? (
              <div className="space-y-4">
                {classandSubjects.map((classSub) => {
                  const selectedValue = selectedBatches.batchNumber;
                  const currentValue = classSub.batchNumber || "";

                  return (
                    <div
                      key={classSub._id}
                      className="p-4 bg-gray-50 border rounded-lg hover:shadow transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-800">
                            {classSub.class}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Current batch:{" "}
                            {classSub.batchNumber || "Not assigned"}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                          <select
                            value={
                              selectedBatches.id === classSub._id
                                ? selectedValue
                                : currentValue
                            }
                            onChange={(e) =>
                              handleSelectChange(classSub._id, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select Batch</option>
                            {batchlist.map((batch) => (
                              <option key={batch._id} value={batch.batchNumber}>
                                {batch.batchNumber} ({batch.session})
                              </option>
                            ))}
                          </select>

                          <div className="flex gap-2">
                            {classSub._id === selectedBatches.id && (
                              <>
                                <button
                                  onClick={handleUpdateSingleBatch}
                                  disabled={isLoading}
                                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex items-center gap-1"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Update
                                </button>
                                <button
                                  onClick={() => setSelectedBatches({})}
                                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() =>
                                navigate(
                                  `/adminDashboard/examCommitteeManage/${classSub.classNumber}`,
                                  {
                                    state: { classSub },
                                  }
                                )
                              }
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm flex items-center gap-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                              </svg>
                              Committee
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-700">
                  No classes found
                </h3>
                <p className="mt-1 text-gray-500">
                  Add classes to assign batches
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewBatchandUpdate;
