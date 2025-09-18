import React from "react";
import { BiBell } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { FaCheckCircle  } from "react-icons/fa";

const UpdatePopup = ({ open, onClose, updates }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#229ea6] flex items-center gap-2">
            <span><BiBell /></span> 
            <span>Latest Updates</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <IoClose size={24} />
          </button>
        </div>

        <h4 className="mb-8">
            We're excited to share some updates with you! Our <span className="text-[#229ea6]">TaskGo</span> has just gotten better with two new features
        </h4>

        <ul className="space-y-3 text-gray-700">
          {updates.length > 0 ? (
            updates.map((update, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#229ea6] mt-1"><FaCheckCircle /></span>
                <span>{update}</span>
              </li>
            ))
          ) : (
            <p>No new updates available.</p>
          )}
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#229ea6] text-white px-4 py-2 rounded-md shadow hover:bg-[#1b868d] transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePopup;