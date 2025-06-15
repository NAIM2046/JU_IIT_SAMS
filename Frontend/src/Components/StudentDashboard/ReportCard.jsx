import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 15, // Reduced padding
    fontFamily: "Helvetica",
    lineHeight: 1.2, // Tighter line spacing
  },
  header: {
    alignItems: "center",
    marginBottom: 8, // Reduced spacing
  },
  logo: {
    width: 60, // Smaller logo
    height: 60,
    marginBottom: 5, // Less margin
  },
  title: {
    fontSize: 18, // Slightly smaller
    fontWeight: "bold",
    marginBottom: 3, // Reduced
    color: "#2c3e50",
  },
  schoolName: {
    fontSize: 12, // Smaller
    fontWeight: "bold",
  },
  address: {
    fontSize: 9, // Smaller
    color: "#555",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 5, // Reduced spacing
  },
  studentSection: {
    flexDirection: "row",
    marginBottom: 8, // Reduced
    //gap: 8, // Use gap instead of margins
  },
  studentImage: {
    width: 70, // Smaller image
    height: 90,
    borderRadius: 4,
  },
  studentDetails: {
    flex: 1,
    fontSize: 11, // Slightly smaller
    lineHeight: 1.2, // Tighter
  },
  badgeText: {
    marginTop: 4, // Reduced
    fontWeight: "bold",
    color: "#27ae60",
    fontSize: 10, // Smaller
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 12, // Smaller
    marginBottom: 5, // Reduced
    color: "#34495e",
  },
  subjectCard: {
    marginBottom: 6, // Reduced
    borderLeft: "2px solid #3498db",
    paddingLeft: 8, // Less padding
  },
  subjectName: {
    fontWeight: "bold",
    fontSize: 11, // Smaller
    marginBottom: 3, // Reduced
  },
  examItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2, // Reduced
    fontSize: 10, // Smaller
  },
  totalText: {
    marginTop: 6, // Reduced
    fontSize: 11, // Smaller
    fontWeight: "bold",
    textAlign: "right",
  },
  compactText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
const ReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {typeof data?.school?.logo === "string" && data.school.logo && (
          <Image src={data.school.logo} style={styles.logo} />
        )}
        <Text style={styles.title}>ACADEMIC REPORT CARD</Text>
        <Text style={styles.schoolName}>
          {String(data?.school?.name || "")}
        </Text>
        <Text style={styles.address}>
          {String(data?.school?.address || "")}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Student Info */}
      <View style={styles.studentSection}>
        {typeof data?.student?.photo === "string" && data.student.photo && (
          <Image src={data.student.photo} style={styles.studentImage} />
        )}
        <View style={styles.studentDetails}>
          <Text>Name: {String(data?.student?.name || "")}</Text>
          <Text>Roll: {String(data?.student?.roll || "")}</Text>
          <Text>Class: {String(data?.student?.class || "")}</Text>
          <Text>Rank: {String(data?.student?.rank || "")}</Text>
          <Text style={styles.badgeText}>
            {String(data?.badge?.title || "")} -{" "}
            {String(data?.badge?.remark || "")}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Subjects List */}
      <Text style={styles.sectionTitle}>Subject Performance:</Text>

      {Array.isArray(data?.subjects) &&
        data.subjects.map((subject, sIndex) => (
          <View key={`sub-${sIndex}`} style={styles.subjectCard}>
            <Text style={styles.subjectName}>
              {String(subject?.name || "Unnamed Subject")}
            </Text>
            {Array.isArray(subject.exams) &&
              subject.exams.map((exam, eIndex) => {
                const full = Number(exam.fullMark || 0);
                const obtained = Number(exam.obtained || 0);
                const percent =
                  full > 0 ? Math.round((obtained / full) * 100) : 0;

                return (
                  <View
                    key={`exam-${sIndex}-${eIndex}`}
                    style={styles.examItem}
                  >
                    <Text>{String(exam?.examName || "Unnamed Exam")}</Text>
                    <Text>
                      {obtained}/{full} ({percent}%)
                    </Text>
                  </View>
                );
              })}
          </View>
        ))}

      <Text style={styles.totalText}>
        Total: {String(data?.totalObtainedMark || 0)}/
        {String(data?.totalFullMark || 0)}
      </Text>
    </Page>
  </Document>
);

