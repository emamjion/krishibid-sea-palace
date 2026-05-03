import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputsRef = useRef([]);

  const API = import.meta.env.VITE_BACKEND_API_URL;

  // countdown
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, step]);

  // password strength
  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return "Strong";
    return "Medium";
  };

  // send otp
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const res = await fetch(`${API}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      setStep(2);
      setTimer(60);
      setMessage("OTP sent to your email");
    } else {
      setMessage(data.message);
    }

    setLoading(false);
  };

  // otp input change
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // paste otp
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");
    setOtp(newOtp);

    newOtp.forEach((num, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = num;
      }
    });
  };

  // verify otp
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    setLoading(true);

    const res = await fetch(`${API}/auth/verify-reset-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp: finalOtp }),
    });

    const data = await res.json();

    if (data.success) {
      setStep(3);
      setMessage("OTP verified");
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setMessage(data.message);
    }

    setLoading(false);
  };

  // resend otp
  const resendOtp = async () => {
    if (timer > 0) return;

    await handleSendOtp(new Event("submit"));
  };

  // reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setLoading(true);

    const res = await fetch(`${API}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      setSuccess(true);
      setMessage("Password reset successful 🎉");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setMessage(data.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {success && (
        <div className="fixed inset-0 flex items-center justify-center text-4xl animate-bounce">
          🎉
        </div>
      )}

      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

        {message && (
          <p className="text-center mb-4 text-green-600 font-semibold">
            {message}
          </p>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="w-full border focus:outline-none transition duration-300 border-gray-300 bg-gray-50 p-3 rounded-lg focus:ring-2 focus:ring-[#ebb93a]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="w-full cursor-pointer bg-[#ebb93a] hover:bg-[#daa624] font-semibold text-[#131518] py-3 rounded-lg transition">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form
            onSubmit={handleVerifyOtp}
            onPaste={handlePaste}
            className={`space-y-6 ${shake ? "animate-shake" : ""}`}
          >
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="w-12 h-12 text-center transition duration-300 text-lg border-gray-300 bg-gray-50 focus:bg-white focus:outline-none  border rounded-lg focus:ring-2 focus:ring-[#ebb93a]"
                />
              ))}
            </div>

            <button className="w-full cursor-pointer bg-[#ebb93a] hover:bg-[#daa624] font-semibold py-3 rounded-lg">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center text-sm">
              {timer > 0 ? (
                <p>Resend OTP in {timer}s</p>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-blue-500 cursor-pointer font-semibold"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                required
                className="w-full border-gray-300 transition duration-300 bg-gray-50 focus:bg-white border p-3 rounded-lg focus:ring-2 focus:ring-[#ebb93a] focus:outline-none "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {password && (
              <div className="text-sm">
                Password strength:
                <span
                  className={`ml-1 font-bold ${
                    getStrength() === "Strong"
                      ? "text-green-600"
                      : getStrength() === "Medium"
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {getStrength()}
                </span>
              </div>
            )}

            <button className="w-full cursor-pointer bg-[#ebb93a] hover:bg-[#daa624] font-semibold py-3 rounded-lg">
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>

      <style>
        {`
        .animate-shake {
          animation: shake 0.3s;
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        `}
      </style>
    </div>
  );
};

export default ForgotPassword;
