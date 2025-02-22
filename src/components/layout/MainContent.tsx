
import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  );
};

export default MainContent;
