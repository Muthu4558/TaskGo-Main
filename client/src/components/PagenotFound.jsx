import React from 'react';
import { Link } from 'react-router-dom';
import BgStar from '../assets/images/bg-star.jpeg';

const PagenotFound = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#0f1e2c] text-white">
      {/* Background stars image */}
      <img
        src={BgStar}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1e2c] via-[#102530] to-black opacity-90"></div>

      {/* Main content */}
      <div className="relative z-10 text-center animate-fade-in">
        {/* UFO Beam */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute left-1/2 top-10 -translate-x-1/2 w-24 h-24 bg-[#229ea6] rounded-full blur-2xl opacity-40 animate-pulse" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className="w-full h-full"
          >
            <ellipse cx="32" cy="16" rx="20" ry="8" fill="#229ea6" />
            <path
              d="M12 16c0 4.42 8.95 8 20 8s20-3.58 20-8v8c0 4.42-8.95 8-20 8s-20-3.58-20-8v-8z"
              fill="#1c8f94"
            />
          </svg>
        </div>

        {/* Error code */}
        <h1 className="text-7xl font-extrabold text-[#229ea6] drop-shadow-md animate-pop-in">404</h1>
        <p className="mt-2 text-lg text-gray-300">Oops! This page has vanished like a UFO 🚀</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-[#229ea6] text-white px-6 py-2 rounded-full hover:bg-[#1b8f93] transition duration-300"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default PagenotFound;
