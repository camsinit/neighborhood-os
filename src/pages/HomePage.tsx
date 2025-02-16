
import QuickActions from "@/components/QuickActions";

const HomePage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#F8E8FF] via-[#FFE7E7] via-[#FFF4E4] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col gap-6">
            <QuickActions />
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm">
                Welcome to your community hub. Here you can quickly access common actions
                to connect, share, and engage with your neighbors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
