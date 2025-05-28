import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useStroge from "../stroge/useStroge";

const Navbar = () => {
  const { user, setUser } = useStroge();
  const navigate = useNavigate();

  console.log("user", user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const links = (
    <>
      <li>
        <Link to="/">Home</Link>
      </li>

      {user && (
        <li>
          <Link to={`/${user.role}Dashboard`}>Dashboard</Link>
        </li>
      )}
    </>
  );

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {links}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl">
          iEdu
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{links}</ul>
      </div>

      <div className="navbar-end">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1 shadow-sm hover:shadow-md transition">
              <div className="avatar placeholder">
                <div className="bg-primary text-white rounded-full w-12 h-12   text-center  text-2xl  font-bold">
                  <img
                    src={user.photoURL || "https://i.ibb.co/G9wkJbX/user.webp"}
                    alt="user photo"
                  />
                </div>
              </div>
              <span className="hidden sm:block font-sm text-gray-700">
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
