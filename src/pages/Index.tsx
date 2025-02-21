
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight, Users, Calendar, Shield, HandHelping } from "lucide-react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import { useState } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Temporarily show dashboard content without auth check
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MainContent />
    </div>
  );
};

export default Index;
