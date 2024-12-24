import { Button } from "@/components/ui/button";

interface ArchiveButtonProps {
  onClick: () => void;
}

const ArchiveButton = ({ onClick }: ArchiveButtonProps) => {
  return (
    <div className="mt-8 flex justify-center">
      <Button 
        variant="outline"
        onClick={onClick}
        className="w-full max-w-xs border-[#9b87f5] border-dotted hover:bg-[#9b87f5]/10"
      >
        Archive
      </Button>
    </div>
  );
};

export default ArchiveButton;