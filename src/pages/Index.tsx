import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => navigate("/settings")} />
      <MainContent />
    </div>
  );
};

export default Index;