import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const SecondExaminerMange = () => {
  const { selectedCommittee } = useOutletContext();
  const AxiosSecure = useAxiosPrivate();

  const [teacherList, setTeacherList] = useState([]);
  const [classInfo, setClassInfo] = useState({});
  const [subjectTeacherMap, setSubjectTeacherMap] = useState({});
  const [firstExaminerInfo, setFirstExaminerInfo] = useState({});
  const [existingExaminer, setExistingExaminer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [thirdExaminerInfo, setThirdExaminerInfo] = useState({});
  const fetchThirdExaminerInfo = async () => {
    if (!selectedCommittee) return;
    try {
      const result = await AxiosSecure.get(
        `/api/finalmark/getDiffStudentsBySubject/${selectedCommittee.classId}/${selectedCommittee.batchNumber}`
      );

      setThirdExaminerInfo(result.data);
    } catch (err) {
      console.error("Error fetching third examiner info:", err);
    }
  };

  const fetchFirstExaminerInfo = async () => {
    if (!selectedCommittee) return;
    try {
      const result = await AxiosSecure.get(
        `/api/getschedule/${selectedCommittee.classId}`
      );

      const filtered = result.data.filter(
        (item) =>
          item.batchNumber === selectedCommittee.batchNumber &&
          item.classId === selectedCommittee.classId
      );

      const infoMap = {};
      filtered.forEach((item) => {
        if (!infoMap[item.subject.code]) {
          infoMap[item.subject.code] = {
            firstExaminer: item.teacherName,
            firstExaminerId: item.teacherId,
          };
        }
      });

      setFirstExaminerInfo(infoMap);
    } catch (err) {
      console.error("Error fetching first examiner info:", err);
    }
  };

  const fetchTeacher = async () => {
    try {
      const result = await AxiosSecure.get("/api/auth/getTeacher");
      console.log(result);
      const activeTeacher = result.data.filter((item) => item.active === true);
      setTeacherList(activeTeacher);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const fetchCourseInfo = async () => {
    if (!selectedCommittee) return;
    try {
      const result = await AxiosSecure.get("/api/getclassandsub");
      const filterData = result.data.find(
        (data) =>
          data.class === selectedCommittee.classId &&
          data.batchNumber === selectedCommittee.batchNumber
      );
      setClassInfo(filterData || {});
    } catch (err) {
      console.error("Error fetching class info:", err);
    }
  };
  console.log(classInfo);

  const fetchExistingExaminer = async () => {
    if (!selectedCommittee) return;
    try {
      const result = await AxiosSecure.get(
        `/api/examCommittee/getExaminerall/${selectedCommittee.classId}/${selectedCommittee.batchNumber}`
      );
      console.log(result.data);
      setExistingExaminer(result.data);

      const prefillMap = {};
      result.data.forEach((exam) => {
        prefillMap[exam.subject] = {
          first: exam.firstExaminerId
            ? {
                teacherId: exam.firstExaminerId,
                teacherName: exam.firstExaminer,
                firstExaminerSubmit: exam?.firstExaminerSubmit ? true : false,
                firstExaminerUpdate: exam?.firstExaminerUpdate ? true : false,
              }
            : null,
          second: exam.secondExaminerId
            ? {
                teacherId: exam.secondExaminerId,
                teacherName: exam.secondExaminer,
                secondExaminerSubmit: exam.secondExaminerSubmit ? true : false,
                secondExaminerUpdate: exam.secondExaminerUpdate ? true : false,
              }
            : null,
          third: exam.thirdExaminerId
            ? {
                teacherId: exam.thirdExaminerId,
                teacherName: exam.thirdExaminer,
                thirdExaminerSubmit: exam.thirdExaminerSubmit ? true : false,
                thirdExaminerUpdate: exam.thirdExaminerUpdate ? true : false,
              }
            : null,
        };
      });
      setSubjectTeacherMap(prefillMap);
    } catch (err) {
      console.error("Error fetching existing examiners:", err);
      // optionally: setError("Failed to fetch examiners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTeacher();
    fetchCourseInfo();
    setSubjectTeacherMap({});
    fetchFirstExaminerInfo();
    fetchExistingExaminer();
    fetchThirdExaminerInfo();
  }, [selectedCommittee]);

  console.log(subjectTeacherMap);

  const handleTeacherChange = (subjectCode, teacherId, examinerType) => {
    const teacher = teacherList.find((t) => t._id === teacherId);

    // Prevent same as First Examiner
    if (teacher?.name === firstExaminerInfo[subjectCode]?.firstExaminer) {
      alert("Cannot assign same teacher as First Examiner!");
      return;
    }

    setSubjectTeacherMap((prev) => ({
      ...prev,
      [subjectCode]: {
        ...prev[subjectCode],
        [examinerType]: teacher
          ? { teacherId: teacher._id, teacherName: teacher.name }
          : null,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!classInfo.subjects) return;

    setSubmitting(true);
    const payload = classInfo.subjects.map((subject) => ({
      classId: selectedCommittee.classId,
      batchNumber: selectedCommittee.batchNumber,
      subject: subject.code.trim(),
      firstExaminer: firstExaminerInfo[subject.code]?.firstExaminer || null,
      firstExaminerId: firstExaminerInfo[subject.code]?.firstExaminerId || null,
      secondExaminer:
        subjectTeacherMap[subject.code]?.second?.teacherName || null,
      secondExaminerId:
        subjectTeacherMap[subject.code]?.second?.teacherId || null,
      thirdExaminer:
        subjectTeacherMap[subject.code]?.third?.teacherName || null,
      thirdExaminerId:
        subjectTeacherMap[subject.code]?.third?.teacherId || null,
      firstExaminerUpdate:
        subjectTeacherMap[subject.code]?.first?.firstExaminerUpdate ?? true,
      secondExaminerUpdate:
        subjectTeacherMap[subject.code]?.second?.secondExaminerUpdate ?? true,
      thirdExaminerUpdate:
        subjectTeacherMap[subject.code]?.third?.thirdExaminerUpdate ?? true,
      firstExaminerSubmit:
        subjectTeacherMap[subject.code]?.first?.firstExaminerSubmit ?? false,
      secondExaminerSubmit:
        subjectTeacherMap[subject.code]?.second?.secondExaminerSubmit ?? false,
      thirdExaminerSubmit:
        subjectTeacherMap[subject.code]?.third?.thirdExaminerSubmit ?? false,
    }));
    console.log(payload);

    try {
      const res = await AxiosSecure.post(
        "/api/examCommittee/examiner_Add_Update",
        payload
      );
      if (res.status === 200 || res.status === 201) {
        alert("Second examiners saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save second examiners:", err);
      alert("Failed to save second examiners!");
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedCommittee)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading committee information...</p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading examiner data...</p>
        </div>
      </div>
    );
  //console.log(thirdExaminerInfo);
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Examiner Management
        </h2>

        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Class Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Class</p>
              <p className="font-semibold">{classInfo?.class || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Batch</p>
              <p className="font-semibold">{classInfo?.batchNumber || "N/A"}</p>
            </div>
          </div>
        </div>

        {classInfo.subjects &&
          classInfo.subjects.map((subject) => (
            <div
              key={subject.code}
              className="p-4 border rounded-lg mb-6 shadow-sm bg-gray-50"
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {subject.title} ({subject.code})
              </h4>

              {/* First Examiner */}
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">First Examiner:</span>{" "}
                {firstExaminerInfo[subject.code]?.firstExaminer ||
                  "Not Assigned"}
              </p>

              {/* SECOND EXAMINER */}
              <div className="mt-2">
                <label
                  htmlFor={`second-${subject.code}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Second Examiner
                </label>
                <select
                  id={`second-${subject.code}`}
                  value={
                    subjectTeacherMap[subject.code]?.second?.teacherId || ""
                  }
                  onChange={(e) =>
                    handleTeacherChange(subject.code, e.target.value, "second")
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a teacher</option>
                  {teacherList.map((t) => (
                    <option
                      disabled={
                        t.name ===
                        firstExaminerInfo[subject.code]?.firstExaminer
                      }
                      key={t._id}
                      value={t._id}
                    >
                      {t.name}
                      {t.name === firstExaminerInfo[subject.code]?.firstExaminer
                        ? " (First Examiner - cannot select)"
                        : ""}
                    </option>
                  ))}
                </select>
                {subjectTeacherMap[subject.code]?.second?.teacherName && (
                  <p className="mt-1 text-sm text-green-600">
                    Selected:{" "}
                    {subjectTeacherMap[subject.code].second.teacherName}
                  </p>
                )}
              </div>

              {/* THIRD EXAMINER */}
              {thirdExaminerInfo[subject.code] > 0 &&
                subjectTeacherMap[subject.code]?.first?.firstExaminerSubmit &&
                subjectTeacherMap[subject.code]?.second
                  ?.secondExaminerSubmit && (
                  <div className="mt-4">
                    <label
                      htmlFor={`third-${subject.code}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Select Third Examiner
                    </label>
                    <p>
                      {" "}
                      Number of students: {thirdExaminerInfo[subject.code]}
                    </p>
                    <select
                      id={`third-${subject.code}`}
                      value={
                        subjectTeacherMap[subject.code]?.third?.teacherId || ""
                      }
                      onChange={(e) =>
                        handleTeacherChange(
                          subject.code,
                          e.target.value,
                          "third"
                        )
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a teacher</option>
                      {teacherList.map((t) => (
                        <option
                          disabled={
                            t.name ===
                            firstExaminerInfo[subject.code]?.firstExaminer
                          }
                          key={t._id}
                          value={t._id}
                        >
                          {t.name}
                          {t.name ===
                          firstExaminerInfo[subject.code]?.firstExaminer
                            ? " (First Examiner - cannot select)"
                            : ""}
                        </option>
                      ))}
                    </select>
                    {subjectTeacherMap[subject.code]?.third?.teacherName && (
                      <p className="mt-1 text-sm text-green-600">
                        Selected:{" "}
                        {subjectTeacherMap[subject.code].third.teacherName}
                      </p>
                    )}
                  </div>
                )}
            </div>
          ))}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || !classInfo.subjects}
            className={`px-6 py-2 rounded-md text-white font-medium ${submitting || !classInfo.subjects ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} transition-colors`}
          >
            {submitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Second Examiners"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondExaminerMange;
