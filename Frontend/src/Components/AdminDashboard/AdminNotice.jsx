import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiPlus,
  FiChevronDown,
} from "react-icons/fi";

const AdminNotice = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdf, setPdf] = useState(null);
  const [notices, setNotices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const AxiosSecure = useAxiosPrivate();

  const fetchNotices = async (page) => {
    try {
      const res = await AxiosSecure.get(`/api/notices?page=${page}`);
      const data = res.data;

      if (data.notices.length === 0 || page + 1 >= data.totalPages) {
        setHasMore(false);
      }

      if (page === 0) {
        setNotices(data.notices);
      } else {
        setNotices((prev) => [...prev, ...data.notices]);
      }
    } catch (error) {
      console.error("Failed to fetch notices:", error);
    }
  };

  useEffect(() => {
    fetchNotices(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (pdf) formData.append("pdf", pdf);

    try {
      if (editingId) {
        await AxiosSecure.put(`/api/notices/${editingId}`, formData);
        setEditingId(null);
      } else {
        await AxiosSecure.post("/api/notices", formData);
      }

      // Clear form
      setTitle("");
      setDescription("");
      setPdf(null);

      // Refresh notices
      setCurrentPage(0);
      setHasMore(true);
      await fetchNotices(0);
    } catch (error) {
      console.error("Failed to submit notice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await AxiosSecure.delete(`/api/notices/${id}`);
        setCurrentPage(0);
        setHasMore(true);
        await fetchNotices(0);
      } catch (error) {
        console.error("Failed to delete notice:", error);
      }
    }
  };

  const handleEdit = (notice) => {
    setTitle(notice.title);
    setDescription(notice.description);
    setEditingId(notice._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Notice Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {editingId
              ? "Update an existing notice"
              : "Create and manage notices for your organization"}
          </p>
        </div>

        {/* Notice Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {editingId ? "Edit Notice" : "Create New Notice"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                placeholder="Enter notice title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Enter notice description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="pdf"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                PDF Attachment {!editingId && "(Required)"}
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  id="pdf"
                  accept="application/pdf"
                  onChange={(e) => setPdf(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required={!editingId}
                />
              </div>
              {pdf && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected file: {pdf.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setDescription("");
                    setPdf(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
                  "Processing..."
                ) : editingId ? (
                  <>
                    <FiEdit2 className="inline mr-2" />
                    Update Notice
                  </>
                ) : (
                  <>
                    <FiPlus className="inline mr-2" />
                    Add Notice
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Notices List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">All Notices</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {notices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No notices
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new notice.
                </p>
              </div>
            ) : (
              notices.map((notice) => (
                <div key={notice._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {notice.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {notice.description}
                      </p>
                      <div className="mt-2">
                        <a
                          href={notice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          <FiFileText className="mr-1.5 h-4 w-4" />
                          View PDF
                        </a>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleEdit(notice)}
                        className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Edit"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice._id)}
                        className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Delete"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {hasMore && notices.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  fetchNotices(nextPage);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiChevronDown className="mr-2" />
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotice;
