import { Archive, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SafetyArchiveDialog from "./SafetyArchiveDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SafetyUpdate {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  author: string;
}

const SafetyUpdates = () => {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // This would typically come from your backend
  const updates: SafetyUpdate[] = [
    {
      id: 1,
      title: "Scheduled Power Outage",
      description: "Maintenance work planned for next Tuesday, 2-4 PM",
      type: "Maintenance",
      date: "2024-03-20",
      author: "City Power Co.",
    },
    {
      id: 2,
      title: "Weather Warning",
      description: "Heavy rainfall expected this weekend",
      type: "Alert",
      date: "2024-03-18",
      author: "Local Weather Service",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Safety Updates</h2>
        <Button 
          onClick={() => setIsArchiveOpen(true)}
          variant="archive"
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          Archive
        </Button>
      </div>
      <div className="grid gap-4">
        {updates.map((update) => (
          <Card key={update.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <CardTitle className="text-lg">{update.title}</CardTitle>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  update.type === "Alert" 
                    ? "bg-red-100 text-red-600" 
                    : "bg-blue-100 text-blue-600"
                }`}>
                  {update.type}
                </span>
              </div>
              <CardDescription>
                Posted by {update.author} on {update.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{update.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <SafetyArchiveDialog 
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
      />
    </div>
  );
};

export default SafetyUpdates;