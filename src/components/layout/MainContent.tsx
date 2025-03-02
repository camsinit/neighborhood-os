
import { Outlet } from "react-router-dom";

/**
 * MainContent component
 * 
 * This component acts as a container for the main content area of the dashboard.
 * It uses React Router's Outlet component to render the currently active route.
 */
const MainContent = () => {
  return (
    <main className="flex-1 overflow-y-auto">
      {/* Outlet is where the nested routes will be rendered */}
      <Outlet />
    </main>
  );
};

export default MainContent;
