import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * OAuth Callback Handler
 * 
 * This component processes OAuth redirects and routes users to the appropriate destination
 * based on stored state. It prevents access tokens from being visible in user URLs.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('[AuthCallback] Processing OAuth callback');
      
      try {
        // Let Supabase handle the OAuth callback hash processing
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthCallback] OAuth callback error:', error);
          navigate('/login?error=oauth_failed');
          return;
        }

        if (!session) {
          console.error('[AuthCallback] No session found after OAuth');
          navigate('/login?error=no_session');
          return;
        }

        console.log('[AuthCallback] Session established successfully');

        // Check for stored OAuth state to determine destination
        const oauthDestination = localStorage.getItem('oauthDestination');
        const pendingInviteCode = localStorage.getItem('pendingInviteCode');
        
        console.log('[AuthCallback] OAuth state:', {
          destination: oauthDestination,
          inviteCode: pendingInviteCode
        });

        // Clean up stored state
        localStorage.removeItem('oauthDestination');
        
        // Route based on stored destination
        if (oauthDestination === 'onboarding') {
          console.log('[AuthCallback] Routing to onboarding flow');
          navigate('/onboarding', { replace: true });
        } else {
          console.log('[AuthCallback] Routing to dashboard');
          navigate('/dashboard', { replace: true });
        }

      } catch (error) {
        console.error('[AuthCallback] Unexpected error during OAuth processing:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign-in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;