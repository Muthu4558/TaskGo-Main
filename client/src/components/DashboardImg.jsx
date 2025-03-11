import React, { useState } from 'react';
import dashboard1 from '../assets/images/WebsiteImg/dashboard-1.png';
import dashboard2 from '../assets/images/WebsiteImg/dashboard-2.png';
import dashboard3 from '../assets/images/WebsiteImg/dashboard-3.png';
import dashboardlogin from '../assets/images/WebsiteImg/dashboardlogin.png';

const DashboardImg = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImg, setSelectedImg] = useState(null);

    // Function to open the modal
    const openModal = (imgSrc) => {
        setSelectedImg(imgSrc);
        setIsOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsOpen(false);
        setSelectedImg(null);
    };

    return (
        <>
            <div className="max-w-7xl mx-auto p-4 my-20 bg-gradient-to-r from-[#229ea6] to-[#668f92] text-white rounded-lg shadow-lg">
                <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center drop-shadow-lg">Dashboard Images</h2>
                {/* Responsive grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                    {[dashboardlogin, dashboard1, dashboard2, dashboard3].map((imgSrc, index) => (
                        <div key={index} className="flex justify-center">
                            <img
                                className="w-full max-w-xs md:max-w-sm lg:max-w-md cursor-pointer rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                                src={imgSrc}
                                alt="Dashboard"
                                onClick={() => openModal(imgSrc)}
                            />
                        </div>
                    ))}
                </div>

                {/* Fullscreen Modal */}
                {isOpen && (
                    <div
                        className="fixed inset-0 w-screen h-screen bg-black bg-opacity-90 flex justify-center items-center z-50 transition-opacity duration-300 px-4"
                        onClick={closeModal} // Click outside to close
                    >
                        <button
                            className="absolute top-5 right-5 text-white text-3xl bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-600 transition"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                        <img
                            className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl object-contain rounded-lg shadow-2xl"
                            src={selectedImg}
                            alt="Fullscreen Dashboard"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default DashboardImg;