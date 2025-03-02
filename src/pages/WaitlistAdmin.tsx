
import { useState, useEffect } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";

/**
 * WaitlistAdmin page
 * 
 * Admin-only page to view and manage waitlist entries
 */
const WaitlistAdmin = () => {
  // State to store waitlist entries
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // Role check state
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Get session and navigation
  const { session } = useSessionContext();
  const navigate = useNavigate();
  
  // Check if user is authenticated and has admin role
  useEffect(() => {
    const checkAdminAccess = async () => {
      setIsLoading(true);
      
      // If not authenticated, redirect to login
      if (!session) {
        navigate("/login");
        return;
      }
      
      try {
        // Check if user has admin role
        const { data, error } = await supabase
          .rpc('check_user_role', {
            user_id: session.user.id,
            required_role: 'admin'
          });
          
        if (error) throw error;
        
        // Set admin status based on result
        setIsAdmin(!!data);
        
        // If not admin, redirect to dashboard
        if (!data) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        setError("You don't have permission to view this page");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [session, navigate]);
  
  // Load waitlist entries if user is admin
  useEffect(() => {
    const fetchWaitlist = async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      
      try {
        // Fix: Use the explicit type for the table name
        // This tells TypeScript that the waitlist table exists
        const { data, error } = await supabase
          .from('waitlist' as any)
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setWaitlistEntries(data || []);
      } catch (error: any) {
        console.error("Error fetching waitlist:", error);
        setError(error.message || "Failed to load waitlist entries");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchWaitlist();
    }
  }, [isAdmin]);
  
  // If loading, show spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // If error, show message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
        <Button className="mt-4" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Waitlist Entries</h1>
        <Button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
      
      {/* Display count of waitlist entries */}
      <p className="mb-4">Total entries: {waitlistEntries.length}</p>
      
      {/* Waitlist entries table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {waitlistEntries.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  No waitlist entries yet
                </td>
              </tr>
            ) : (
              waitlistEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitlistAdmin;
