import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import logo from "../assets/images/WebsiteImg/logo2.png";
import { RiContactsFill } from "react-icons/ri";

const Loading = () => {
    return (
        <div className='dots-container flex justify-center gap-1 mt-2'>
            <div className='dot w-2 h-2 bg-gray-500 rounded-full animate-bounce'></div>
            <div className='dot w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150'></div>
            <div className='dot w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300'></div>
        </div>
    );
};

const NavbarWeb = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        userCount: "",
    });
    const [message, setMessage] = useState("");
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const { name, company, email, userCount } = formData;
        if (!name || !company || !email || !userCount) {
            setMessage("All fields are required!");
            return;
        }
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("${import.meta.env.VITE_APP_BASE_URL}/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage("Email sent successfully!");
                setTimeout(() => {
                    setIsOpen(false);
                    setMessage("");
                    setFormData({ name: "", company: "", email: "", userCount: "" });
                }, 2000);
            } else {
                setMessage("Failed to send email.");
            }
        } catch (error) {
            setMessage("Error sending email.");
        }
        setLoading(false);
    };

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
                                onClick={togglePopup}
                                className="font-bold text-sm text-[#229ea6] hover:underline transition"
                            >
                                Signup For Start Tasking
                            </button>
                            <button
                                className="gap-4 px-4 py-2 bg-[#229ea6] text-white rounded-lg hover:bg-black transition transform hover:scale-105 flex items-center"
                                onClick={() => navigate("/log-in")}
                            >
                                <RiContactsFill size={20} />
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

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
                            <Loading/> 
                        ) : (
                        <button
                            onClick={handleSubmit}
                            className="w-full px-5 py-3 text-white bg-[#229ea6] rounded-lg font-semibold hover:bg-[#007b7f] transition transform hover:scale-105 shadow-lg"
                        >
                            Submit
                        </button>
                        )}

                        {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}

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
