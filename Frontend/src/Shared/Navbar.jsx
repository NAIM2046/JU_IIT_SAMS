import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useStroge from "../stroge/useStroge";
import { FaRegCommentAlt } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useEffect } from "react";
import { useState } from "react";
import useAxiosPrivate from "../TokenAdd/useAxiosPrivate";

const Navbar = () => {
  const { user, setUser } = useStroge();
  const [unseenMessageCount, setUnseenMessageCount] = useState(0);
  const [unseenNotificationCount, setUnseenNotificationCount] = useState(0);

  const axiosSecure = useAxiosPrivate();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    if (user?._id) {
      // Fetch unseen messages
      axiosSecure
        .get(`/api/message/getTotalunseenMessage/${user?._id}`)
        .then((res) => {
          setUnseenMessageCount(res.data.totalUnseenMessages);
        })
        .catch((err) => console.error("Error fetching messages:", err));

      // Fetch unseen notifications
      axiosSecure
        .get(`/api/notifications/unseen-count/${user?._id}`)
        .then((res) => {
          setUnseenNotificationCount(res.data.count);
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [user?._id, axiosSecure]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-1">
              <div className="w-12 h-12 md:w-32 rounded-md flex items-center justify-center">
                <img
                  src="https://i.ibb.co/N2HxDsdJ/logo-IIT-01-1.png"
                  alt="IIT JU Logo"
                  className="h-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-gray-800 hidden md:inline">
                IIT JU Portal
              </span>
            </Link>
          </div>

          {/* Only Dashboard Link */}
          <nav className="flex items-center">
            {user && (
              <Link
                to={`/${user.role}Dashboard`}
                className="text-gray-600 hover:text-green-600 px-2 py-1 text-sm md:text-xl font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 md:gap-8">
                {/* Notification Icon */}
                <Link to="/notifications" className="relative p-2">
                  <IoMdNotificationsOutline className="h-6 w-6 text-gray-600 hover:text-green-600" />
                  {unseenNotificationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unseenNotificationCount > 9
                        ? "9+"
                        : unseenNotificationCount}
                    </span>
                  )}
                </Link>

                {/* Messages Icon with Badge */}
                <Link to="/messages" className="relative p-2">
                  <FaRegCommentAlt className="h-6 w-6 text-gray-600 hover:text-green-600" />
                  {unseenMessageCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unseenMessageCount > 9 ? "9+" : unseenMessageCount}
                    </span>
                  )}
                </Link>

                {/* User Profile */}
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-green-100">
                    <img
                      className="h-full w-full object-cover"
                      src={
                        user.photoURL ||
                        "https://iitju.edu.bd/wp-content/uploads/2022/01/default-profile.png"
                      }
                      alt={user.name}
                    />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-md border border-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
