import { create } from "zustand";
import axios from "axios";

const Base_url = "http://localhost:5000";

const getUserFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
};

const useStroge = create((set) => ({
  classlist: [],
  teacherList: [],
  user: getUserFromLocalStorage(), // ✅ Automatically get user when store initializes

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  fetchTeacher: async () => {
    try {
      const res = await axios.get(`${Base_url}/api/auth/getTeacher`);
      console.log("Teacher data:", res.data);
      set({ teacherList: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  },

  fetchClass: async () => {
    try {
      const res = await axios.get(`${Base_url}/api/getclassandsub`);
      console.log("Class data:", res.data);
      set({ classlist: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  },
}));

export default useStroge;
