import React from 'react';
import { useNavigate } from "react-router-dom";
import logo from '../assets/images/WebsiteImg/logo2.png';
import { RiContactsFill } from "react-icons/ri";

const NavbarWeb = () => {
    const navigate = useNavigate();

    return (
        <>
            <nav className="bg-white shadow-md fixed w-full z-50 top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-24">
                        <div className="flex-shrink-0 flex items-center">
                            <img className="w-40 lg:w-48" src={logo} alt="Company Logo" />
                        </div>
                        <div className="flex items-center space-x-6">
                        <button
                            className="gap-4 px-4 py-2 bg-[#229ea6] text-white rounded hover:bg-[#000000] transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
                            onClick={() => navigate("/log-in")}
                        >
                            <RiContactsFill size={20} />
                            Login
                        </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavbarWeb;