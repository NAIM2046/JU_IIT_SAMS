import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const TeacherNotice = () => {
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const AxiosSecure = useAxiosPrivate();

  const fetchNotices = async (pageNum) => {
    setLoading(true);
    try {
      const res = await AxiosSecure.get(`/api/notices?page=${pageNum}`);
      const data = res.data;

      if (data.notices.length === 0 || pageNum + 1 >= data.totalPages) {
        setHasMore(false);
      }

      if (pageNum === 0) {
        setNotices(data.notices);
      } else {
        setNotices((prev) => [...prev, ...data.notices]);
      }
    } catch (error) {
      console.error("Failed to fetch notices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(0);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchNotices(nextPage);
    setPage(nextPage);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Teacher Notices</h2>

      {notices.length === 0 && !loading && (
        <p className="text-gray-500">No notices available.</p>
      )}

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice._id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <h3 className="text-lg font-bold">{notice.title}</h3>
            <p className="text-gray-700 mt-2">{notice.description}</p>
            {notice.pdfUrl && (
              <a
                href={notice.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline mt-2 inline-block"
              >
                View PDF
              </a>
            )}
            <p className="text-sm text-gray-400 mt-2">
              Posted on: {new Date(notice.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {loading && <p className="mt-4 text-blue-500">Loading...</p>}

      {!loading && hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherNotice;
