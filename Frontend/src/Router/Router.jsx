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
import AdminHome from "../Components/AdminDashboard/AdminHome";
import AdminClassManage from "../Components/AdminDashboard/AdminClassManage";
import TeacherHome from "../Components/TeacherDashboard/TeacherHome";
import TeacherSchedule from "../Components/TeacherDashboard/TeacherSchedule";
import EveryClass from "../Components/TeacherDashboard/EveryClass";
import AdminNotice from "../Components/AdminDashboard/AdminNotice";
import StudentHome from "../Components/StudentDashboard/StudentHome";
import StudentProfile from "../Components/StudentDashboard/StudentProfile";
import StudentSchedule from "../Components/StudentDashboard/StudentSchedule";
import StudentNotice from "../Components/StudentDashboard/StudentNotice";
import TeacherNotice from "../Components/TeacherDashboard/TeacherNotice";

import ClassHistory from "../Components/TeacherDashboard/ClassHistory";
import ExamHome from "../Pages/Exam/ExamHome";
import RankList from "../Components/StudentDashboard/RankList";
import SubjectsPer_Summ from "../Components/StudentDashboard/SubjectsPer_Summ";
import ReportCard from "../Components/StudentDashboard/ReportCard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <div>Error</div>,
  },
  {
    path: "/login",
    element: <LoginPage></LoginPage>,
  },
  {
    path: "/adminDashboard",
    element: <Admin></Admin>,
    children: [
      {
        path: "/adminDashboard",
        element: <AdminHome></AdminHome>,
      },
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
      {
        path: "/adminDashboard/classManage",
        element: <AdminClassManage></AdminClassManage>,
      },
      {
        path: "/adminDashboard/noticeManage",
        element: <AdminNotice></AdminNotice>,
      },
    ],
  },
  {
    path: "/teacherDashboard",
    element: <TeacherSection></TeacherSection>,
    children: [
      {
        path: "/teacherDashboard",
        element: <TeacherHome></TeacherHome>,
      },
      {
        path: "/teacherDashboard/schedule",
        element: <TeacherSchedule></TeacherSchedule>,
      },
      {
        path: "/teacherDashboard/Class/:class",
        element: <EveryClass></EveryClass>,
      },
      {
        path: "/teacherDashboard/notice",
        element: <TeacherNotice></TeacherNotice>,
      },
      {
        path: "/teacherDashboard/exam",
        element: <ExamHome></ExamHome>,
      },
      {
        path: "/teacherDashboard/classhistory",
        element: <ClassHistory></ClassHistory>,
      },
    ],
  },
  {
    path: "/studentDashboard",
    element: <StudentSection></StudentSection>,
    children: [
      {
        path: "/studentDashboard",
        element: <StudentHome></StudentHome>,
      },
      {
        path: "/studentDashboard/profile",
        element: <StudentProfile></StudentProfile>,
      },
      {
        path: "/studentDashboard/classroutine",
        element: <StudentSchedule></StudentSchedule>,
      },
      {
        path: "/studentDashboard/notice",
        element: <StudentNotice></StudentNotice>,
      },
      {
        path: "/studentDashboard/ranklist",
        element: <RankList></RankList>,
      },
      {
        path: "/studentDashboard/performance",
        element: <SubjectsPer_Summ></SubjectsPer_Summ>,
      },
      {
        path: "/studentDashboard/reportCard",
        element: <ReportCard></ReportCard>,
      },
    ],
  },
]);

export default router;
