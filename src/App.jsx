import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import router from "./router/router";

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
};

export default App;
