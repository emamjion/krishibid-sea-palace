import { createBrowserRouter } from "react-router";
import AuthLayout from "../layouts/AuthLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import RootLayout from "../layouts/RootLayout.jsx";
import BookPage from "../pages/Book/BookPage.jsx";

// import AdminPaymentHistory from "../pages/dashboard/AdminPaymentHistory";
import DashboardHome from "../pages/dashboard/DashboardHome.jsx";
import ManageBookings from "../pages/dashboard/ManageBookings.jsx";
import ManageOffers from "../pages/dashboard/ManageOffers.jsx";
import ManageSales from "../pages/dashboard/ManageSales.jsx";
import ManageUsers from "../pages/dashboard/ManageUsers.jsx";
import MyBookings from "../pages/dashboard/MyBookings.jsx";
import PaymentSuccess from "../pages/dashboard/PaymentSuccess.jsx";
import ProfilePage from "../pages/dashboard/ProfilePage.jsx";
import SalesMyClients from "../pages/dashboard/SalesMyClients.jsx";
import UserPaymentHistory from "../pages/dashboard/UserPaymentHistory.jsx";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword.jsx";
import LoginPage from "../pages/Login/LoginPage.jsx";
import RegisterPage from "../pages/Register/RegisterPage.jsx";
import AdminRoute from "./AdminRoute.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import SalesRoute from "./SalesRoute.jsx";

const router = createBrowserRouter([
  // Auth Layout(Login/Register)
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  // Root Layout(booking page)
  {
    element: <RootLayout />,
    children: [
      {
        path: "/book",
        element: (
          <PrivateRoute>
            <BookPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  // Dashboard Layout
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: "my-bookings",
        element: <MyBookings />,
      },
      {
        path: "payment-success",
        element: <PaymentSuccess />,
      },
      {
        path: "payment-history",
        element: <UserPaymentHistory />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },

      //  Admin Only Routes
      {
        path: "manage-clients",
        element: (
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        ),
      },
      {
        path: "manage-bookings",
        element: (
          <AdminRoute>
            <ManageBookings />
          </AdminRoute>
        ),
      },
      {
        path: "manage-sales",
        element: (
          <AdminRoute>
            <ManageSales />
          </AdminRoute>
        ),
      },
      {
        path: "manage-offers",
        element: (
          <AdminRoute>
            <ManageOffers />
          </AdminRoute>
        ),
      },
      //   {
      //     path: "payment-history",
      //     element: (
      //       <AdminRoute>
      //         <AdminPaymentHistory />
      //       </AdminRoute>
      //     ),
      //   },
      {
        path: "my-clients",
        element: (
          <SalesRoute>
            <SalesMyClients />
          </SalesRoute>
        ),
      },
    ],
  },
]);

export default router;
