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
  /** Optional URL to link to when the logo is clicked */
  url?: string;
}

/**
 * ReplacementLogo component that displays a logo with consistent sizing
 * and text formatting regardless of the original image dimensions or text length
 */
export const ReplacementLogo = ({
  logo,
  name,
  alt,
  url
}: ReplacementLogoProps) => {
  // Logo content that will be either wrapped in a link or displayed directly
  const logoContent = (
    <div className="flex flex-col items-center gap-2 min-w-0 my-0 mx-0 px-0 py-[2px]">
      {/* 
        Logo container with fixed dimensions to ensure consistency
        - w-12 h-12: Fixed 48px square container (increased from 40px)
        - bg-background: Subtle background for better logo visibility
        - rounded-lg: More rounded corners for modern look
        - flex items-center justify-center: Centers logo within container
        - overflow-hidden: Ensures logo doesn't break container bounds
        - hover:bg-muted: Subtle hover effect when clickable
       */}
      <div className={`w-12 h-12 bg-background rounded-lg flex items-center justify-center overflow-hidden ${url ? 'hover:bg-muted transition-colors cursor-pointer' : ''}`}>
        <img 
          src={logo} 
          alt={alt} 
          className="w-10 h-10 object-contain rounded-md" 
          onError={e => {
            // Fallback: If image fails to load, hide it gracefully
            console.log(`Failed to load logo: ${logo}`);
            e.currentTarget.style.display = 'none';
          }} 
          onLoad={() => {
            console.log(`Successfully loaded logo: ${logo}`);
          }} 
        />
      </div>
    </div>
  );

  // If URL is provided, wrap the logo in a clickable link
  if (url) {
    return (
      <a 
        href={url.startsWith('http') ? url : `https://${url}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
      >
        {logoContent}
      </a>
    );
  }

  // Otherwise, return the logo content directly
  return logoContent;
};