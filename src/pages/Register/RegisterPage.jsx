import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import OtpModal from "../../components/OtpModal";

const RegisterPage = () => {
  //   const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [offer, setOffer] = useState(null);

  // 🔥 Fetch Offer
  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/offer/active`,
        );
        const data = await res.json();

        if (data.success && data.data) {
          setOffer(data.data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchOffer();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.success) {
        setRegisteredUserId(data.userId);
        setShowOtpModal(true);
        toast.success(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col md:flex-row items-stretch">
        {/* 🔥 REGISTER FORM (LEFT) */}
        <div className="w-122.5 h-full bg-white p-10 rounded-l-2xl shadow border border-gray-200 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 text-sm mt-2">
              Join and start booking today
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a]  focus:outline-none transition duration-300"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a]  focus:outline-none transition duration-300"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a]  focus:outline-none transition duration-300"
            />

            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a]  focus:outline-none transition duration-300"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-[#ebb93a] text-[#131518] font-semibold py-3 rounded-xl hover:bg-[#daa624] transition duration-300 shadow-md hover:shadow-lg"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="mt-8 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-gray-900 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        {/* 🔥 OFFER CARD (RIGHT) */}
        {offer && (
          <div className="relative group w-140 min-h-140 rounded-r-2xl shadow border border-gray-200 overflow-hidden">
            <img
              src={offer.image}
              alt="offer"
              className="w-full h-full object-cover"
            />

            {/* Tooltip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-black text-white text-sm rounded-xl px-4 py-3 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
              <p className="font-semibold">{offer.title}</p>
              <p>Price: {offer.discountPrice}৳</p>
              <p>Expires: {new Date(offer.expiresAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* OTP MODAL */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        userId={registeredUserId}
        email={formData.email}
      />
    </div>
  );
};

export default RegisterPage;
