import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import SettingsDialog from "@/components/SettingsDialog";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  useEffect(() => {
    const handleOpenItemDialog = (event: CustomEvent<{ type: string; id: string }>) => {
      const customEvent = new CustomEvent(`open${event.detail.type}Dialog`, {
        detail: { id: event.detail.id }
      });
      window.dispatchEvent(customEvent);
    };

    window.addEventListener('openItemDialog', handleOpenItemDialog as EventListener);
    
    return () => {
      window.removeEventListener('openItemDialog', handleOpenItemDialog as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <MainContent />
      <SettingsDialog 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Index;