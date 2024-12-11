import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Car, Wrench, Share2 } from "lucide-react";

const MutualSupport = () => {
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Mutual Support</h2>
        <Button>Create Request</Button>
      </div>
      <div className="mb-4">
        <Input type="search" placeholder="Search requests..." className="max-w-sm" />
      </div>
      <div className="flex gap-4 mb-6">
        {categories.map((cat) => (
          <Button key={cat.label} variant="outline" className="flex items-center gap-2">
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </Button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Needs</h3>
          {needs.map((need) => (
            <div key={need.title} className={`bg-white border-l-4 ${need.borderColor} rounded-lg p-4 shadow-sm`}>
              <div className={`inline-flex items-center px-2 py-1 rounded-full ${need.tagColor} ${need.tagBg} text-sm mb-2`}>
                {need.type}
              </div>
              <h4 className="text-lg font-medium mb-2">{need.title}</h4>
              <p className="text-muted-foreground mb-4">{need.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{need.location}</span>
                  <span>{need.timeAgo}</span>
                  <span>{need.responses} responses</span>
                </div>
                <Button variant="secondary">Offer Help</Button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Offers</h3>
          {offers.map((offer) => (
            <div key={offer.title} className={`bg-white border-l-4 ${offer.borderColor} rounded-lg p-4 shadow-sm`}>
              <div className={`inline-flex items-center px-2 py-1 rounded-full ${offer.tagColor} ${offer.tagBg} text-sm mb-2`}>
                {offer.type}
              </div>
              <h4 className="text-lg font-medium mb-2">{offer.title}</h4>
              <p className="text-muted-foreground mb-4">{offer.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
    </div>
  );
};

export default MutualSupport;