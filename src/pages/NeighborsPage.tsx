
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserDirectory } from "@/components/neighbors/UserDirectory";
import { useUser } from "@supabase/auth-helpers-react";
import { LoadingSpinner } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users } from "lucide-react";

const NeighborsPage = () => {
  const currentUser = useUser();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['check-admin', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return false;
      const { data, error } = await supabase.rpc('check_user_role', {
        user_id: currentUser.id,
        required_role: 'super_admin'
      });
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser
  });

  if (checkingAdmin) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Neighbor Directory</h2>
            </div>
            
            <div className="bg-emerald-100 rounded-lg p-4 mb-6">
              <p className="text-emerald-800 text-sm">
                Manage and view your community members. This directory helps maintain a safe and 
                connected neighborhood.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <UserDirectory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighborsPage;
