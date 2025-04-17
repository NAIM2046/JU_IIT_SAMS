import React from "react";

const Teacher = () => {
  const handleFormSubmission = (e) => {
    e.preventDefault();
    const form = e.target;
    const poster = form.poster.value;
    const movieTitle = form.movieTitle.value;
    const genre = form.genre.value;
    const releaseYear = form.releaseYear.value;
    const summary = form.summary.value;

    const teacherInfo = {
      poster,
      movieTitle,
      genre,
      releaseYear,
      summary,
    };
  };

  return (
    <div className="mb-10">
      <div className="hero bg-base-200 mt-5 w-full md:w-3/4 mx-auto">
        <div className="card bg-base-100 w-full shrink-0 rounded-none md:rounded-lg md:shadow-2xl">
          <div className="card-body">
            <h1 className="text-center text-2xl font-bold mb-5">Add Teacher</h1>
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
                <div className="flex mx-auto flex-col md:flex-row md:mb-5 gap-3 md:gap-10 w-full md:w-11/12  justify-center items-center">
                  <div className="w-full">
                    <label className="fieldset-label">Description</label>
                    <textarea
                      name="description"
                      className="border p-3 text-sm rounded-md border-gray-200 w-full focus:outline-none "
                      id="description"
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
