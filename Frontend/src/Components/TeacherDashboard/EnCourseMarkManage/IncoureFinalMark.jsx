import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { FiSave, FiDownload, FiUser } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import useStroge from "../../../stroge/useStroge";

const IncourseFinalMark = () => {
  const location = useLocation();
  const classId = location.state?.classId;
  const subjectCode = location.state?.subjectCode.code;
  const type = location.state?.subjectCode.type;
  const batchNumber = location.state?.batchNumber;

  const { user } = useStroge();
  // console.log(batchNumber);

  const [finalList, setFinalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [fullmark, setFullMark] = useState(type === "Lab" ? 60 : 40);
  const [error, setError] = useState(null);

  const AxiosSecure = useAxiosPrivate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AxiosSecure.get(
          `/api/incoursemark/finalincouremark/${classId}/${subjectCode}/${batchNumber}`
        );
        console.log(res.data);
        setFinalList(res.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [AxiosSecure, classId, subjectCode]);

  const typeColumns = Array.from(
    new Set(
      finalList.flatMap((student) => student.mark.map((m) => m.typeNumber))
    )
  ).sort();


  const computeTotalFinalMark = (marks) => {
    let totalObtained = 0;
    let totalFullMark = 0;

    marks.forEach((m) => {
      totalObtained += m.mark;
      totalFullMark += m.fullMark;
    });

    if (totalFullMark === 0) return "0.00";
    return ((totalObtained / totalFullMark) * fullmark).toFixed(2);
  };

  const handleSaveFinalMarks = async () => {
    try {
      setSaving(true);
      const payload = {
        classId,
        subjectCode,
        type: "incoursefinal",
        Number: 1,
        teacherId: user._id,
        fullMark: parseInt(fullmark),
        batchNumber,
        marks: finalList.map((student) => ({
          studentId: student.studentId,
          mark: parseFloat(computeTotalFinalMark(student.mark)),
        })),
      };

      const res = await AxiosSecure.post(
        "/api/incoursemark/add_update_incourse_Mark",
        payload
      );

      if (res.data) {
        alert("✅ Final marks saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save final marks", err);
      alert("❌ Failed to save final marks.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCSV = () => {
    if (finalList.length === 0) {
      alert("No data to download.");
      return;
    }

    setDownloading(true);
    try {
      const headers = [
        "Roll",
        "Name",
        ...typeColumns.map((type) => `${type} `),
        `Total (${fullmark})`,
      ];

      const rows = finalList.map((student) => {
        const markValues = typeColumns.map((type) => {
          const markObj = student.mark.find((m) => m.typeNumber === type);
          return markObj ? `${markObj.mark}--${markObj.fullMark}` : "-";
        });

        return [
          student.class_roll,
          student.name,
          ...markValues,
          computeTotalFinalMark(student.mark),
        ];
      });

      const csvContent = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `FinalMarks_${classId}_${subjectCode}_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating CSV:", err);
      alert("Failed to generate CSV file.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="justify-center">
          {" "}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Final Marks Summary
          </h1>
          <p className="text-gray-600 mb-6">
            Class: <span className="font-semibold">{classId}</span> | Subject:{" "}
            <span className="font-semibold">{subjectCode}</span> | Type:{" "}
            <span className="font-semibold">{type}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <label className="mr-2 font-medium text-gray-700">Full Mark:</label>
            <input
              type="number"
              value={fullmark}
              onChange={(e) => setFullMark(e.target.value)}
              className="border border-gray-300 px-3 py-1 rounded w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveFinalMarks}
              disabled={saving || finalList.length === 0}
              className={`flex items-center px-4 py-2 rounded-md transition ${saving || finalList.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              {saving ? (
                <ClipLoader size={18} color="#ffffff" className="mr-2" />
              ) : (
                <FiSave className="mr-2" />
              )}
              {saving ? "Saving..." : "Save Marks"}
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={downloading || finalList.length === 0}
              className={`flex items-center px-4 py-2 rounded-md transition ${downloading || finalList.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
                }`}
            >
              {downloading ? (
                <ClipLoader size={18} color="#ffffff" className="mr-2" />
              ) : (
                <FiDownload className="mr-2" />
              )}
              {downloading ? "Preparing..." : "Download CSV"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <ClipLoader size={40} color="#3B82F6" />
            <span className="ml-3 text-gray-600">Loading marks data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : finalList.length === 0 ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  No final marks found for this class and subject.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Roll
                  </th>
                  {typeColumns.map((type, idx) => (
                    <th
                      key={idx}
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Test {type}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total <span className="text-gray-400">({fullmark})</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {finalList.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.photoURL ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.photoURL}
                              alt={student.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class_roll}
                    </td>
                    {typeColumns.map((type, idx) => {
                      const markObj = student.mark.find(
                        (m) => m.typeNumber === type
                      );
                      return (
                        <td
                          key={idx}
                          className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                        >
                          {markObj ? (
                            <>
                              <span className="font-medium">
                                {markObj.mark}
                              </span>{" "}
                              <span className="text-gray-400">
                                / {markObj.fullMark}
                              </span>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {computeTotalFinalMark(student.mark)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncourseFinalMark;
