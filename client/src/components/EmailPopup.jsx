import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import gsap from "gsap";
import "react-toastify/dist/ReactToastify.css";

const EmailPopup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const popupRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      popupRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Email sent successfully!");
        setTimeout(onClose, 2000); // Close the popup after 2 seconds
      } else {
        toast.error("Failed to send email.");
      }
    } catch (error) {
      toast.error("Error sending email.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
      <div
        ref={popupRef}
        className="bg-white p-8 rounded-xl shadow-2xl w-96 text-center relative border border-gray-300"
      >
        <h2 className="text-2xl font-bold mb-4 text-[#229ea6]">Enter Your Email</h2>
        <p className="text-gray-600 text-sm mb-4">Receive a demo credential in your inbox</p>

        <input
          type="email"
          placeholder="Your Email"
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:border-[#229ea6] focus:ring-2 focus:ring-[#229ea6] transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleSendEmail}
          className="w-full px-5 py-3 text-white bg-[#229ea6] rounded-lg font-semibold hover:bg-[#007b7f] transition transform hover:scale-105 shadow-lg"
        >
          Submit
        </button>

        <button
          onClick={onClose}
          className="mt-4 text-red-500 font-semibold hover:underline transition"
        >
          Close
        </button>
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default EmailPopup;
