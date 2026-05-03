import { Navigate } from "react-router";

const SalesRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "sales") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default SalesRoute;
