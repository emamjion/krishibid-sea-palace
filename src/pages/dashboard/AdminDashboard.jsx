import axios from "axios";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const months = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const AdminDashboard = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        statsRes,
        recentBookingsRes,
        pendingBookingsRes,
        monthlyBookingsRes,
        newUsersRes,
        assignmentsRes,
        revenueRes,
        paymentsRes,
      ] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin-dashboard/stats`,
          { headers },
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin-dashboard/recent-bookings`,
          { headers },
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin-dashboard/pending-bookings`,
          { headers },
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin-dashboard/monthly-bookings`,
          { headers },
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin-dashboard/new-users`,
          { headers },
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin-dashboard/recent-assignments`,
          { headers },
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin-dashboard/monthly-revenue`,
          { headers },
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin-dashboard/recent-payments`,
          { headers },
        ),
      ]);

      setStats(statsRes.data.stats || {});
      setRecentBookings(recentBookingsRes.data.bookings || []);
      setPendingBookings(pendingBookingsRes.data.bookings || []);
      setMonthlyBookings(monthlyBookingsRes.data.bookings || []);
      setNewUsers(newUsersRes.data.users || []);
      setRecentAssignments(assignmentsRes.data.assignments || []);
      setMonthlyRevenue(revenueRes.data.revenue || []);
      setRecentPayments(paymentsRes.data.payments || []);
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center text-lg">Loading Dashboard...</div>;

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Total Users" value={stats?.totalUsers || 0} />
        <Card title="Total Bookings" value={stats?.totalBookings || 0} />
        <Card title="Total Salesman" value={stats?.totalSalesman || 0} />
        <Card title="Pending Bookings" value={stats?.pendingBookings || 0} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <ChartCard title="Monthly Bookings">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyBookings.map((m) => ({
                ...m,
                month: months[m._id],
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalBookings" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyRevenue.map((m) => ({ ...m, month: months[m._id] }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalAmount" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Bookings */}
      <TableCard
        title="Recent Bookings"
        data={recentBookings}
        columns={[
          {
            key: "fullName",
            label: "Name",
            render: (b) => b.generalInformation?.fullNameEn,
          },
          {
            key: "phone",
            label: "Phone",
            render: (b) => b.generalInformation?.mobile1,
          },
          {
            key: "shares",
            label: "Shares",
            render: (b) => b.paymentSchedule?.numberOfShare,
          },
          {
            key: "totalPrice",
            label: "Total Price",
            render: (b) => `BDT ${b.paymentSchedule?.totalPrice}`,
          },
          {
            key: "status",
            label: "Status",
            render: (b) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[b.status] || "bg-gray-100 text-gray-800"}`}
              >
                {b.status}
              </span>
            ),
          },
        ]}
      />

      {/* Pending Bookings */}
      <TableCard
        title="Pending Bookings"
        data={pendingBookings}
        columns={[
          {
            key: "fullName",
            label: "Name",
            render: (b) => b.generalInformation?.fullNameEn,
          },
          {
            key: "email",
            label: "Email",
            render: (b) => b.generalInformation?.email || "-",
          },
          {
            key: "phone",
            label: "Phone",
            render: (b) => b.generalInformation?.mobile1,
          },
          {
            key: "totalPrice",
            label: "Total Price",
            render: (b) => `BDT ${b.paymentSchedule?.totalPrice}`,
          },
        ]}
      />

      {/* New Users */}
      <TableCard
        title="New Users"
        data={newUsers}
        columns={[
          { key: "name", label: "Name", render: (u) => u.fullName },
          { key: "email", label: "Email", render: (u) => u.email },
          { key: "phone", label: "Phone", render: (u) => u.phone || "-" },
          {
            key: "role",
            label: "Role",
            render: (u) => (
              <span className="bg-black text-white px-2 py-1 rounded-full text-xs font-semibold">
                {u.role}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AdminDashboard;

/* Components */
const Card = ({ title, value }) => (
  <div className="bg-white shadow rounded-xl p-6">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const TableCard = ({ title, data, columns }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="font-semibold mb-4">{title}</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data && data.length > 0 ? (
            data.map((row) => (
              <tr key={row._id}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
