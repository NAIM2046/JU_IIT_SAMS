import React, { useEffect, useState } from "react";
import axios from "axios";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const imgbb_api_key = "c6a562004bff421926419e6b22cec40e"; // Replace with your real ImgBB API key

const StudentProfile = () => {
  const AxiosSecure = useAxiosPrivate();

  const { user } = useStroge();
  const [formData, setFormData] = useState({ ...user });
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

    const data = new FormData();
    data.append("image", image);

    const uploadRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbb_api_key}`,
      data
    );

    const imageUrl = uploadRes.data.data.url;
    setFormData((prev) => ({ ...prev, photoURL: imageUrl }));
  };

  const handleUpdate = () => {
    AxiosSecure.put(`/api/auth/updateUser/${user._id}`, formData)
      .then((response) => {
        console.log("Profile updated successfully:", response.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        alert("Profile updated successfully");
      })
      .catch((error) => {
        console.error("Error updating profile:", error.message);
        alert("Error updating profile");
      });

    // You can send to backend here if needed
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Student Profile</h1>

      {/* Profile Photo */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={formData.photoURL || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full border"
        />
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Profile Photo
          </label>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </div>
      </div>

      {/* Info Form */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            value={formData.email}
            className="border p-2 rounded w-full"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <input
            name="gender"
            value={formData.gender}
            className="border p-2 rounded w-full"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <input
            name="class"
            value={formData.class}
            className="border p-2 rounded w-full"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Section</label>
          <input
            name="section"
            value={formData.section}
            className="border p-2 rounded w-full"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Roll</label>
          <input
            name="roll"
            value={formData.roll}
            className="border p-2 rounded w-full"
            disabled
          />
        </div>
      </div>

      {/* Guardians */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
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
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
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
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
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
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Profile
      </button>
    </div>
  );
};

export default StudentProfile;
