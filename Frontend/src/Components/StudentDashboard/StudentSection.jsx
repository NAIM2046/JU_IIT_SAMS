import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { IoMenuOutline } from "react-icons/io5";
import {
  FaAd,
  FaBook,
  FaCalendar,
  FaHome,
  FaList,
  FaMinus,
  FaShoppingCart,
  FaUser,
  FaUsers,
  FaUtensils,
} from "react-icons/fa";
import useStroge from "../../stroge/useStroge";
//import useAdmin from "../useMenu/useAdmin";
const StudentSection = () => {
  const { user } = useStroge();
  console.log(user);
  const isAdmin = true;
  return (
    <div className="flex">
      <div className="w-64 min-h-screen bg-orange-400">
        <ul className="menu p-4">
          {isAdmin ? (
            <>
              <li>
                <NavLink to="/dashboard/adminHome">
                  <FaHome></FaHome> Admin Home
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/addItems">
                  <FaUtensils></FaUtensils> Add Items
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/manageItems">
                  <FaList></FaList> Manage Items
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/bookings">
                  <FaBook></FaBook>Manage Bookings
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/users">
                  <FaUsers></FaUsers> All Users
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/dashboard/userHome">
                  {" "}
                  <FaHome></FaHome> User Home
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/reservation">
                  {" "}
                  <FaCalendar></FaCalendar> Reservation
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/card">
                  {" "}
                  <FaShoppingCart></FaShoppingCart> My Card
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/review">
                  {" "}
                  <FaAd></FaAd>Add Review
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/booking">
                  {" "}
                  <FaList></FaList> My Booking
                </NavLink>
              </li>
            </>
          )}
          <div className="divider"></div>
          <li>
            <NavLink to="/">
              {" "}
              <FaHome></FaHome> Home
            </NavLink>
          </li>

          <li>
            <NavLink to="/menu">
              {" "}
              <IoMenuOutline /> Menu
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="flex-1">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default StudentSection;
