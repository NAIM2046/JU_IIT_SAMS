import React from "react";
import axios from "axios";

const axiosPublic = axios.create({
  baseURL: "http://localhost:5000",
  //baseURL: "https://juiitsams-production.up.railway.app",
});

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
