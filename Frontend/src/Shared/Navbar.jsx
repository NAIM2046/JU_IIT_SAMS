import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useStroge from "../stroge/useStroge";
import { FaRegCommentAlt } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io"; // Optional: for notification icon

const Navbar = () => {
  const { user, setUser } = useStroge();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Mock data - replace with actual data from your backend
  const unseenMessageCount = 3;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-800">
                EduPortal
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop Only */}
          <nav className="flex items-center space-x-1 md:space-x-6">
            {user && (
              <Link
                to={`/${user.role}Dashboard`}
                className="text-gray-600 hover:text-blue-600 px-2 py-1 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Optional: Notification Icon */}
                {/* <Link to="/notifications" className="relative p-2">
                  <IoMdNotificationsOutline className="h-6 w-6 text-gray-600 hover:text-blue-600" />
                  {unseenNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unseenNotificationsCount > 9 ? "9+" : unseenNotificationsCount}
                    </span>
                  )}
                </Link> */}

                {/* Messages Icon with Badge */}
                <Link to="/messages" className="relative p-2">
                  <FaRegCommentAlt className="h-6 w-6 text-gray-600 hover:text-blue-600" />
                  {unseenMessageCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unseenMessageCount > 9 ? "9+" : unseenMessageCount}
                    </span>
                  )}
                </Link>

                {/* User Profile */}
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-blue-100">
                    <img
                      className="h-full w-full object-cover"
                      src={
                        user.photoURL || "https://i.ibb.co/G9wkJbX/user.webp"
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
