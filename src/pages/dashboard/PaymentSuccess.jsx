import { useEffect } from "react";
import { useSearchParams } from "react-router";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const bookingId = params.get("booking");

  useEffect(() => {
    console.log("Booking ID:", bookingId);
  }, [bookingId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-green-600 mb-3">
          🎉 Payment Successful!
        </h1>

        <p className="text-gray-600 mb-4">
          Your booking has been successfully completed.
        </p>

        <p className="text-sm text-gray-400 mb-6">Booking ID: {bookingId}</p>

        <a
          href="/dashboard/my-bookings"
          className="bg-black text-white px-5 py-2 rounded-xl inline-block"
        >
          Go to My Bookings
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;
