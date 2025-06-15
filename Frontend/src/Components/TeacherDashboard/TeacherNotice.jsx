import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { FiAlertCircle, FiDownload, FiClock, FiPlus } from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

const TeacherNotice = () => {
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
      setInitialLoading(false);
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <FaChalkboardTeacher className="mr-3 text-blue-600" />
            Teacher Notices
          </h1>
          <p className="text-gray-600">
            Important announcements and updates for teachers
          </p>
        </div>

        {/* Notices List */}
        {initialLoading ? (
          <div className="flex justify-center items-center h-64">
            <ImSpinner8 className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No notices available
            </h3>
            <p className="text-gray-500">
              There are currently no notices posted.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800">
                      {notice.title}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {notice.category || "General"}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-3">{notice.description}</p>

                  {notice.pdfUrl && (
                    <div className="mt-4">
                      <a
                        href={notice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <FiDownload className="mr-2" />
                        Download Attachment
                      </a>
                    </div>
                  )}

                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <FiClock className="mr-2" />
                    <span>Posted on: {formatDate(notice.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!initialLoading && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <ImSpinner8 className="animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Load More Notices
                </>
              )}
            </button>
          </div>
        )}

        {!hasMore && notices.length > 0 && (
          <p className="mt-6 text-center text-gray-500">
            You've reached the end of notices
          </p>
        )}
      </div>
    </div>
  );
};

export default TeacherNotice;
