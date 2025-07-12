import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loader";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await axios.post("/api/user/forgot-password", { email });
      toast.success("OTP sent to your email", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      await axios.post("/api/user/verify-otp", { email, otp });
      toast.success("OTP verified", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
      setStep(3);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await axios.post("/api/user/reset-password", {
        email,
        newPassword,
      });
      toast.success("Password reset successfully", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
      setTimeout(() => {
        navigate("/log-in");
      }, 1500);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#e0f7fa] to-[#e8f5e9] px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#229ea6] mb-1">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
          </h2>
          <p className="text-sm text-gray-600">
            {step === 1 && "Enter your registered email address to receive an OTP."}
            {step === 2 && "Enter the OTP sent to your email to verify."}
            {step === 3 && "Set your new password below."}
          </p>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full border border-[#229ea6] px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-[#229ea6]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={handleSendOTP}
                  className="w-full bg-[#229ea6] hover:bg-[#1b8d94] text-white py-2 rounded-full transition"
                >
                  Send OTP
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full border border-[#229ea6] px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-[#229ea6]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  onClick={handleVerifyOTP}
                  className="w-full bg-[#229ea6] hover:bg-[#1b8d94] text-white py-2 rounded-full transition"
                >
                  Verify OTP
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full border border-[#229ea6] px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-[#229ea6]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-[#229ea6] hover:bg-[#1b8d94] text-white py-2 rounded-full transition"
                >
                  Reset Password
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;