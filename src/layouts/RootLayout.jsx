import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

const RootLayout = () => {
  return (
    <div>
      <Navbar />
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
