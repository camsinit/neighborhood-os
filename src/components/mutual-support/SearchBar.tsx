
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  return (
    <Input 
      type="search" 
      placeholder="Search requests..." 
      className="max-w-[200px] bg-white border-gray-200 focus:ring-gray-200 focus:border-gray-300"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
};

export default SearchBar;
