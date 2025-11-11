import React from "react";
import axios from "axios";

const axiosPrivate = axios.create({
  // baseURL: "http://localhost:5000",
  baseURL: "https://ju-iit.onrender.com",
});

const useAxiosPrivate = () => {
  axiosPrivate.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return axiosPrivate;
};

export default useAxiosPrivate;
