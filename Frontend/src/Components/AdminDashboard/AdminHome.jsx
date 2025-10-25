import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiBook,
  FiCalendar,
  FiBarChart2,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiPower,
  FiPause,
  FiPlay,
} from "react-icons/fi";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const AdminHome = () => {
  const [activeClass, setActiveClass] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  const toggleStatus = async () => {
    const newStatus = !activeClass;
    const statusText = newStatus ? "on" : "off";

    const confirm = window.confirm(
      `Are you sure you want to turn ${statusText} classes?`
    );

    if (!confirm) return;

    setIsLoading(true);
    setStatusError(null);

    try {
      const response = await axiosPrivate.post(
        "/api/classHistory/class-on-off-status",
        {
          status: statusText,
          name: "classStatus",
        }
      );

      console.log("Status update response:", response.data);
      setActiveClass(newStatus);

      // Optional: Show success message
      // alert(`Classes have been turned ${statusText}`);
    } catch (error) {
      console.error("Error updating class status:", error);
      setStatusError("Failed to update class status. Please try again.");

      // Revert the UI state on error
      setActiveClass(activeClass);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        const response = await axiosPrivate.get(
          "/api/classHistory/class-on-off-status?name=classStatus"
        );
        console.log("Fetched status:", response.data);

        setActiveClass(response.data) ;
      } catch (error) {
        console.error("Error fetching class status:", error);
        setStatusError("Failed to fetch class status.");

        // Set default state on error
        setActiveClass(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [axiosPrivate]);

  // Sample data - in a real app this would come from API/state
  const recentActivities = [
    {
      id: 1,
      user: "Ms. Johnson",
      action: "added exam results",
      time: "10 mins ago",
      icon: <FiBarChart2 className="text-blue-500" />,
    },
    {
      id: 2,
      user: "Admin",
      action: "updated school calendar",
      time: "25 mins ago",
      icon: <FiCalendar className="text-purple-500" />,
    },
    {
      id: 3,
      user: "Mr. Smith",
      action: "uploaded lesson plans",
      time: "1 hour ago",
      icon: <FiBook className="text-green-500" />,
    },
  ];

  const performanceAlerts = [
    {
      id: 1,
      class: "Class 9 Science",
      issue: "10 students below 40%",
      severity: "high",
    },
    {
      id: 2,
      class: "Class 7B",
      issue: "Attendance drop (15%)",
      severity: "medium",
    },
    {
      id: 3,
      class: "Class 11 Math",
      issue: "3 late submissions",
      severity: "low",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with quick actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, Admin</p>
          </div>

          {/* Status Toggle Button */}
          <div className="flex flex-col items-end gap-2">
            {statusError && (
              <p className="text-red-500 text-sm">{statusError}</p>
            )}
            <button
              onClick={toggleStatus}
              disabled={isLoading}
              className={`
                flex items-center justify-center gap-2 
                px-6 py-3 rounded-lg font-semibold 
                transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  activeClass
                    ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                    : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : activeClass ? (
                <>
                  <FiPause size={18} />
                  <span>Turn Off Classes</span>
                </>
              ) : (
                <>
                  <FiPlay size={18} />
                  <span>Turn On Classes</span>
                </>
              )}
            </button>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  activeClass ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className={activeClass ? "text-green-600" : "text-red-600"}>
                Classes are {activeClass ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
              <FiCalendar className="mr-2" /> Add Event
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center">
              <FiUsers className="mr-2" /> Manage Users
            </button>
          </div>
        </div>

        {/* Rest of your component remains the same */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* ... your existing cards ... */}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* ... your existing content ... */}
        </div>

        {/* Quick Stats */}
        <div className="bg-white shadow rounded-xl p-6">
          {/* ... your existing stats ... */}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
