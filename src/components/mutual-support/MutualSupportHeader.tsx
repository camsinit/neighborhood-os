import { Button } from "@/components/ui/button";

interface MutualSupportHeaderProps {
  onAddRequest: () => void;
}

const MutualSupportHeader = ({ onAddRequest }: MutualSupportHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Mutual Support</h2>
      <Button 
        onClick={onAddRequest}
        className="bg-[#F3D649] hover:bg-[#F3D649]/90 text-black"
      >
        + Share Need or Offer
      </Button>
    </div>
  );
};

export default MutualSupportHeader;