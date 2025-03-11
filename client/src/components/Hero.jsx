import React, { useState } from "react";
import herobg from '../assets/images/WebsiteImg/hero-bg.jpg';
import bannerVideo from '../assets/video/bannerVideo.mp4';
import EmailPopup from "./EmailPopup";

const Hero = () => {
    const [showPopup, setShowPopup] = useState(false);
    return (
        <>
            <div className="relative flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto h-screen p-4 mt-5">
                <div className="md:w-1/2 p-4 flex flex-col justify-center mt-28 lg:mt-0 md:mt-0 text-left">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#229ea6] to-[#668f92] bg-clip-text text-transparent">
                        Smarter Task Management for Growing Teams
                    </h1>
                    <p className="text-lg mb-4 text-justify">
                        The Cloud-Based TaskGo is a web application built to simplify team task management. It offers a user-friendly interface for seamless task assignment, tracking, and collaboration. Designed for both administrators and regular users, the platform provides robust features to boost productivity and organization.
                    </p>
                    <div className="flex text-left">
                        <button
                            className="gap-4 px-4 py-2 bg-[#229ea6] text-white rounded hover:bg-[#000000] transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
                            onClick={() => setShowPopup(true)}
                        >
                            Use For Free 🚀
                        </button>
                        {showPopup && <EmailPopup onClose={() => setShowPopup(false)} />}
                    </div>
                </div>
                <div className="md:w-2/3 p-4 flex justify-center">
                <video className="w-full h-auto z-10" autoPlay muted loop playsInline controls>
                    <source src={bannerVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                </div>
            </div>
            <img src={herobg} alt="" className="hidden lg:block absolute top-0 right-0 w-2/5 h-auto object-cover rounded-tl-full" />
        </>
    );
};

export default Hero;
