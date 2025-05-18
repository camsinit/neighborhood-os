/**
 * IMPORTANT: This file is currently NOT being used for routing.
 * All routes are defined in App.tsx
 * 
 * This file is kept as a placeholder for potential future refactoring.
 */

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./components/HomePage";

// This is a placeholder router configuration that matches our App.tsx routes
// Not currently in use, but kept for reference and potential future refactoring
const createAppRouter = () => {
  return createBrowserRouter([
    {
      path: "/",
      // Add routes here if migrating to createBrowserRouter in the future
      children: [
        {
          path: "/home",
          element: <HomePage />,
        },
        // Other routes would go here
      ]
    },
  ]);
};

export default createAppRouter;
