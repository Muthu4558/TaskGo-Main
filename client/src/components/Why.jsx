import React, { useState } from "react";
import EmailPopup from "./EmailPopup";

const Why = () => {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <div>
        <div className="relative text-center my-12 py-16 overflow-hidden bg-gray-900">
            {/* Glowing animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#229ea6] to-[#668f92] opacity-30 blur-3xl animate-pulse"></div>

            <h2 className="relative text-4xl font-extrabold bg-gradient-to-r from-[#229ea6] to-[#668f92] bg-clip-text text-transparent mb-4">
                Get Started Today – It’s Free!
            </h2>
            
            <p className="relative text-lg text-gray-200 mb-6">
                Ready to take your task management to the next level?  
                <br />
                Sign up for a <span className="font-semibold text-[#229ea6]">FREE trial</span> today – <span className="font-semibold text-[#668f92]">no credit card required!</span>
            </p>

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
        <h1 className='max-w-7xl mx-auto mt-10 text-center text-5xl font-bold'>
            Why Choose TaskGo?
        </h1>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 my-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-[#229ea6] to-[#668f92] text-white p-6 rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mt-5 md:mt-10">Boost Productivity by 40% 🚀</h2>
            <p className="text-base md:text-lg mt-3">
                TaskGo helps teams stay focused, organized, and efficient, so you get more done in less time.
            </p>
        </div>
        <div className="bg-gradient-to-r from-[#229ea6] to-[#668f92] text-white p-6 rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mt-5 md:mt-10">Simplify Collaboration 💡</h2>
            <p className="text-base md:text-lg mt-3">
                Whether you're working remotely or in-office, TaskGo brings your team together in one place.
            </p>
        </div>
        <div className="bg-gradient-to-r from-[#229ea6] to-[#668f92] text-white p-6 rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mt-5 md:mt-10">Completely Free – No Hidden Costs🔥</h2>
            <p className="text-base md:text-lg mt-3">
                TaskGo is 100% free to use, giving teams of all sizes access to powerful task management features—no subscriptions, no hidden fees!
            </p>
        </div>
    </div>
        </div>
    </div>
  )
}

export default Why
