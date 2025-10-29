import { useEffect, useState } from "react";
import useStroge from "../../../stroge/useStroge";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const FailSubjectList = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useStroge();
    const studentId = user?._id;
    const AxiosSecure = useAxiosPrivate();

    useEffect(() => {
        const fetchFailSubjects = async () => {
            try {
                setLoading(true);
                const response = await AxiosSecure.get(`/api/final-results/getFailSubjects/${studentId}`);
                setSubjects(response.data);
            } catch (error) {
                console.error("Error fetching fail subjects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFailSubjects();
    }, [studentId, AxiosSecure]);

    if (loading) {
        return (
            <div className="min-h-64 bg-white rounded-lg shadow-md flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your academic record...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Subjects Requiring Attention
                        </h2>
                        <p className="text-red-100 text-sm mt-1">
                            These subjects need to be retaken
                        </p>
                    </div>
                    <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {subjects.length}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {subjects.length > 0 ? (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-800 text-sm font-medium">
                                    You need to retake these subjects in the next semester
                                </p>
                            </div>
                        </div>

                        {/* Subjects List */}
                        <div className="grid gap-3">
                            {subjects.map((subject, index) => (
                                <div 
                                    key={index} 
                                    className="border border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {subject.subjectName}
                                            </h3>
                                            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                                    </svg>
                                                    Class: {subject.classId}
                                                </span>
                                                {subject.subjectCode && (
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                                                            <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                                                        </svg>
                                                        Code: {subject.subjectCode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                Failed
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                      
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellent Progress!</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            You have no failed subjects. Keep up the good work and maintain your academic performance!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FailSubjectList;