import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

// Pages
import Home from "./pages/home/Home";

const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/auth",
      children: [
        {
          path: "login",
          element: <div>Login Page - Coming Soon</div>,
        },
        {
          path: "signup",
          element: <div>Signup Page - Coming Soon</div>,
        },
      ],
    },
    {
      path: "/dashboard",
      children: [
        {
          index: true,
          element: <div>Dashboard - Coming Soon</div>,
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
