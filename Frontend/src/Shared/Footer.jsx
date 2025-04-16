import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h2 className="text-xl font-bold text-white">iEdu</h2>
            <p className="mt-3 text-sm">
              Manage Your institute with iEdu!
              Maintain the schedules, marks, students, transactions and many more
              under a single umbrella.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-400">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400">
                 Upcomming Movies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-400">
                  Online Streaming
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400">
                  Multiple Devices
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400">
                  AR and VR Experience
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400">
                  Buy Offline Tickets
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Join Our Newsletter
            </h3>
            <p className="mt-3 text-sm">
              Stay updated with our latest Movie Releases.
            </p>
            <div className="mt-3 flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 bg-white rounded-l-md text-gray-900 focus:outline-none"
              />
              <button className="bg-[#ec5990] px-4 py-2 text-white rounded-r-md hover:cursor-pointer hover:bg-[#bf1650] transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 my-6"></div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} iEdu. All rights reserved.
          </p>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <FaFacebookF />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <FaTwitter />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <FaInstagram />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;