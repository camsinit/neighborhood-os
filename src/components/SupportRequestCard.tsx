import * as React from "react";
import { Button } from "@/components/ui/button";

export interface SupportRequest {
  id: string;
  type: "need" | "offer";
  title: string;
  description: string;
  validUntil: string;
}

interface SupportRequestCardProps {
  request: SupportRequest;
}

const SupportRequestCard = ({ request }: SupportRequestCardProps) => {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{request.title}</h4>
        <span className="text-sm text-muted-foreground">
          Valid until: {request.validUntil}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-sm ${
          request.type === "need" ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
        }`}>
          {request.type === "need" ? "Need" : "Offer"}
        </span>
        <Button variant="outline" size="sm">
          Contact
        </Button>
      </div>
    </div>
  );
};

export default SupportRequestCard;