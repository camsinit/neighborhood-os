import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Bell, Wrench, Clock } from "lucide-react";

const SafetyUpdates = () => {
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
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Safety Updates</h2>
        <Button>Share Update</Button>
      </div>
      <div className="mb-4">
        <Input type="search" placeholder="Search safety updates..." className="max-w-sm" />
      </div>
      <div className="flex gap-4 mb-6">
        {categories.map((cat) => (
          <Button key={cat.label} variant="outline" className="flex items-center gap-2">
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </Button>
        ))}
      </div>
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.title} className="border rounded-lg p-4">
            <div className={`inline-flex items-center px-2 py-1 rounded-full ${update.color} ${update.bgColor} text-sm mb-2`}>
              <update.icon className="h-4 w-4 mr-1" />
              {update.type}
            </div>
            <h4 className="text-lg font-medium mb-2">{update.title}</h4>
            <p className="text-muted-foreground mb-4">{update.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{update.author}</span>
                <span>{update.timeAgo}</span>
                {update.updates && <span>{update.updates} update</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyUpdates;