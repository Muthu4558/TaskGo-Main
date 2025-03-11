import React from 'react';
import herobg from '../assets/images/WebsiteImg/hero-bg.jpg';
import { FaExternalLinkAlt } from "react-icons/fa";

const TryTaskGo = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 mt-24 lg:mt-28 lg:mb-28 bg-gradient-to-r from-[#229ea6] to-[#668f92] text-white rounded-lg shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 p-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">Task Management Software 🚀</h2>
          <p className='text-lg md:text-xl leading-relaxed drop-shadow-md'>
            Revolutionize your workflow and supercharge your productivity with our task management software. Organize, track, and collaborate effortlessly with a powerful and intelligent tool. Simplify your workflow and maximize efficiency with <span className="font-semibold">TaskOP</span>.
          </p>
          {/* <a href="#" className="mt-6 inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-transform transform hover:scale-105 shadow-lg">
            Try Now <FaExternalLinkAlt className="ml-2" />
          </a> */}
        </div>
        <div className="md:w-1/2 p-6 flex justify-center">
          <img src={herobg} alt="Sample" className="w-full md:w-3/4 h-auto object-cover rounded-lg shadow-lg transform hover:scale-105 transition duration-300" />
        </div>
      </div>
    </div>
  );
};

export default TryTaskGo;
