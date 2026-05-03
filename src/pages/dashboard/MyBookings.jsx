import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchBookings = async () => {
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
    };

    fetchBookings();
  }, []);

  const indexOfLast = currentPage * itemsPerPage;
  const currentBookings = bookings.slice(
    indexOfLast - itemsPerPage,
    indexOfLast,
  );
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  // 🔥 PAYMENT HANDLER
  const handlePayment = async (bookingId) => {
    try {
      setLoadingId(bookingId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/payment/init`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        },
      );

      const data = await res.json();

      if (data.success) {
        // 🔥 redirect to SSLCommerz
        window.location.href = data.paymentUrl;
      } else {
        alert("Payment failed to initialize");
      }
    } catch (err) {
      console.error(err);
      alert("Payment error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* 🔥 Header */}
      <div className="bg-gray-800 text-white p-6 rounded-2xl shadow mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-sm opacity-80">Manage your bookings easily</p>
        </div>

        <Link to={"/book"}>
          <button className="bg-white text-black cursor-pointer px-4 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
            + Add Booking
          </button>
        </Link>
      </div>

      {/* 🔥 Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Shares</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentBookings.map((item) => (
              <tr
                key={item._id}
                className="border-b border-gray-300 hover:bg-gray-50 transition duration-200"
              >
                <td className="p-4 font-medium">
                  {item.paymentSchedule.clientId}
                </td>

                <td className="p-4">{item.generalInformation.fullNameEn}</td>

                <td className="p-4">{item.paymentSchedule.numberOfShare}</td>

                <td className="p-4 font-semibold text-indigo-600">
                  ৳ {item.paymentSchedule.totalPrice}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-600"
                        : item.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-4 flex justify-center gap-2">
                  <button
                    onClick={() => setSelectedBooking(item)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:scale-105"
                  >
                    View
                  </button>

                  <button
                    disabled={
                      item.status === "approved" || loadingId === item._id
                    }
                    onClick={() => handlePayment(item._id)}
                    className={`px-3 py-1 text-xs rounded-full text-white transition ${
                      item.status === "approved"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:scale-105"
                    }`}
                  >
                    {loadingId === item._id ? "Processing..." : "Pay"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 Mobile Cards */}
      <div className="md:hidden space-y-4">
        {currentBookings.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-2xl shadow">
            <h3 className="font-bold">{item.generalInformation.fullNameEn}</h3>
            <p className="text-sm text-gray-500">
              {item.paymentSchedule.clientId}
            </p>

            <div className="flex justify-between mt-2 text-sm">
              <span>Shares: {item.paymentSchedule.numberOfShare}</span>
              <span className="font-semibold text-indigo-600">
                ৳ {item.paymentSchedule.totalPrice}
              </span>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  item.status === "approved"
                    ? "bg-green-100 text-green-600"
                    : item.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {item.status}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBooking(item)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                >
                  View
                </button>

                <button
                  disabled={
                    item.status === "approved" || loadingId === item._id
                  }
                  onClick={() => handlePayment(item._id)}
                  className={`text-xs px-2 py-1 rounded text-white ${
                    item.status === "approved" ? "bg-gray-400" : "bg-green-500"
                  }`}
                >
                  {loadingId === item._id ? "..." : "Pay"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 Pagination */}
      <div className="flex justify-center mt-6 gap-2 flex-wrap">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-8 h-8 rounded-full ${
              currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* 🔥 View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white p-6 rounded-2xl w-[90%] md:w-113 shadow-xl"
          >
            <h3 className="text-xl font-bold mb-4">Booking Details</h3>

            <div className="space-y-2 text-sm">
              <p>
                <b>Name:</b> {selectedBooking.generalInformation.fullNameEn}
              </p>
              <p>
                <b>Email:</b> {selectedBooking.generalInformation.email}
              </p>
              <p>
                <b>Phone:</b> {selectedBooking.generalInformation.mobile1}
              </p>
              <p>
                <b>Total:</b> ৳ {selectedBooking.paymentSchedule.totalPrice}
              </p>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-4 w-full bg-black text-white py-2 rounded-xl"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
