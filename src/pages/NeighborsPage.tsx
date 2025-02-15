
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserDirectory } from "@/components/neighbors/UserDirectory";
import { useUser } from "@supabase/auth-helpers-react";
import { LoadingSpinner } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg">
        <UserDirectory />
      </div>
    </div>
  );
};

export default NeighborsPage;
