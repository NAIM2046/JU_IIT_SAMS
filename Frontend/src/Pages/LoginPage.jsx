import React from "react";
import { Link } from "react-router-dom";

const LoginPage= () => {

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    console.log(email, password);
  };

  

  return (
    <div>
      <div className="hero bg-base-200 max-w-screen min-h-screen">
        <div className="card bg-base-100 w-screen max-w-sm shrink-0 rounded-none md:rounded-lg shadow-2xl">
          <div className="card-body">
          <h1 className="text-center text-2xl font-bold mb-5">Login</h1>
            <form className="fieldset" onSubmit={handleFormSubmit}>
              <label className="fieldset-label">Email</label>
              <input
                type="email"
                className="input"
                name="email"
                placeholder="Email"
              />
              <label className="fieldset-label">Password</label>
              <input
                type="password"
                className="input"
                name="password"
                placeholder="Password"
              />
              <div>
                <a className="link link-hover">Forgot password?</a>
              </div>
              <button className="btn btn-neutral mt-4">Login</button>
            </form>

            <p>
                Problem in accessing account?{" "}
              <Link to="/askhelp">
                <span className="hover:border-b-2 hover:border-b-red-500 hover:cursor-pointer text-red-500 font-bold">
                  Ask help
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;