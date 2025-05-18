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
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <MainLayout><HomePage /></MainLayout>,
        },
        {
          path: "/home",
          element: <MainLayout><HomePage /></MainLayout>,
        },
        // New dedicated pages for Settings and Invite
        {
          path: "/settings",
          element: <MainLayout><SettingsPage /></MainLayout>,
        },
        {
          path: "/invite",
          element: <MainLayout><InvitePage /></MainLayout>,
        },
        // Add other routes as needed
      ]
    },
    // Auth routes would go here
  ]);
};

export default createAppRouter;
