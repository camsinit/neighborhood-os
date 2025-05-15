
/**
 * SearchInput component (placeholder)
 * A reusable search input component with icon
 */
import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ placeholder = 'Search...', ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
          placeholder={placeholder}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
