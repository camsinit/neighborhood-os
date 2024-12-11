import { Input } from "@/components/ui/input";

const SearchBar = () => {
  return (
    <Input 
      type="search" 
      placeholder="Search requests..." 
      className="max-w-[240px] bg-white border-gray-200 focus:ring-gray-200 focus:border-gray-300" 
    />
  );
};

export default SearchBar;