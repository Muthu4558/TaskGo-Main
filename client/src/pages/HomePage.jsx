import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handlePayment = async () => {
    const options = {
      key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
      amount: 100, // Amount in paise (100 = ₹1)
      currency: "INR",
      name: "TaskGo",
      description: "Payment for TaskGo SaaS",
      image: "/src/assets/images/logo2.png", // Replace with your logo
      handler: function (response) {
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "John Doe ",
        email: "muthukdm45@gmail.com",
        contact: "9876543210",
      },
      theme: {
        color: "#229ea6",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 text-center">
         Website Coming Soon...
      </h1>
      <h1 className="text-2xl font-bold mb-4">Login to TaskGo</h1>
      <div className="flex gap-3">
      <button
        className="px-6 py-3 bg-[#229ea6] text-white rounded-md transition"
        onClick={() => navigate("/log-in")}
      >
        Login
      </button>
      <button
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        onClick={handlePayment}
      >
        Pay
      </button>
      </div>
    </div>
  );
};

export default HomePage;
