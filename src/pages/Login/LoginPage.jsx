import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [offer, setOffer] = useState(null);

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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/login`,
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
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const role = data.user?.role;

        if (role === "user") navigate("/book");
        else if (role === "admin" || role === "sales") navigate("/dashboard");
        else navigate("/");

        toast.success(data.message || "User logged in successfully!!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4  gap-3">
      <div className="flex flex-col-reverse md:flex-row items-stretch">
        {/* OFFER CARD */}
        {offer && (
          <div className="relative group w-136 min-h-130 rounded-l-2xl shadow border border-gray-200 overflow-hidden">
            <img
              src={offer.image}
              alt="offer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Improved Tooltip */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 pointer-events-none" />

            <div
              className="
                absolute bottom-0 left-0 right-0
                translate-y-2 opacity-0
                group-hover:translate-y-0 group-hover:opacity-100
                transition-all duration-400 ease-out
                pointer-events-none
              "
            >
              <div className="m-4 rounded-2xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl">
                {/* Header strip */}
                <div className="bg-[#ebb93a] px-4 py-2 flex items-center gap-2">
                  <span className="text-xs font-bold tracking-widest text-[#131518] uppercase">
                    🎉 Special Offer
                  </span>
                </div>

                {/* Body */}
                <div className="px-4 py-3 space-y-1">
                  <p className="text-white font-semibold text-base leading-snug">
                    {offer.title}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#ebb93a] font-bold text-xl">
                        {offer.discountPrice}৳
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-white/70 text-xs">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Expires:{" "}
                      {new Date(offer.expiresAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        <div className="w-110 h-full bg-white p-10 rounded-r-2xl shadow border border-gray-200 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-2">
              Access your booking form
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full p-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a] focus:outline-none transition duration-300 placeholder:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-2 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a] focus:outline-none transition duration-300 placeholder:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-[#ebb93a] text-[#131518] font-semibold py-2 rounded-xl hover:bg-[#daa624] transition duration-300 shadow-md hover:shadow-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-gray-900 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>

          <hr className="my-3 border border-gray-200" />
          <div className="">
            <p className="text-center text-sm text-gray-500 mb-4">
              Or continue with
            </p>

            <div className="flex gap-3">
              {/* Google */}
              <button className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-xl py-2 hover:bg-gray-50 transition cursor-pointer">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700">
                  Google
                </span>
              </button>

              {/* Facebook */}
              <button className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-xl py-2 cursor-pointer hover:bg-gray-50 transition">
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  alt="facebook"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700">
                  Facebook
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-2xl">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} All rights reserved.</span>
          <span className="text-gray-300">·</span>
          <Link
            to="/privacy-policy"
            className="hover:text-[#ebb93a] hover:underline underline-offset-2 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            to="/refund-policy"
            className="hover:text-[#ebb93a] hover:underline underline-offset-2 transition-colors duration-200"
          >
            Return &amp; Refund Policy
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            to="/terms-and-conditions"
            className="hover:text-[#ebb93a] hover:underline underline-offset-2 transition-colors duration-200"
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
