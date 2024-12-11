import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Car, Wrench, Share2 } from "lucide-react";
import { useState } from "react";
import AddSupportRequestDialog from "./AddSupportRequestDialog";

const MutualSupport = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const categories = [
    { icon: Package, label: "Goods" },
    { icon: Car, label: "Transportation" },
    { icon: Wrench, label: "Skills" },
    { icon: Share2, label: "Resources" },
  ];

  const needs = [
    {
      type: "Needs Help",
      title: "Grocery Shopping Helper",
      description: "Looking for assistance with weekly grocery shopping. I have mobility issues and would appreciate help every Saturday morning.",
      location: "Pine Road",
      timeAgo: "11 months ago",
      responses: 2,
      borderColor: "border-l-purple-500",
      tagColor: "text-purple-600",
      tagBg: "bg-purple-100",
    }
  ];

  const offers = [
    {
      type: "Offering Help",
      title: "Garden Tools Available",
      description: "Offering to lend gardening tools including spades, rakes, and a lawn mower for the weekend.",
      location: "Oak Street",
      timeAgo: "11 months ago",
      helped: 3,
      borderColor: "border-l-emerald-500",
      tagColor: "text-emerald-600",
      tagBg: "bg-emerald-100",
    },
    {
      type: "Offering Help",
      title: "Free Moving Boxes",
      description: "Just finished moving, have 20+ boxes in good condition. Perfect for anyone planning to move.",
      location: "Maple Avenue",
      timeAgo: "11 months ago",
      helped: 5,
      borderColor: "border-l-emerald-500",
      tagColor: "text-emerald-600",
      tagBg: "bg-emerald-100",
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Mutual Support</h2>
        <Button 
          onClick={() => setIsAddRequestOpen(true)}
          className="bg-[#FEF7CD] hover:bg-[#FEF7CD]/90 text-black"
        >
          Share Need or Offer
        </Button>
      </div>
      <div className="flex items-center gap-6 mb-8">
        <Input 
          type="search" 
          placeholder="Search requests..." 
          className="max-w-[240px] bg-white border-gray-200 focus:ring-gray-200 focus:border-gray-300" 
        />
        <div className="flex gap-4">
          {categories.map((cat) => (
            <Button 
              key={cat.label} 
              variant="outline" 
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4">Needs</h3>
          {needs.map((need) => (
            <div key={need.title} className={`bg-white border-l-4 ${need.borderColor} rounded-lg p-6 shadow-sm`}>
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${need.tagColor} ${need.tagBg} text-sm font-medium mb-3`}>
                {need.type}
              </div>
              <h4 className="text-lg font-medium mb-3">{need.title}</h4>
              <p className="text-muted-foreground mb-6">{need.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{need.location}</span>
                  <span>{need.timeAgo}</span>
                  <span>{need.responses} responses</span>
                </div>
                <Button variant="secondary">I can help</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4">Offers</h3>
          {offers.map((offer) => (
            <div key={offer.title} className={`bg-white border-l-4 ${offer.borderColor} rounded-lg p-6 shadow-sm`}>
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${offer.tagColor} ${offer.tagBg} text-sm font-medium mb-3`}>
                {offer.type}
              </div>
              <h4 className="text-lg font-medium mb-3">{offer.title}</h4>
              <p className="text-muted-foreground mb-6">{offer.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{offer.location}</span>
                  <span>{offer.timeAgo}</span>
                  <span>{offer.helped} helped</span>
                </div>
                <Button variant="secondary">I'm Interested</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
      />
    </div>
  );
};

export default MutualSupport;
