import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import HomeLayout from "../Layouts/HomeLayout";
import LoginPage from "../Pages/LoginPage";
import Teacher from "../Components/DashBoards/Teacher";
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
        element: <LoginPage></LoginPage>
      },
      {
        path: "/teacher",
        element: <Teacher></Teacher>
      }
    ]
  },
]);

export default router;
