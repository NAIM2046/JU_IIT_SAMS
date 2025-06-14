import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useStroge from "../stroge/useStroge";

const Navbar = () => {
  const { user, setUser } = useStroge();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const links = (
    <>
      <li key="home">
        <Link to="/">Home</Link>
      </li>
      {user && (
        <li key="dashboard">
          <Link to={`/${user.role}Dashboard`}>Dashboard</Link>
        </li>
      )}
    </>
  );

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">
          iEdu
        </Link>
      </div>

      <div className="navbar-center  lg:flex">
        <ul className="menu menu-horizontal px-1">{links}</ul>
      </div>

      <div className="navbar-end">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1 shadow-sm hover:shadow-md transition">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={user.photoURL || "https://i.ibb.co/G9wkJbX/user.webp"}
                    alt="user"
                  />
                </div>
              </div>
              <span className="hidden sm:block text-sm text-gray-700">
                {user.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline btn-error"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-sm btn-primary">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
