import React from "react";

const FinalMarkPrint = React.forwardRef(
  (
    { finalList, typeColumns, fullmark, computeTotalFinalMark, loading },
    ref
  ) => (
    <div ref={ref}>
      {loading ? (
        <p>Loading...</p>
      ) : finalList.length === 0 ? (
        <p className="text-gray-500">No final marks found.</p>
      ) : (
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
      )}
    </div>
  )
);

export default FinalMarkPrint;
