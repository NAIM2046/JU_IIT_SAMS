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
  FaNotesMedical,
  FaShoppingCart,
  FaUser,
  FaUsers,
  FaUtensils,
} from "react-icons/fa";
import Navbar from "../../Shared/Navbar";
//import useAdmin from "../useMenu/useAdmin";
const Admin = () => {
  return (
    <div>
      <Navbar></Navbar>
      <div className="flex">
        <div className="w-64 min-h-screen bg-orange-400">
          <ul className="menu p-4">
            <>
              <li>
                <NavLink to="/adminDashboard">
                  <FaHome></FaHome> Admin Home
                </NavLink>
              </li>

              <li>
                <NavLink to="/adminDashboard/addteacher">
                  <FaUtensils></FaUtensils> Add Teacher
                </NavLink>
              </li>

              <li>
                <NavLink to="/adminDashboard/addstudent">
                  <FaList></FaList> Add Student
                </NavLink>
              </li>
              <li>
                <NavLink to="/adminDashboard/manageschedule">
                  <FaBook></FaBook>Manage Schedule
                </NavLink>
              </li>
              <li>
                <NavLink to="/adminDashboard/classManage">
                  <FaUsers></FaUsers> Class and subject Manage
                </NavLink>
              </li>
              <li>
                <NavLink to="/adminDashboard/noticeManage">
                  <FaNotesMedical></FaNotesMedical> Notice Manage
                </NavLink>
              </li>
            </>

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
    </div>
  );
};

export default Admin;
