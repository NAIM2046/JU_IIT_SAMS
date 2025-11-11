import React from "react";
import axios from "axios";

const axiosPublic = axios.create({
  //baseURL: "http://localhost:5000",
  baseURL: "https://ju-iit.onrender.com",
});

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
