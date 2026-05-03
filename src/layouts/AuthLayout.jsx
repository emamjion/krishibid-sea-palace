import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    // min-h-screen flex items-center justify-center bg-gray-100
    <div className="">
      {/* w-full max-w-md bg-white p-6 rounded shadow */}
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
