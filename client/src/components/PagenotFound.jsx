import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BgStar from '../assets/images/bg-star.jpeg';

const PagenotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-[#0f1e2c] text-white relative overflow-hidden">
            <motion.div
                className="text-center z-10"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                <div className="mb-4">
                    {/* UFO Beam Animation */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="relative"
                    >
                        <div className="absolute left-1/2 -translate-x-1/2 w-32 h-32 bg-[#229ea6] rounded-full blur-2xl opacity-30" />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64 64"
                            className="w-32 h-32 mx-auto"
                        >
                            <ellipse cx="32" cy="16" rx="20" ry="8" fill="#229ea6" />
                            <path
                                d="M12 16c0 4.42 8.95 8 20 8s20-3.58 20-8v8c0 4.42-8.95 8-20 8s-20-3.58-20-8v-8z"
                                fill="#1c8f94"
                            />
                        </svg>
                    </motion.div>
                </div>

                <motion.h1
                    className="text-7xl font-extrabold text-[#229ea6] drop-shadow-xl"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    404
                </motion.h1>
                <p className="mt-2 text-lg text-gray-300">Oops! This page was Not Found 🚀</p>
                <Link
                    to="/"
                    className="mt-6 inline-block bg-[#229ea6] text-white px-6 py-2 rounded-full hover:bg-[#1b8f93] transition duration-300"
                >
                    Go Home
                </Link>
            </motion.div>

            {/* Stars Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={BgStar}
                    alt="stars background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1e2c] via-[#102530] to-black opacity-90" />
            </div>

        </div>
    );
};

export default PagenotFound;