const ReportCard = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const classNumber = user.class;
  const [ranklist, setRanklist] = useState([]);
  const [Subjects, setSubjects] = useState([]);

  useEffect(() => {
    AxiosSecure.get(`/api/exam/rank_summary/${classNumber}`).then((res) => {
      setRanklist(res.data);
    });
  }, []);

  const currentStudentRank = ranklist.find(
    (student) => student._id === user._id
  );

  console.log(currentStudentRank);
  useEffect(() => {
    if (user?.class && user?._id) {
      AxiosSecure.get(
        `/api/exam/subject-marks?classNumber=${user.class}&Id=${user._id}`
      ).then((res) => {
        console.log(res.data);
        console.log("hiii");
        setSubjects(res.data);
      });
    }
  }, []);
  console.log(Subjects);

  // console.log(user);
  const data = {
    school: {
      name: "RDF Model School",
      address: "45/3 RDF Road, Rajshahi, Bangladesh",
      logo: "https://i.ibb.co/DDfmZ3Zx/partner5-png.png",
    },
    student: {
      name: user.name,
      roll: user.roll,
      class: user.class,
      rank: currentStudentRank?.rank,
      photo: user.photoURL || "https://i.ibb.co/G9wkJbX/user.webp",
    },
    badge: (() => {
      const percentage = Math.round(
        (currentStudentRank?.totalGetMarks /
          currentStudentRank?.totalFullMark) *
          100
      );

      if (percentage >= 80) {
        return {
          title: "Golden Badge",
          remark: "Outstanding Academic Excellence",
        };
      } else if (percentage >= 51) {
        return {
          title: "Silver Badge",
          remark: "Great Academic Performance",
        };
      } else {
        return {
          title: "Bronze Badge",
          remark: "Needs Improvement – Keep Working!",
        };
      }
    })(),
    totalFullMark: currentStudentRank?.totalFullMark,
    totalObtainedMark: currentStudentRank?.totalGetMarks,
    subjects: Subjects,
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-xl border border-gray-100">
      {/* School Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 mb-8 flex items-center justify-between border-b-2 border-blue-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <img
              src={data.school.logo}
              alt="School Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 font-serif tracking-tight">
              {data.school.name}
            </h2>
            <p className="text-sm text-gray-600">{data.school.address}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-gray-500">Academic Year</div>
          <div className="text-sm font-semibold text-blue-700">2023-2024</div>
        </div>
      </div>

      {/* Title */}
      <div className="relative mb-8 text-center">
        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
        <h1 className="relative inline-block px-4 py-2 bg-white text-3xl font-bold text-gray-800 font-serif tracking-wide">
          <span className="text-blue-600">STUDENT</span> REPORT CARD
        </h1>
      </div>

      {/* Student Info */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0 relative">
          <img
            src={data.student.photo}
            alt="student"
            className="w-28 h-32 object-cover rounded-lg shadow-md border-4 border-white ring-2 ring-blue-100"
          />
          <div className="absolute -top-3 -right-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {data.student.rank}
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Student Name</p>
              <p className="font-semibold text-gray-800">{data.student.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Roll Number</p>
              <p className="font-semibold text-gray-800">{data.student.roll}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Class/Grade</p>
              <p className="font-semibold text-gray-800">
                {data.student.class}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Class Rank</p>
              <p className="font-semibold text-gray-800">{data.student.rank}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500">
              Achievement Badge
            </p>
            <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <span className="text-green-700 font-semibold">
                {data.badge.title}
              </span>
              <span className="text-xs text-green-600">
                ({data.badge.remark})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Subject Performance
        </h3>

        <div className="space-y-4">
          {data.subjects.map((subject, sIndex) => (
            <div key={sIndex} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                {subject.name}
              </h4>

              <div className="space-y-2">
                {subject.exams.map((exam, eIndex) => {
                  const percentage = Math.round(
                    (exam.obtained / exam.fullMark) * 100
                  );
                  return (
                    <div
                      key={eIndex}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="font-medium text-gray-700">
                        {exam.examName}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">
                          {exam.obtained}/{exam.fullMark}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            percentage >= 80
                              ? "bg-green-100 text-green-800"
                              : percentage >= 50
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Marks */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Overall Performance
            </p>
            <p className="text-xs text-gray-500">Based on all examinations</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Total Marks</p>
            <p className="text-2xl font-bold text-blue-700">
              {data.totalObtainedMark}
              <span className="text-lg text-gray-500">
                /{data.totalFullMark}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* PDF Button */}
      <div className="text-center mt-8">
        <PDFDownloadLink
          document={<ReportPDF data={data} />}
          fileName={`${data.student.name}_Report_Card.pdf`}
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
        >
          {({ loading }) =>
            loading ? "Generating PDF..." : "Download Report Card"
          }
        </PDFDownloadLink>
      </div>
      {/* Footer */}
    </div>
  );
};

export default ReportCard;
