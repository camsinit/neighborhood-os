import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./components/HomePage";
import SettingsPage from "./pages/SettingsPage";
import InvitePage from "./pages/InvitePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Other imports would go here as needed

/**
 * Application routes configuration
 * 
 * This defines all the routes for the application, including the new Settings and Invite pages
 */
const createAppRouter = () => {
  return createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/home",
          element: <HomePage />,
        },
        // New dedicated pages for Settings and Invite
        {
          path: "/settings",
          element: <SettingsPage />,
        },
        {
          path: "/invite",
          element: <InvitePage />,
        },
        // Add other routes as needed
      ]
    },
    // Auth routes would go here
  ]);
};

export default createAppRouter;
