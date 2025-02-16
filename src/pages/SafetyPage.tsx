
import SafetyUpdates from "@/components/SafetyUpdates";
import { Shield } from "lucide-react";

const SafetyPage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">Safety Updates</h2>
            </div>
            
            <div className="bg-amber-100 rounded-lg p-4 mb-6">
              <p className="text-amber-800 text-sm">
                Stay informed about important safety updates and announcements in your community. 
                Together we can keep our neighborhood safe and secure.
              </p>
            </div>

            <SafetyUpdates />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;
