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
import StudentRoute from "./StudentRoute";
import TeacherRoute from "./TeacherRoute";
import AdminRoute from "./AdminRoute";
import PerformanceSummary from "../Components/TeacherDashboard/PerformanceSummary";
import StudentsAttendance from "../Components/StudentDashboard/StudentsAttendance";
import Message from "../Pages/Message/Message";
import EnCourseMarkHome from "../Components/TeacherDashboard/EnCourseMarkManage/EnCourseMarkHome";
import AttendanceMark from "../Components/TeacherDashboard/EnCourseMarkManage/AttendanceMark";
import LabPerformance from "../Components/TeacherDashboard/EnCourseMarkManage/LabPerformance";
import OtherTasks from "../Components/TeacherDashboard/EnCourseMarkManage/OtherTasks";
import IncoureFinalMark from "../Components/TeacherDashboard/EnCourseMarkManage/IncoureFinalMark";
import AttendanceSummaryHome from "../Components/TeacherDashboard/TeacherAttendanceSummary/AttendanceSummaryHome";
import AttendanceSummary from "../Components/TeacherDashboard/TeacherAttendanceSummary/AttendanceSummary";
import AddNewBatchandUpdate from "../Components/AdminDashboard/BatchMangement/AddNewBatchandUpdate";
import ExamCommitteeManage from "../Components/AdminDashboard/BatchMangement/ExamCommitteeManage";
import EveryClass from "../Components/TeacherDashboard/TeacherClassManage/EveryClass";
import QestionTamplateHome from "../Components/AdminDashboard/CreateQuestionTamplate/QestionTamplateHome";
import FinalmarkHome from "../Components/TeacherDashboard/TeacherFinalMark/FinalmarkHome";
import FinalmarkInput from "../Components/TeacherDashboard/TeacherFinalMark/FinalmarkInput";
import ExamCommitteeDashboard from "../Components/ExamCommitteeDashboard/ExamCommitteeDashboard";
import ExamCommitteeRoute from "./ExamCommitteeRoute";
import SecondExaminerMange from "../Components/ExamCommitteeDashboard/SecondExaminerMange";
import ResultApprovalHome from "../Components/ExamCommitteeDashboard/ResultApproval/ResultApprovalHome";

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
    element: (
      <AdminRoute>
        <Admin></Admin>
      </AdminRoute>
    ),
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
      {
        path: "/adminDashboard/batchManagement",
        element: <AddNewBatchandUpdate></AddNewBatchandUpdate>,
      },
      {
        path: "/adminDashboard/examCommitteeManage/:batchId",
        element: <ExamCommitteeManage></ExamCommitteeManage>,
      },
      {
        path: "/adminDashboard/QuestionTamplate",
        element: <QestionTamplateHome></QestionTamplateHome>,
      },
    ],
  },
  {
    path: "/teacherDashboard",
    element: (
      <TeacherRoute>
        <TeacherSection></TeacherSection>
      </TeacherRoute>
    ),
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
      {
        path: "/teacherDashboard/performanceSummary",
        element: <PerformanceSummary></PerformanceSummary>,
      },
      {
        path: "/teacherDashboard/manageIncoursemark",
        element: <EnCourseMarkHome></EnCourseMarkHome>,
      },
      {
        path: "/teacherDashboard/attendancemark",
        element: <AttendanceMark></AttendanceMark>,
      },
      {
        path: "/teacherDashboard/performanceMarks",
        Component: LabPerformance,
      },
      {
        path: "/teacherDashboard/incoursemark/:taskType",
        element: <OtherTasks></OtherTasks>,
      },
      {
        path: "/teacherDashboard/incoursefinalmark/:subjectCode",
        element: <IncoureFinalMark></IncoureFinalMark>,
      },
      {
        path: "/teacherDashboard/viewAttendanceSummary",
        element: <AttendanceSummaryHome></AttendanceSummaryHome>,
      },
      {
        path: "/teacherDashboard/viewAttendanceSummary/:className/:subjectCode",
        element: <AttendanceSummary></AttendanceSummary>,
      },
      {
        path: "/teacherDashboard/finalMarkInput",
        element: <FinalmarkHome></FinalmarkHome>,
      },
      {
        path: "/teacherDashboard/finalMarkInput/:classId/:subjectCode/:batchNumber/:examiner",
        element: <FinalmarkInput></FinalmarkInput>,
      },
    ],
  },
  {
    path: "/studentDashboard",
    element: (
      <StudentRoute>
        <StudentSection></StudentSection>
      </StudentRoute>
    ),
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
      {
        path: "/studentDashboard/attendance",
        element: <StudentsAttendance></StudentsAttendance>,
      },
    ],
  },
  {
    path: "/messages",
    element: <Message></Message>,
  },
  {
    path: "/ExamCommitteeDashboard",
    element: (
      <ExamCommitteeRoute>
        <ExamCommitteeDashboard></ExamCommitteeDashboard>
      </ExamCommitteeRoute>
    ),
    children: [
      {
        path: "/ExamCommitteeDashboard/SecondExaminerAdd",
        element: <SecondExaminerMange></SecondExaminerMange>,
      },
      {
        path: "/ExamCommitteeDashboard/ApprovedResult",
        element: <ResultApprovalHome></ResultApprovalHome>,
      },
    ],
  },
]);

export default router;
