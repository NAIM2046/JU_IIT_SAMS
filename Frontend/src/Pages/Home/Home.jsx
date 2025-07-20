import React from "react";
import { Link } from "react-router-dom";
import useStroge from "../../stroge/useStroge";

const Home = () => {
  const { user } = useStroge();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-green-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                  <span className="block">Welcome to</span>
                  <span className="block text-green-200">
                    Institute of Information Technology
                  </span>
                </h1>
                <p className="mt-3 text-base text-green-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Jahangirnagar University's premier institute for cutting-edge
                  IT education and research since 2001.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    {!user && (
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 md:py-4 md:text-lg md:px-10"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/about"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://i.ibb.co/CpB1xszW/iit-building-fefe01054b.webp"
            alt="IIT JU Building"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
              Programs
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Excellence in IT Education
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Offering world-class undergraduate and graduate programs in
              information technology.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* BSc Program */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">
                  BSc in ICT
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  4-year undergraduate program covering software engineering,
                  networking, and information systems.
                </p>
                <div className="mt-4">
                  <Link
                    to="/programs/bsc"
                    className="text-green-600 hover:text-green-500 font-medium"
                  >
                    Program Details →
                  </Link>
                </div>
              </div>

              {/* MSc Program */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">
                  MSc in ICT
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Advanced graduate program with specializations in AI, Data
                  Science, and Cybersecurity.
                </p>
                <div className="mt-4">
                  <Link
                    to="/programs/msc"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Program Details →
                  </Link>
                </div>
              </div>

              {/* Research */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">
                  Research Facilities
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  State-of-the-art labs and research centers working on
                  cutting-edge IT solutions.
                </p>
                <div className="mt-4">
                  <Link
                    to="/research"
                    className="text-purple-600 hover:text-purple-500 font-medium"
                  >
                    Research Areas →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-green-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Proud Achievements of IIT JU
            </h2>
            <p className="mt-3 text-xl text-green-100 sm:mt-4">
              A leading institute for IT education and research in Bangladesh.
            </p>
          </div>
          <div className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div>
              <p className="text-5xl font-extrabold text-white">500+</p>
              <p className="mt-2 text-lg font-medium text-green-100">
                Graduates
              </p>
            </div>
            <div className="mt-10 sm:mt-0">
              <p className="text-5xl font-extrabold text-white">20+</p>
              <p className="mt-2 text-lg font-medium text-green-100">
                Faculty Members
              </p>
            </div>
            <div className="mt-10 sm:mt-0">
              <p className="text-5xl font-extrabold text-white">50+</p>
              <p className="mt-2 text-lg font-medium text-green-100">
                Research Papers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
              News & Events
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Latest Updates
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* News Item 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  className="w-full h-48 object-cover rounded"
                  src="https://i.ibb.co/WvYdczMJ/518287059-3192294777593122-2116601886790060414-n.jpg"
                  alt="News Image"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Annual IT Festival 2023
              </h3>
              <p className="mt-2 text-sm text-gray-500">March 15, 2023</p>
              <p className="mt-2 text-base text-gray-600">
                Join us for our biggest event of the year featuring
                competitions, workshops, and tech talks.
              </p>
              <div className="mt-4">
                <Link
                  to="/news/it-festival-2023"
                  className="text-green-600 hover:text-green-500 font-medium text-sm"
                >
                  Read More →
                </Link>
              </div>
            </div>

            {/* News Item 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  className="w-full h-48 object-cover rounded"
                  src="https://iitju.edu.bd/wp-content/uploads/2022/01/event-2.jpg"
                  alt="News Image"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                New AI Research Lab
              </h3>
              <p className="mt-2 text-sm text-gray-500">February 28, 2023</p>
              <p className="mt-2 text-base text-gray-600">
                IIT JU inaugurates new Artificial Intelligence research
                laboratory with state-of-the-art facilities.
              </p>
              <div className="mt-4">
                <Link
                  to="/news/ai-lab"
                  className="text-green-600 hover:text-green-500 font-medium text-sm"
                >
                  Read More →
                </Link>
              </div>
            </div>

            {/* News Item 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  className="w-full h-48 object-cover rounded"
                  src="https://iitju.edu.bd/wp-content/uploads/2022/01/event-3.jpg"
                  alt="News Image"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Admission Open
              </h3>
              <p className="mt-2 text-sm text-gray-500">January 10, 2023</p>
              <p className="mt-2 text-base text-gray-600">
                Applications are now open for BSc and MSc programs for the
                2023-24 academic year.
              </p>
              <div className="mt-4">
                <Link
                  to="/admissions"
                  className="text-green-600 hover:text-green-500 font-medium text-sm"
                >
                  Read More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to join IIT JU?</span>
            {!user && (
              <span className="block text-green-600">
                Login to your account or apply now.
              </span>
            )}
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              {!user && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Login
                </Link>
              )}
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
