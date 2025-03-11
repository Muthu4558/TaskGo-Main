import React from 'react'
import allinonebg from '../assets/images/WebsiteImg/allinone-bg.webp';

const Allinonebg = () => {
  return (
    <>
      <div
        className="relative w-full h-[400px] flex items-center justify-center bg-cover bg-center my-10 lg:my-28"
        style={{ backgroundImage: `url(${allinonebg})` }}
      >
        {/* Overlay (Optional, for better readability) */}
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>

        {/* Content */}
        <div className="relative text-center text-white">
          <h2 className="text-2xl lg:text-4xl font-bold mb-4">Manage all your tasks in one place!</h2>
          <button className="bg-[#229ea6] text-white hover:bg-[#000000] transition duration-300 ease-in-out transform hover:scale-105 font-bold py-2 px-6 rounded">
            Get Started
          </button>
        </div>
      </div>
    </>
  )
}

export default Allinonebg