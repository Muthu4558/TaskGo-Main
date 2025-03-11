import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EmailPopup = ({ onClose }) => {
  const [email, setEmail] = useState("");

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center relative z-50">
        <h2 className="text-2xl font-bold mb-4 mt-3">Enter Your Email for Demo Credential</h2>
        <input
          type="email"
          placeholder="Your Email"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleSendEmail}
          className="w-full px-4 py-2 text-white bg-[#229ea6] rounded"
        >
          Submit
        </button>
        <button onClick={onClose} className="mt-4 text-red-500">
          Close
        </button>
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default EmailPopup;
