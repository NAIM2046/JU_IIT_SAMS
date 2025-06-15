import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  FiAlertCircle,
  FiDownload,
  FiCalendar,
  FiLoader,
} from "react-icons/fi";
import { FaRegBell } from "react-icons/fa";

const StudentNotice = () => {
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <FaRegBell className="text-2xl" />
            <h1 className="text-2xl font-bold">School Notices</h1>
          </div>
          <p className="text-blue-100 mt-1">
            Important announcements and updates
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {notices.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiAlertCircle className="text-gray-400 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-700">
                No Notices Available
              </h3>
              <p className="text-gray-500 mt-1">
                There are currently no notices posted
              </p>
            </div>
          )}

          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {notice.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {notice.category || "General"}
                  </span>
                </div>

                <p className="text-gray-600 mt-2">{notice.description}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  {notice.pdfUrl && (
                    <a
                      href={notice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      <FiDownload className="mr-1.5 h-4 w-4" />
                      Download Attachment
                    </a>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400" />
                    {formatDate(notice.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!loading && hasMore && notices.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : (
                  "Load More Notices"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotice;
