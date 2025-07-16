import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const IncourseFinalMark = () => {
  const location = useLocation();
  const classId = location.state?.classId;
  const subjectCode = location.state?.subjectCode.code;
  const type = location.state?.subjectCode.type;

  const [finalList, setFinalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullmark, setFullMark] = useState(0);
  console.log(type);

  const AxiosSecure = useAxiosPrivate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await AxiosSecure.get(
          `/api/incoursemark/finalincouremark/${classId}/${subjectCode}`
        );
        setFinalList(res.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setFullMark(type === "Lab" ? 60 : 40);
  }, [AxiosSecure, classId, subjectCode]);

  const typeColumns = Array.from(
    new Set(
      finalList.flatMap((student) => student.mark.map((m) => m.typeNumber))
    )
  );

  // 📝 Modified to compute scaled mark
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
      const payload = {
        classId,
        subjectCode,
        type: "incoursefinal",
        Number: 1,
        fullMark: parseInt(fullmark),
        marks: finalList.map((student) => ({
          studentId: student.studentId,
          mark: parseFloat(computeTotalFinalMark(student.mark)),
        })),
      };

      console.log("Saving final marks:", payload);

      const res = await AxiosSecure.post(
        "/api/incoursemark/addAttendanceMark",
        payload
      );

      if (res.data) {
        alert("✅ Final marks saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save final marks", err);
      alert("❌ Failed to save final marks.");
    }
  };

  // Function to handle downloading the table data as CSV
  const handleDownloadCSV = () => {
    if (finalList.length === 0) {
      alert("No data to download.");
      return;
    }

    // Create CSV headers
    const headers = [
      "Roll",
      "Name",
      ...typeColumns.map((type) => `${type}`),
      `Total (${fullmark})`,
    ];

    // Create CSV rows
    const rows = finalList.map((student) => {
      const markValues = typeColumns.map((type) => {
        const markObj = student.mark.find((m) => m.typeNumber === type);
        return markObj ? `${markObj.mark}--${parseFloat(markObj.fullMark)}` : 0;
      });

      return [
        student.class_roll,
        student.name,
        ...markValues,
        computeTotalFinalMark(student.mark),
      ];
    });
    console.log(rows);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `FinalMarks_${classId}_${subjectCode}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  console.log(finalList);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Final Marks for {classId} - {subjectCode}
      </h1>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Set Full Mark:</label>
        <input
          type="number"
          value={fullmark}
          onChange={(e) => setFullMark(e.target.value)}
          className="border px-2 py-1 rounded w-24"
          min="1"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : finalList.length === 0 ? (
        <p className="text-gray-500">No final marks found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-4">Photo</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Roll</th>
                  {typeColumns.map((type, idx) => (
                    <th key={idx} className="py-2 px-4">
                      {type}
                    </th>
                  ))}
                  <th className="py-2 px-4">Total ({fullmark})</th>
                </tr>
              </thead>
              <tbody>
                {finalList.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-2 px-4">
                      <img
                        src={student.photoURL}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="py-2 px-4">{student.name}</td>
                    <td className="py-2 px-4">{student.class_roll}</td>
                    {typeColumns.map((type, idx) => {
                      const markObj = student.mark.find(
                        (m) => m.typeNumber === type
                      );
                      return (
                        <td key={idx} className="py-2 px-4 text-center">
                          {markObj
                            ? `${markObj.mark} / ${markObj.fullMark}`
                            : "-"}
                        </td>
                      );
                    })}
                    <td className="py-2 px-4 font-semibold text-center">
                      {computeTotalFinalMark(student.mark)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSaveFinalMarks}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              💾 Save Final Marks
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              ⬇️ Download as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default IncourseFinalMark;
