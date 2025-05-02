import React from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const Teacher = () => {
  const axiosPrivate = useAxiosPrivate();

  const handleAddTeacher = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const age = form.age.value;
    const fathername = form.fathername.value;
    const mothername = form.mothername.value;
    const description = form.description.value;
    const email = form.email.value;
    const password = form.password.value;

    if (
      !name ||
      !age ||
      !fathername ||
      !mothername ||
      !description ||
      !email ||
      !password
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const teacherData = {
      name,
      age,
      fathername,
      mothername,
      description,
      email,
      password,
      role: "teacher",
    };

    console.log(teacherData);

    axiosPrivate
      .post("/api/auth/adduser", teacherData)
      .then((response) => {
        console.log("Teacher added successfully:", response.data);
        alert("Teacher added successfully!");
        form.reset();
      })
      .catch((error) => {
        console.error("Error adding teacher:", error);
        alert("Failed to add teacher. Please try again.");
      });
  };

  return (
    <div className="mb-10">
      <div className="hero bg-base-200 mt-5 w-full md:w-3/4 mx-auto">
        <div className="card bg-base-100 w-full shrink-0 rounded-none md:rounded-lg md:shadow-2xl">
          <div className="card-body">
            <h1 className="text-center text-2xl font-bold mb-5">Add Teacher</h1>
            <form className="fieldset" onSubmit={handleAddTeacher}>
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
                    <label className="fieldset-label">Father's Name</label>
                    <input
                      type="text"
                      className="input w-full focus:outline-none"
                      name="fathername"
                      placeholder="Father's Name"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Mother's Name</label>
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
                    <label className="fieldset-label">Email</label>
                    <input
                      type="email"
                      className="input w-full focus:outline-none"
                      name="email"
                      placeholder="Email"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="fieldset-label">Password</label>
                    <input
                      type="password"
                      className="input w-full focus:outline-none"
                      name="password"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div className="flex mx-auto flex-col md:flex-row md:mb-5 gap-3 md:gap-10 w-full md:w-11/12 justify-center items-center">
                  <div className="w-full">
                    <label className="fieldset-label">Description</label>
                    <textarea
                      name="description"
                      className="border p-3 text-sm rounded-md border-gray-200 w-full focus:outline-none"
                      placeholder="Say some words"
                      cols="30"
                      rows="10"
                    ></textarea>
                  </div>
                </div>

                <div className="flex mx-auto gap-10 w-full md:w-11/12 justify-center items-center">
                  <button className="btn btn-neutral mt-4 w-full">
                    Add Teacher
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teacher;
