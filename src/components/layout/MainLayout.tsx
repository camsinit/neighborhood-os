import Sidebar from "./Sidebar";
import Header from "./Header";
import LoggingControls from "@/components/debug/LoggingControls";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="p-4 sm:p-8">
          {children}
        </main>
        
        {/* Add the logging controls component */}
        <LoggingControls />
      </div>
    </div>
  );
};

export default MainLayout;
