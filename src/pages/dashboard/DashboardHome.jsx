import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import SalesDashboard from "./SalesDashboard";
import UserDashboard from "./UserDashboard";

const DashboardHome = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    }
  }, []);

  if (!role) return null;

  return (
    <div className="p-6">
      {role === "admin" ? (
        <AdminDashboard />
      ) : role === "sales" ? (
        <SalesDashboard />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
};

export default DashboardHome;
