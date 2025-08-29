import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

// Pages
import Home from "./pages/home/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
          element: <Login />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
      ],
    },
    {
      path: "/dashboard",
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
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
