import { BookOpen, Heart, Home } from "lucide-react";
import { useEffect, useState } from "react";

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/booking/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        setBookings(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔥 Dynamic Stats
  const stats = [
    {
      title: "My Bookings",
      value: bookings.length,
      icon: BookOpen,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Completed Payment",
      value: 4, // later API
      icon: Heart,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Viewed Properties",
      value: 12, // later API
      icon: Home,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 🔥 Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-gray-500">
          Here’s what’s happening with your account today
        </p>
      </div>

      {/* 🔥 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:scale-105 transition duration-300"
            >
              <div
                className={`absolute inset-0 bg-linear-to-r ${item.color}`}
              ></div>

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{item.title}</p>
                  <h2 className="text-2xl font-bold mt-1">
                    {loading ? "..." : item.value}
                  </h2>
                </div>

                <div className="bg-white/20 p-3 rounded-xl">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 Recent Bookings */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-5">My Recent Bookings</h2>

        {loading ? (
          // 🔥 Skeleton Loading
          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings found</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b border-gray-300 pb-3 hover:bg-gray-50 px-2 py-2 rounded-lg transition"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.generalInformation.fullNameEn}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.paymentSchedule.clientId}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    item.status === "approved"
                      ? "bg-green-100 text-green-600"
                      : item.status === "rejected"
                        ? "bg-red-100 text-red-500"
                        : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
