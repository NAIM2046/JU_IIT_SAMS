import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import HomeLayout from "../Layouts/HomeLayout";
import LoginPage from "../Pages/LoginPage";
import Teacher from "../Components/AdminDashboard/Teacher";
import Admin from "../Components/AdminDashboard/Admin";
import Student from "../Components/AdminDashboard/Student";
import TeacherSection from "../Components/TeacherDashboard/TeacherSection";
import StudentSection from "../Components/StudentDashboard/StudentSection";
import ScheduleManage from "../Components/AdminDashboard/ScheduleManage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <div>Error</div>,
    children: [
      {
        path: "/",
        element: <HomeLayout />,
      },
      {
        path: "/login",
        element: <LoginPage></LoginPage>,
      },
      {
        path: "/addteacher",
        element: <Teacher></Teacher>,
      },
      {
        path: "/admin",
        element: <Admin></Admin>,
      },
      {
        path: "/addstudent",
        element: <Student></Student>,
      },

      {
        path: "/teacherDashboard",
        element: <TeacherSection></TeacherSection>,
      },
      {
        path: "/studentDashboard",
        element: <StudentSection></StudentSection>,
      },
    ],
  },
  {
    path: "/adminDashboard",
    element: <Admin></Admin>,
    children: [
      {
        path: "/adminDashboard/addteacher",
        element: <Teacher></Teacher>,
      },
      {
        path: "/adminDashboard/addstudent",
        element: <Student></Student>,
      },
      {
        path: "/adminDashboard/manageschedule",
        element: <ScheduleManage></ScheduleManage>,
      },
    ],
  },
]);

export default router;
