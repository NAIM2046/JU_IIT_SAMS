import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const AdminNotice = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdf, setPdf] = useState(null);
  const [notices, setNotices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("pdf", pdf);

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
      fetchNotices(0);
    } catch (error) {
      console.error("Failed to submit notice:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this notice?")) {
      try {
        await AxiosSecure.delete(`/api/notices/${id}`);
        setCurrentPage(0);
        setHasMore(true);
        fetchNotices(0);
      } catch (error) {
        console.error("Failed to delete notice:", error);
      }
    }
  };

  const handleEdit = (notice) => {
    setTitle(notice.title);
    setDescription(notice.description);
    setEditingId(notice._id);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Notice Panel</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white shadow p-4 rounded-md"
      >
        <input
          type="text"
          placeholder="Notice Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="Notice Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          required
        ></textarea>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files[0])}
          className="w-full border p-2 rounded"
          required={!editingId}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update Notice" : "Add Notice"}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">All Notices</h3>
        <ul className="space-y-2">
          {notices.map((notice) => (
            <li
              key={notice._id}
              className="p-4 bg-gray-100 rounded shadow flex justify-between items-center"
            >
              <div>
                <h4 className="font-bold">{notice.title}</h4>
                <p>{notice.description}</p>
                <a
                  href={notice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View PDF
                </a>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(notice)}
                  className="bg-yellow-400 px-3 py-1 rounded text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(notice._id)}
                  className="bg-red-500 px-3 py-1 rounded text-white"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {hasMore && (
          <button
            onClick={() => {
              const nextPage = currentPage + 1;
              setCurrentPage(nextPage);
              fetchNotices(nextPage);
            }}
            className="mt-4 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded"
          >
            See more...
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminNotice;
