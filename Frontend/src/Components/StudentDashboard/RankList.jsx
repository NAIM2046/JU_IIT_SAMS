import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const RankList = () => {
  const AxiosSecure = useAxiosPrivate();
  const [rankList, setRankList] = useState([]);
  const { user } = useStroge();
  const classNumber = user.class;

  useEffect(() => {
    AxiosSecure.get(`/api/exam/rank_summary/${classNumber}`).then((res) => {
      setRankList(res.data);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
        📊 Rank List - Class {classNumber}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Full Mark</th>
              <th className="px-6 py-3 text-left"> Get Mark</th>
              <th className="px-6 py-3 text-left">Rank</th>
            </tr>
          </thead>
          <tbody>
            {rankList.map((item, index) => {
              const isCurrentUser = item._id === user._id;
              return (
                <tr
                  key={item.userId || index}
                  className={`${
                    isCurrentUser
                      ? "bg-yellow-200 text-black font-semibold shadow-sm"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-100"
                  } hover:bg-blue-100 transition-all duration-200`}
                >
                  <td className="px-6 py-3">{index + 1}</td>
                  <td className="px-6 py-3">{item.name}</td>
                  <td className="px-6 py-3">{item.totalFullMark}</td>
                  <td className="px-6 py-3">{item.totalGetMarks}</td>
                  <td className="px-6 py-3">{item.rank}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankList;
