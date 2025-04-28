
/**
 * Component for the intro section of the Freebies page
 * 
 * Contains just the page title. The description is now handled by
 * the GlowingDescriptionBox in the FreebiesPageContainer component.
 */
const FreebiesPageHeader = () => {
  return <>
      {/* Updated page title from "Items" to "Freebies" */}
      <h2 className="text-2xl font-bold text-gray-900">Freebies</h2>
    </>;
};
export default FreebiesPageHeader;
