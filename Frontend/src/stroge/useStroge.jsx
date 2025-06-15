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
  user: getUserFromLocalStorage(),
  userLoading: false, // ✅ Added loading state
  error: null, // ✅ Added error state

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, userLoading: false, error: null });
  },

  clearUser: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, userLoading: false, error: null });
  },

  fetchTeacher: async () => {
    try {
      set({ userLoading: true });
      const res = await axios.get(`${Base_url}/api/auth/getTeacher`);
      console.log("Teacher data:", res.data);
      set({
        teacherList: Array.isArray(res.data) ? res.data : [],
        userLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch teachers",
        userLoading: false,
      });
    }
  },

  fetchClass: async () => {
    try {
      set({ userLoading: true });
      const res = await axios.get(`${Base_url}/api/getclassandsub`);
      console.log("Class data:", res.data);
      set({
        classlist: Array.isArray(res.data) ? res.data : [],
        userLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch classes",
        userLoading: false,
      });
    }
  },

  // Optional: Add a method to explicitly set loading state
  setUserLoading: (isLoading) => set({ userLoading: isLoading }),
}));

export default useStroge;
