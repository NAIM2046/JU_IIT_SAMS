import React from "react";

const ReportCardContent = React.forwardRef(({ data }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white text-black p-6 rounded-2xl shadow-2xl border border-blue-200"
    >
      <h1 className="text-xl font-bold">Report Card</h1>
      <p>Student: {data.student.name}</p>
      <p>Roll: {data.student.roll}</p>
      <p>Class: {data.student.class}</p>
    </div>
  );
});

export default ReportCardContent;
