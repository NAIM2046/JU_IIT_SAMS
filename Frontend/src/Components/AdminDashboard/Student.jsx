import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

const Student = () => {
  const axiosPrivate = useAxiosPrivate();
  const { fetchClass, classlist } = useStroge();
  const [student, setStudent] = useState();
  const fetchStudent = async () => {
    try {
      const response = await axiosPrivate.get("/api/auth/getstudent");
      setStudent(response.data);
      console.log("Student data:", response.data); // ⬅️ Add this line
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };


  useEffect(() => {
    fetchClass();
    fetchStudent(); // Fetch student data when the component mounts
  }, []);
  console.log("Classlist:", classlist); // ⬅️ Add this line
  const handleFormSubmission = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const age = form.age.value;
    const className = form.class.value;
    const section = form.section.value;
    const roll = form.roll.value;
    const gender = form.gender.value;
    const fatherName = form.fathername.value;
    const motherName = form.mothername.value;
    const phoneNumber = form.phonenumber.value;
    const email = form.email.value;

    const studentInfo = {
      role: "student",
      name,
      age,
      class: className,
      section,
      roll,
      password: "123456",
      gender,
      guardians: {
        fatherName,
        motherName,
        phoneNumber,
      },
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    axiosPrivate
      .post("/api/auth/adduser", studentInfo)
      .then((response) => {
        console.log("Student added successfully:", response.data);
        const userid = response.data.userId;
        if(userid){
         axiosPrivate.post(`/api/attendance/initialAttendanceInfo/${userid}`).then((res) => {
          console.log("response from add student", res);
         })
        }
        form.reset(); // Reset the form after successful submission
      })
      .catch((error) => {
        console.error("Error adding student:", error);
      });
  };

  const handleDeleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );
    if (!confirmDelete) return;

    try {
      await axiosPrivate.delete(`/api/auth/deleteuser/${id}`);
      setStudent((prev) => prev.filter((s) => s._id !== id));
      console.log("Student deleted:", id);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };
  console.log(classlist);

  return (
    <div className="mb-10">
      <div className="hero bg-base-200 mt-5 w-full md:w-3/4 mx-auto">
        <div className="card bg-base-100 w-full shrink-0 rounded-none md:rounded-lg md:shadow-2xl">
          <div className="card-body">
            <h1 className="text-center text-2xl font-bold mb-5">Add Student</h1>
            <form className="fieldset" onSubmit={handleFormSubmission}>
              <div>
                <div className="flex mx-auto flex-col md:flex-row mb-3 md:mb-5 gap-3 md:gap-10 w-full md:w-11/12 justify-center items-center">
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Name</label>
                    <input
                      type="text"
                      className="input w-full focus:outline-none"
                      name="name"
                      placeholder="Name"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Age</label>
                    <input
                      type="text"
                      className="input w-full focus:outline-none"
                      name="age"
                      placeholder="Age"
                    />
                  </div>
                </div>
                <div className="flex mx-auto flex-col md:flex-row mb-3 md:mb-5 gap-3 md:gap-10 w-full md:w-11/12 justify-center items-center">
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Class</label>
                    <select
                      name="class"
                      className="select w-full focus:outline-none"
                      defaultValue=""
                    >
                      <option disabled value="">
                        Select Class
                      </option>
                      {classlist.map((cls, index) => (
                        <option key={index} value={cls.class}>
                          {cls.class}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Section</label>
                    <input
                      type="text"
                      className="input w-full focus:outline-none"
                      name="section"
                      placeholder="Section"
                    />
                  </div>
                </div>
                <div className="flex mx-auto flex-col md:flex-row mb-3 md:mb-5 gap-3 md:gap-10 w-full md:w-11/12 justify-center items-center">
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Roll</label>
                    <input
                      type="text"
                      className="input w-full focus:outline-none"
                      name="roll"
                      placeholder="Roll"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Gender</label>
                    <select
                      defaultValue="Pick a color"
                      name="gender"
                      className="select w-full focus:outline-none"
                    >
                      <option value="choose gender">Choose Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                </div>
                <div className="flex mx-auto flex-col md:flex-row mb-3 md:mb-5 gap-3 md:gap-10 w-full md:w-11/12 justify-center items-center">
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Father's Name</label>
                    <input
                      type="text"
                      className="input w-full focus:outline-none"
                      name="fathername"
                      placeholder="Father's Name"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Mothers's Name</label>
                    <input
                      type="text"
                      className="input w-full focus:outline-none"
                      name="mothername"
                      placeholder="Mother's Name"
                    />
                  </div>
                </div>
                <div className="flex mx-auto flex-col md:flex-row mb-3 md:mb-5 gap-3 md:gap-10 w-full md:w-11/12 justify-center items-center">
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Phone Number</label>
                    <input
                      type="text"
                      className="input w-full focus:outline-none"
                      name="phonenumber"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Email</label>
                    <input
                      type="email"
                      className="input w-full focus:outline-none"
                      name="email"
                      placeholder="Email"
                    />
                  </div>
                </div>
                <div className="flex mx-auto gap-10 w-full md:w-11/12 justify-center items-center">
                  <button className="btn btn-neutral mt-4">Add Student</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="w-full md:w-3/4 mx-auto mt-10 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Student List</h2>
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Class</th>
              <th>Roll</th>
              <th>Section</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {student?.length > 0 ? (
              student.map((s, index) => (
                <tr key={s._id}>
                  <td>{index + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.class}</td>
                  <td>{s.roll}</td>
                  <td>{s.section}</td>
                  <td>{s.gender}</td>
                  <td>{s.email}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteStudent(s._id)}
                      className="btn btn-sm btn-error text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Student;
