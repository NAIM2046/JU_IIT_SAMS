import React, { useState, useEffect } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import Navbar from "../../Shared/Navbar";
import {
  FaHome,
  FaBars,
  FaTimes,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUser,
  FaBackward,
} from "react-icons/fa";
import { PiMarkdownLogo, PiPercent } from "react-icons/pi";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const ExamCommitteeDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useStroge();
  const location = useLocation();
  const AxiosSecure = useAxiosPrivate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [runningCommitteeList, setRunningCommitteeList] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState(null);

  // Fetch committees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await AxiosSecure.get(
          `/api/examCommittee/getTeacherInvolvementCommittee/${user._id}`
        );
        const runningList = result.data.filter((c) => c.status === "runing");
        setRunningCommitteeList(runningList);

        const urlCommitteeId = searchParams.get("committeeId");
        if (urlCommitteeId) {
          const found = runningList.find((c) => c._id === urlCommitteeId);
          if (found) {
            setSelectedCommittee(found);
            return;
          }
        }

        if (runningList.length > 0) {
          setSelectedCommittee(runningList[0]);
          setSearchParams({ committeeId: runningList[0]._id });
        }
      } catch (error) {
        console.error("Error fetching committee list", error);
      }
    };
    fetchData();
  }, [user._id, AxiosSecure]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  useEffect(() => setIsMenuOpen(false), [location]);

  const handleCommitteeChange = (e) => {
    const newCommittee = runningCommitteeList.find(
      (c) => c._id === e.target.value
    );
    if (!newCommittee) return;
    setSelectedCommittee(newCommittee);
    setSearchParams({ committeeId: newCommittee._id });
  };

  // Navigation items
  const navItems = [
    {
      path: "/ExamCommitteeDashboard",
      icon: <FaHome />,
      label: "Home",
      isActive: (p) => p === "/ExamCommitteeDashboard",
    },
    {
      path: "/ExamCommitteeDashboard/History",
      icon: <FaBackward />,
      label: "Committee History",
      isActive: (p) => p === "/ExamCommitteeDashboard/History",
    },
  ];

  if (selectedCommittee) {
    navItems.push(
      {
        path: "/ExamCommitteeDashboard/SecondExaminerAdd",
        icon: <FaUser />,
        label: "Second Examiner Add",
        isActive: (p) => p.includes("SecondExaminerAdd"),
      },
      {
        path: "/ExamCommitteeDashboard/RoutineCreate",
        icon: <FaCalendarAlt />,
        label: "Routine Create",
        isActive: (p) => p.includes("RoutineCreate"),
      },
      {
        path: "/ExamCommitteeDashboard/ResultAnalysis",
        icon: <PiPercent />,
        label: "Result Analysis",
        isActive: (p) => p.includes("ResultAnalysis"),
      },
      {
        path: "/ExamCommitteeDashboard/ApprovedResult",
        icon: <PiMarkdownLogo />,
        label: "Approved Result",
        isActive: (p) => p.includes("ApprovedResult"),
      }
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center justify-between bg-white shadow-sm p-4 border-b">
        <button
          onClick={toggleMenu}
          className="text-gray-600 hover:text-blue-600"
        >
          {isMenuOpen ? (
            <FaTimes className="text-2xl" />
          ) : (
            <FaBars className="text-2xl" />
          )}
        </button>
        <div className="flex items-center">
          <FaChalkboardTeacher className="text-blue-600 mr-2" />
          <span className="font-medium text-gray-700">Teacher Portal</span>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 fixed md:static inset-y-0 left-0 w-64 bg-white shadow-lg md:shadow-none z-40 border-r border-gray-200 overflow-y-auto`}
        >
          <div className="p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold flex items-center mb-4">
              <FaChalkboardTeacher className="mr-2 text-blue-600" />
              Exam Committee Dashboard
            </h2>

            {runningCommitteeList.length > 1 && (
              <div className="px-2 mb-4">
                <label className="text-sm text-gray-600">
                  Select Committee
                </label>
                <select
                  value={selectedCommittee?._id || ""}
                  onChange={handleCommitteeChange}
                  className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
                >
                  {runningCommitteeList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.classId} - Batch {c.batchNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === "/ExamCommitteeDashboard"}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-blue-100 text-blue-700 font-medium shadow-inner" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
                      }
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Info */}
            <div className="mt-auto p-4 border-t border-gray-200 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="text-blue-600" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                  {user?.name || "Teacher"}
                </p>
                <p className="text-xs text-gray-500">Teacher Account</p>
              </div>
            </div>
          </div>
        </aside>

        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleMenu}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)] p-6">
            <Outlet context={{ selectedCommittee }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExamCommitteeDashboard;
