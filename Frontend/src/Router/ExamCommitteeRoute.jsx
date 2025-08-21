import React from "react";
import useStroge from "../stroge/useStroge";
import { Navigate, useLocation } from "react-router-dom";

const ExamCommitteeRoute = ({ children }) => {
  const { user, userLoading } = useStroge();
  const location = useLocation();
  console.log(user);

  // Show loading indicator while checking auth status
  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user exists and has teacher role
  if (user && user.role === "teacher" && user.isCommittee) {
    return children;
  }

  // Redirect to login with return URL if not authenticated
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ExamCommitteeRoute;
