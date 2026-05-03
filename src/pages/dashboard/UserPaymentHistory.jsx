import { useEffect, useState } from "react";

const UserPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/payment/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        if (data.success) {
          setPayments(data.data);
        }
      } catch (err) {
        console.error("Payment history error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading payment history...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payment History</h2>

      {payments.length === 0 ? (
        <p className="text-gray-500">No payment history found</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Client ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Shares</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((item) => (
                <tr key={item._id} className="border-b border-gray-300">
                  <td className="p-3">{item.paymentSchedule?.clientId}</td>

                  <td className="p-3">{item.generalInformation?.fullNameEn}</td>

                  <td className="p-3">{item.paymentSchedule?.numberOfShare}</td>

                  <td className="p-3 font-semibold text-indigo-600">
                    ৳ {item.paymentSchedule?.totalPrice}
                  </td>

                  <td className="p-3">
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
                  </td>

                  <td className="p-3 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserPaymentHistory;
