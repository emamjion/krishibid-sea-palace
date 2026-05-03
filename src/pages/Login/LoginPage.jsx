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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col-reverse md:flex-row items-stretch">
        {/* OFFER CARD */}
        {offer && (
          <div className="relative group w-140 min-h-140 rounded-l-2xl shadow border border-gray-200 overflow-hidden">
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
                className="w-full p-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a]  focus:outline-none transition duration-300 placeholder:text-sm"
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
                className="w-full px-2 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a]  focus:outline-none transition duration-300 placeholder:text-sm"
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

          <p className="mt-8 text-sm text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-gray-900 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>

          <hr className="my-3 border border-gray-200" />
          <div className="mt-4">
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
    </div>
  );
};

export default LoginPage;
