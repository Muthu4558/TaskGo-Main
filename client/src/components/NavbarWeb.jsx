import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RiContactsFill, RiUserAddFill, RiMenu3Line, RiCloseLine } from "react-icons/ri";
import gsap from "gsap";
import logo from "../assets/images/WebsiteImg/logo2.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loader";

const NavbarWeb = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        userCount: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(
                formRef.current,
                { opacity: 0, y: -50 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [isOpen]);

    const togglePopup = () => setIsOpen(!isOpen);
    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const { name, company, email, userCount } = formData;
        if (!name || !company || !email || !userCount) {
            toast.error("All fields are required!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Successfully signed up!");
                setTimeout(() => {
                    setIsOpen(false);
                    setFormData({ name: "", company: "", email: "", userCount: "" });
                }, 2000);
            } else {
                toast.error("Failed to send email.");
            }
        } catch (error) {
            toast.error("Error sending email.");
        }
        setLoading(false);
    };

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
            <nav className="bg-white shadow-md fixed w-full z-50 top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <img className="w-40 lg:w-48" src={logo} alt="Company Logo" />
                        </div>

                        {/* Hamburger Menu for Mobile */}
                        <div className="md:hidden">
                            <button onClick={toggleMenu} className="text-[#229ea6] text-3xl">
                                {menuOpen ? <RiCloseLine /> : <RiMenu3Line />}
                            </button>
                        </div>

                        {/* Navbar Items */}
                        <div className={`absolute md:static top-20 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none p-5 md:p-0 transition-all duration-300 ${menuOpen ? "block" : "hidden md:flex"}`}>
                            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-3 md:space-y-0">
                                <button
                                    onClick={togglePopup}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#229ea6] text-white rounded-lg hover:bg-black transition transform hover:scale-105 w-full md:w-auto justify-center"
                                >
                                    <RiUserAddFill size={20} />
                                    Signup For Start Tasking
                                </button>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-[#229ea6] text-white rounded-lg hover:bg-black transition transform hover:scale-105 w-full md:w-auto justify-center"
                                    onClick={() => navigate("/log-in")}
                                >
                                    <RiContactsFill size={20} />
                                    Login To Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Signup Form Popup */}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
                    <div
                        ref={formRef}
                        className="bg-white p-8 rounded-xl shadow-2xl w-96 text-center relative border border-gray-300"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-black">Signup Form</h2>
                        <h3 className="font-bold mb-3">To Start <span className="font-bold text-2xl text-[#229ea6]">TaskGo</span></h3>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:border-[#229ea6] focus:ring-2 focus:ring-[#229ea6] transition"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="company"
                            placeholder="Company Name"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:border-[#229ea6] focus:ring-2 focus:ring-[#229ea6] transition"
                            value={formData.company}
                            onChange={handleChange}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:border-[#229ea6] focus:ring-2 focus:ring-[#229ea6] transition"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <input
                            type="number"
                            name="userCount"
                            placeholder="User Count"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:border-[#229ea6] focus:ring-2 focus:ring-[#229ea6] transition"
                            value={formData.userCount}
                            onChange={handleChange}
                        />

                        {loading ? (
                            <Loading />
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="w-full px-5 py-3 text-white bg-[#229ea6] rounded-lg font-semibold hover:bg-[#007b7f] transition transform hover:scale-105 shadow-lg"
                            >
                                Submit
                            </button>
                        )}

                        <button
                            onClick={togglePopup}
                            className="mt-4 text-red-500 font-semibold hover:underline transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavbarWeb;
