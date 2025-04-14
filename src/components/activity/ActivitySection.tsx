
/**
 * ActivitySection Component
 * 
 * This component handles displaying the activity section of the HomePage,
 * showing recent neighborhood activities.
 */
import ActivityFeed from "./ActivityFeed";

/**
 * Component to display the activity feed section on the homepage
 * Now designed to take up more horizontal space as main content
 */
const ActivitySection = () => {
  return (
    <section className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Neighborhood Activity</h2>
      <div className="bg-white rounded-lg shadow-sm p-4 w-full">
        <ActivityFeed />
      </div>
    </section>
  );
};

export default ActivitySection;
