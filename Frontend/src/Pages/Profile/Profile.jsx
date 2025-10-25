import React, { useState } from "react";
import useStroge from "../../stroge/useStroge";
import uploadImageToImgbb from "../../ImageUpload/ImageUpload";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const Profile = () => {
  const { user, setUser } = useStroge();
  const axiosPrivate = useAxiosPrivate();

  const [uploading, setUploading] = useState(false);
  const [showForgot, setShowForgot] = useState(true);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setMessage("Image size should be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToImgbb(file);
      await axiosPrivate.put(`api/auth/updateProfile_photo/${user._id}`, {
        photoURL: imageUrl,
      });
      setMessage("Profile photo updated successfully!");
      const updateuser = { ...user, photoURL: imageUrl };
      setUser(updateuser);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error(error);
      setMessage("Failed to update profile photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("New passwords do not match!");
      return;
    }

    try {
      await axiosPrivate.put(`/api/password/changePassword/${user._id}`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      setMessage("Password changed successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        setMessage("Old password incorrect! Please try again.");
        setShowForgot(true);
      } else {
        setMessage("Failed to change password. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and security
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Profile Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={user.photoURL || "https://i.ibb.co/G9wkJbX/user.webp"}
                    alt={user.fullname || user.name}
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                <label className="block mt-4">
                  <div className="cursor-pointer bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium">
                    Change Photo
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.fullname || user.name}
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>{user.age || "Age not set"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Teacher-specific */}
              {user.role === "teacher" && user.description && (
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {user.description}
                  </p>
                </div>
              )}

              {/* Student-specific */}
              {user.role === "student" && (
                <>
                  {[
                    { label: "Class", value: user.class },
                    { label: "Class Roll", value: user.class_roll },
                    { label: "Exam Roll", value: user.exam_roll },
                    { label: "Registration No", value: user.reg_on },
                    { label: "Hall Name", value: user.hall_name },
                    { label: "Gender", value: user.gender },
                  ].map(
                    (field, index) =>
                      field.value && (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                          </label>
                          <p className="text-gray-900 font-medium">
                            {field.value}
                          </p>
                        </div>
                      )
                  )}

                  {/* Guardian Info */}
                  {user.guardians && (
                    <div className="md:col-span-3 bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Guardian Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Father's Name
                          </label>
                          <p className="text-gray-900">
                            {user.guardians.fatherName}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mother's Name
                          </label>
                          <p className="text-gray-900">
                            {user.guardians.motherName}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <p className="text-gray-900">
                            {user.guardians.phoneNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Password Change Section */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Password
                </h3>
                <p className="text-gray-600 text-sm">
                  Update your password to keep your account secure
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
                  showPasswordForm
                    ? "bg-gray-500 text-white hover:bg-gray-600"
                    : "bg-yellow-600 text-white hover:bg-yellow-700"
                }`}
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {/* Password Change Form */}
            {showPasswordForm && (
              <form
                onSubmit={handlePasswordChange}
                className="mt-6 space-y-4 max-w-md"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.oldPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        oldPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                  >
                    Update Password
                  </button>

                  {showForgot && (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/forgotPassword";
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium transition duration-200"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center">
              {message.includes("successfully") ? (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
