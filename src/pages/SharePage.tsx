import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import EventOverviewCard from '@/components/share/EventOverviewCard';
import SafetyOverviewCard from '@/components/share/SafetyOverviewCard';
import SkillsOverviewCard from '@/components/share/SkillsOverviewCard';
import GoodsOverviewCard from '@/components/share/GoodsOverviewCard';
// Centralized routes for consistent paths
import { BASE_ROUTES } from '@/utils/routes';

/**
 * Interface for shared item data from database
 */
interface SharedItemData {
  id: string;
  content_type: 'events' | 'safety' | 'skills' | 'goods';
  content_id: string;
  neighborhood_id: string;
  share_code: string;
  shared_by: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  is_active: boolean;
}

/**
 * SharePage Component
 * 
 * This page displays a public view of shared neighborhood items.
 * It can be accessed by anyone with the share link, no authentication required.
 * 
 * Features:
 * - Loads shared item by share code
 * - Shows content-specific overview cards
 * - Increments view count when accessed
 * - Shows smart action buttons based on user authentication status
 * - Handles expired or invalid share links gracefully
 */
const SharePage = () => {
  // Get share code from URL parameters
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const user = useUser();
  
  // Component state
  const [sharedItem, setSharedItem] = useState<SharedItemData | null>(null);
  const [itemData, setItemData] = useState<any>(null);
  const [neighborhoodData, setNeighborhoodData] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load shared item and related data
   */
  useEffect(() => {
    const loadSharedItem = async () => {
      if (!shareCode) {
        setError('Invalid share link - no share code found.');
        setIsLoading(false);
        return;
      }

      try {
        console.log('[SharePage] Loading shared item:', shareCode);

        // Get shared item record
        const { data: sharedItemData, error: sharedItemError } = await supabase
          .from('shared_items')
          .select('*')
          .eq('share_code', shareCode)
          .eq('is_active', true)
          .single();

        if (sharedItemError || !sharedItemData) {
          console.error('[SharePage] Shared item not found:', sharedItemError);
          setError('This share link is invalid or has expired.');
          setIsLoading(false);
          return;
        }

        // Check if share has expired
        if (new Date(sharedItemData.expires_at) < new Date()) {
          console.error('[SharePage] Share link has expired');
          setError('This share link has expired.');
          setIsLoading(false);
          return;
        }

        setSharedItem(sharedItemData);

        // Increment view count (don't wait for this)
        supabase
          .from('shared_items')
          .update({ view_count: sharedItemData.view_count + 1 })
          .eq('id', sharedItemData.id)
          .then(() => console.log('[SharePage] View count incremented'));

        // Load the actual content data based on content type
        await loadContentData(sharedItemData);
        
        // Load neighborhood data
        await loadNeighborhoodData(sharedItemData.neighborhood_id);
        
        // Load invite code for join functionality
        await loadInviteCode(sharedItemData.shared_by, sharedItemData.neighborhood_id);

      } catch (error: any) {
        console.error('[SharePage] Error loading shared item:', error);
        setError('An error occurred while loading this share. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedItem();
  }, [shareCode]);

  /**
   * Load content data based on content type
   */
  const loadContentData = async (sharedItem: SharedItemData) => {
    const { content_type, content_id } = sharedItem;
    
    let query;
    
    switch (content_type) {
      case 'events':
        query = supabase
          .from('events')
          .select(`
            *,
            profiles:host_id (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('id', content_id)
          .single();
        break;
        
      case 'safety':
        query = supabase
          .from('safety_updates')
          .select(`
            *,
            profiles:author_id (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('id', content_id)
          .single();
        break;
        
      case 'skills':
        query = supabase
          .from('skills_exchange')
          .select(`
            *,
            profiles:user_id (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('id', content_id)
          .single();
        break;
        
      case 'goods':
        query = supabase
          .from('goods_exchange')
          .select(`
            *,
            profiles:user_id (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('id', content_id)
          .single();
        break;
        
      default:
        throw new Error(`Unknown content type: ${content_type}`);
    }

    const { data, error } = await query;
    
    if (error || !data) {
      throw new Error(`Failed to load ${content_type} data: ${error?.message}`);
    }

    setItemData(data);
  };

  /**
   * Load neighborhood data for context
   */
  const loadNeighborhoodData = async (neighborhoodId: string) => {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, city, state')
      .eq('id', neighborhoodId)
      .single();

    if (error) {
      console.warn('[SharePage] Failed to load neighborhood data:', error);
      return;
    }

    setNeighborhoodData(data);
  };

  /**
   * Load invite code for join functionality
   */
  const loadInviteCode = async (sharedBy: string, neighborhoodId: string) => {
    // Look for an active invitation from the user who shared this item
    const { data, error } = await supabase
      .from('invitations')
      .select('invite_code')
      .eq('inviter_id', sharedBy)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setInviteCode(data.invite_code);
    } else {
      console.warn('[SharePage] No invite code found for user:', sharedBy);
      // Could create a new invite code here if needed
    }
  };

  /**
   * Handle action button clicks
   */
  const handleActionClick = () => {
    if (user) {
      // Authenticated user - navigate to item in dashboard
      // Use centralized base routes to avoid hardcoded strings
      const routes = {
        events: BASE_ROUTES.calendar,
        safety: BASE_ROUTES.home,
        skills: BASE_ROUTES.skills,
        goods: BASE_ROUTES.goods
      } as const;
      
      const route = routes[sharedItem!.content_type];
      navigate(`${route}?highlight=${sharedItem!.content_id}`);
    } else {
      // Non-authenticated user - navigate to join flow
      if (inviteCode) {
        navigate(`/join/${inviteCode}`);
      } else {
        // Fallback to onboarding if no invite code
        navigate('/onboarding');
      }
    }
  };

  /**
   * Render the appropriate overview card based on content type
   */
  const renderOverviewCard = () => {
    if (!sharedItem || !itemData) return null;

    const commonProps = {
      data: itemData,
      neighborhoodData,
      onActionClick: handleActionClick,
      actionButtonText: user ? 'View in Dashboard' : `Join ${neighborhoodData?.name || 'Neighborhood'}`
    };

    switch (sharedItem.content_type) {
      case 'events':
        return <EventOverviewCard {...commonProps} />;
      case 'safety':
        return <SafetyOverviewCard {...commonProps} />;
      case 'skills':
        return <SkillsOverviewCard {...commonProps} />;
      case 'goods':
        return <GoodsOverviewCard {...commonProps} />;
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading shared item...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Share Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/')} variant="outline">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* User profile indicator for authenticated users */}
        {user && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">Signed in</span>
            </div>
          </div>
        )}

        {/* Main overview card */}
        {renderOverviewCard()}
        
        {/* Neighborhood context */}
        {neighborhoodData && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Shared from {neighborhoodData.name}
            {neighborhoodData.city && neighborhoodData.state && (
              <span> in {neighborhoodData.city}, {neighborhoodData.state}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;