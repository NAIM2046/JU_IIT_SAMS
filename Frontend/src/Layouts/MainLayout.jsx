import React, { useEffect } from "react";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { Outlet } from "react-router-dom";
import useAxiosPrivate from "../TokenAdd/useAxiosPrivate";
import useStroge from "../stroge/useStroge";

const MainLayout = () => {
  const AXiosSecure = useAxiosPrivate();
  const { setUser, user } = useStroge();
  const verifyToken = async () => {
    const token = localStorage.getItem("token");
    // const user = localStorage.getItem("user");
    // console.log("verifying token", token, user);

    if (!token) {
      // If no token, navigate to login page
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return;
    }

    try {
      const response = await AXiosSecure.get(`/api/auth/protected`);

      console.log("Token is valid:", response.data);

      setUser(user); // Assuming the response contains user data

      // Token is valid, proceed with your app logic
    } catch (error) {
      console.error("Token verification failed:", error.response.data.message);
      // If token is invalid, clear localStorage and navigate to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // You can call this function when the page loads or before making sensitive API requests.
  useEffect(() => {
    console.log("verifying token");
    verifyToken();
  }, []);
  // console.log("user", user);
  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div>
        <Outlet></Outlet>
      </div>
      <div>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default MainLayout;
