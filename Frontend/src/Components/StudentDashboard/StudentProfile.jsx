import React, { useEffect, useState } from "react";
import axios from "axios";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { FiUser, FiMail, FiCalendar, FiUsers, FiPhone } from "react-icons/fi";
import { FaTransgender, FaChalkboardTeacher, FaListOl } from "react-icons/fa";

const imgbb_api_key = "c6a562004bff421926419e6b22cec40e"; // Replace with your real ImgBB API key

const StudentProfile = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const [formData, setFormData] = useState({ ...user });
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        guardians: user.guardians || {},
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    try {
      setUploadProgress(0);
      const data = new FormData();
      data.append("image", image);

      const uploadRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${imgbb_api_key}`,
        data,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      const imageUrl = uploadRes.data.data.url;
      setFormData((prev) => ({ ...prev, photoURL: imageUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadProgress(0);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const response = await AxiosSecure.put(
        `/api/auth/updateUser/${user._id}`,
        formData
      );

      localStorage.setItem("user", JSON.stringify(response.data.data));
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <h1 className="text-2xl font-bold">Student Profile</h1>
          <p className="text-blue-100">Update your personal information</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={formData.photoURL || "/default-avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
              />
              {uploadProgress > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <span className="text-white font-medium">
                    {uploadProgress}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Photo
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-500">
                  JPG, PNG up to 2MB
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiUser className="text-gray-400" />
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  Age
                </label>
                <input
                  name="age"
                  value={formData.age || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiMail className="text-gray-400" />
                  Email
                </label>
                <input
                  name="email"
                  value={formData.email || ""}
                  disabled
                  className="border border-gray-300 rounded-md px-4 py-2 w-full bg-gray-100 text-gray-600"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaTransgender className="text-gray-400" />
                  Gender
                </label>
                <input
                  name="gender"
                  value={formData.gender || ""}
                  disabled
                  className="border border-gray-300 rounded-md px-4 py-2 w-full bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChalkboardTeacher className="text-blue-600" />
              Academic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <input
                  name="class"
                  value={formData.class || ""}
                  disabled
                  className="border border-gray-300 rounded-md px-4 py-2 w-full bg-gray-100 text-gray-600"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Section
                </label>
                <input
                  name="section"
                  value={formData.section || ""}
                  disabled
                  className="border border-gray-300 rounded-md px-4 py-2 w-full bg-gray-100 text-gray-600"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Roll Number
                </label>
                <input
                  name="roll"
                  value={formData.roll || ""}
                  disabled
                  className="border border-gray-300 rounded-md px-4 py-2 w-full bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiUsers className="text-blue-600" />
              Guardian Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Father's Name
                </label>
                <input
                  name="fatherName"
                  value={formData.guardians?.fatherName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guardians: {
                        ...(prev.guardians || {}),
                        fatherName: e.target.value,
                      },
                    }))
                  }
                  className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mother's Name
                </label>
                <input
                  name="motherName"
                  value={formData.guardians?.motherName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guardians: {
                        ...(prev.guardians || {}),
                        motherName: e.target.value,
                      },
                    }))
                  }
                  className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiPhone className="text-gray-400" />
                  Guardian Phone Number
                </label>
                <input
                  name="phoneNumber"
                  value={formData.guardians?.phoneNumber || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guardians: {
                        ...(prev.guardians || {}),
                        phoneNumber: e.target.value,
                      },
                    }))
                  }
                  className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:bg-blue-400 flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
