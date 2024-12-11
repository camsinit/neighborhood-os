import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Bell, Wrench, Clock } from "lucide-react";
import AddSafetyUpdateDialog from "./AddSafetyUpdateDialog";
import SafetyArchiveDialog from "./SafetyArchiveDialog";

const SafetyUpdates = () => {
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  
  const categories = [
    { icon: Clock, label: "Updates" },
    { icon: Bell, label: "Alerts" },
    { icon: Wrench, label: "Maintenance" },
  ];

  const updates = [
    {
      type: "Alerts",
      title: "Gas Leak on Oak Street",
      description: "Potential gas leak detected. Emergency services are on site. Please avoid the area.",
      author: "John Smith",
      timeAgo: "2 days ago",
      updates: 1,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-100",
      borderColor: "border-l-red-500",
    },
    {
      type: "Maintenance",
      title: "Street Light Repairs",
      description: "Scheduled maintenance for street lights. Work will be conducted between 9 AM and 4 PM.",
      author: "Sarah Johnson",
      timeAgo: "5 days ago",
      icon: Wrench,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      borderColor: "border-l-blue-500",
    },
    {
      type: "Updates",
      title: "Community Meeting Summary",
      description: "Key points from today's community safety meeting and upcoming initiatives.",
      author: "Mike Peterson",
      timeAgo: "7 days ago",
      icon: Clock,
      color: "text-green-500",
      bgColor: "bg-green-100",
      borderColor: "border-l-green-500",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Safety Updates</h2>
        <Button 
          onClick={() => setIsAddUpdateOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white h-10"
        >
          + Share Update
        </Button>
      </div>
      <div className="flex items-center gap-6 mb-8">
        <Input 
          type="search" 
          placeholder="Search safety updates..." 
          className="max-w-sm bg-white border-gray-200 focus:ring-gray-200 focus:border-gray-300 h-10" 
        />
        <div className="flex gap-4">
          {categories.map((cat) => (
            <Button 
              key={cat.label} 
              variant="outline" 
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200 h-10"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {updates.map((update) => (
          <div key={update.title} className={`bg-white border-l-4 ${update.borderColor} rounded-lg p-6 shadow-sm`}>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${update.color} ${update.bgColor} text-sm font-medium mb-3`}>
              <update.icon className="h-4 w-4 mr-2" />
              {update.type}
            </div>
            <h4 className="text-lg font-medium mb-3">{update.title}</h4>
            <p className="text-muted-foreground mb-6">{update.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{update.author}</span>
                <span>{update.timeAgo}</span>
                {update.updates && <span>{update.updates} update</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button 
          variant="outline"
          onClick={() => setIsArchiveOpen(true)}
          className="w-full max-w-xs"
        >
          Archive
        </Button>
      </div>
      <AddSafetyUpdateDialog 
        open={isAddUpdateOpen}
        onOpenChange={setIsAddUpdateOpen}
      />
      <SafetyArchiveDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
      />
    </div>
  );
};

export default SafetyUpdates;
