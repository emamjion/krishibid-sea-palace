import { useState } from "react";
import { useNavigate } from "react-router";

import { toast } from "sonner";

const OtpModal = ({ isOpen, onClose, userId, email }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/verify-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, otp }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      if (data.success) {
        toast.success(data.message || "Account verified successfully 🎉");
        onClose();
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl cursor-pointer font-bold text-center mb-2">
          Verify Your Email
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the OTP sent to <span className="font-semibold">{email}</span>
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6 digit OTP"
          className="w-full text-center tracking-widest text-lg px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a] focus:outline-none transition"
        />

        <button
          onClick={handleVerifyOtp}
          disabled={loading}
          className="w-full mt-6 bg-[#ebb93a] text-[#131518] cursor-pointer py-3 rounded-xl font-semibold hover:bg-[#daa624] transition disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default OtpModal;
