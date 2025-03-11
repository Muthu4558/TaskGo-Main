import React, { useState } from "react";
import EmailPopup from "./EmailPopup";

const Allinonebg = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <div className="relative text-center my-12 py-20 overflow-hidden bg-gray-900 mt-3">
        {/* Glowing animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#229ea6] to-[#668f92] opacity-30 blur-3xl animate-pulse"></div>

        <h2 className="relative text-4xl font-extrabold bg-gradient-to-r from-[#229ea6] to-[#668f92] bg-clip-text text-transparent mb-8">
          Manage all your tasks in one place!
        </h2>

        <button 
          className="relative px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-[#229ea6] to-[#668f92] rounded-full shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-pulse"
          onClick={() => setShowPopup(true)}
        >
          Use For Free 🚀
        </button>

        {showPopup && <EmailPopup onClose={() => setShowPopup(false)} />}

        {/* Animated floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-32 h-32 bg-[#229ea6] opacity-30 rounded-full blur-2xl absolute top-10 left-16 animate-bounce"></div>
          <div className="w-24 h-24 bg-[#668f92] opacity-30 rounded-full blur-2xl absolute bottom-10 right-20 animate-bounce delay-500"></div>
        </div>
      </div>
    </>
  );
};

export default Allinonebg;
