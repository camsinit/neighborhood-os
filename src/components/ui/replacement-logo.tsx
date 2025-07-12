/**
 * ReplacementLogo Component
 * 
 * A universal component that ensures consistent sizing, spacing, and alignment
 * for replacement app logos displayed in the accordion feature section.
 * 
 * This component standardizes:
 * - Logo image size and aspect ratio
 * - Text truncation and alignment
 * - Container spacing and layout
 */

interface ReplacementLogoProps {
  /** The URL of the logo image */
  logo: string;
  /** The name/title to display below the logo */
  name: string;
  /** Alt text for the logo image for accessibility */
  alt: string;
}

/**
 * ReplacementLogo component that displays a logo with consistent sizing
 * and text formatting regardless of the original image dimensions or text length
 */
export const ReplacementLogo = ({
  logo,
  name,
  alt
}: ReplacementLogoProps) => {
  return <div className="flex flex-col items-center gap-2 flex-1 min-w-0 my-0 mx-0 px-0 py-[2px]">
      {/* 
        Logo container with fixed dimensions to ensure consistency
        - w-10 h-10: Fixed 40px square container
        - bg-background: Subtle background for better logo visibility
        - rounded-md: Slightly rounded corners for modern look
        - flex items-center justify-center: Centers logo within container
        - overflow-hidden: Ensures logo doesn't break container bounds
       */}
      <div className="w-10 h-10 bg-background rounded-md flex items-center justify-center overflow-hidden">
        <img src={logo} alt={alt} className="w-8 h-8 object-contain" onError={e => {
        // Fallback: If image fails to load, hide it gracefully
        e.currentTarget.style.display = 'none';
      }} />
      </div>
      
      {/* 
        Text container with consistent formatting
        - text-xs: Small text size for compact display
        - text-muted-foreground: Muted color for secondary information
        - text-center: Center-aligned text
        - leading-tight: Tighter line height for compact display
        - w-full: Ensures text container takes full width of parent
       */}
      <span className="text-xs text-muted-foreground text-center leading-tight w-full">
        {name}
      </span>
    </div>;
};