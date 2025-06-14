import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-6 text-blue-700">
          Welcome to Quality Education System
        </h1>
        <p className="text-lg mb-4 text-gray-700">
          Empowering students, teachers, and admins with smart tools.
        </p>
      </div>
    </div>
  );
};

export default Home;
