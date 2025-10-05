/**
 * EventPosts Component
 *
 * Displays a feed of event posts with:
 * - Collapsible posts that expand on click
 * - Author avatar and name
 * - Post title (always visible)
 * - Post content and images (visible when expanded)
 * - Chronological ordering (newest first)
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { CreateEventPostForm } from './CreateEventPostForm';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MessageSquarePlus } from 'lucide-react';
import { createLogger } from '@/utils/logger';
import { format } from 'date-fns';

const logger = createLogger('EventPosts');

interface EventPost {
  id: string;
  event_id: string;
  user_id: string;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface EventPostsProps {
  eventId: string;
  eventHostId: string;
}

export function EventPosts({ eventId, eventHostId }: EventPostsProps) {
  const user = useUser();
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user can post (is host or has RSVP'd)
  useEffect(() => {
    const checkPermission = async () => {
      if (!user) {
        setCanPost(false);
        return;
      }

      // Check if user is host
      if (user.id === eventHostId) {
        setCanPost(true);
        return;
      }

      // Check if user has RSVP'd
      const { data } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      setCanPost(!!data);
    };

    checkPermission();
  }, [user, eventId, eventHostId]);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('event_posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      logger.error('Error fetching event posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to new posts
    const channel = supabase
      .channel(`event_posts:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_posts',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const togglePost = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handlePostSuccess = () => {
    setShowCreateForm(false);
    fetchPosts();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading posts...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Discussion</h3>
        {canPost && !showCreateForm && (
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            style={{
              backgroundColor: 'hsl(var(--calendar-color))',
              color: 'white',
            }}
            className="hover:opacity-90"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      {/* Create post form */}
      {showCreateForm && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <CreateEventPostForm
            eventId={eventId}
            onSuccess={handlePostSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {canPost ? (
            <>
              <p className="mb-4">No posts yet. Be the first to share!</p>
              {!showCreateForm && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  style={{
                    backgroundColor: 'hsl(var(--calendar-color))',
                    color: 'white',
                  }}
                  className="hover:opacity-90"
                >
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </>
          ) : (
            <p>No posts yet. RSVP to join the discussion!</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const isExpanded = expandedPostId === post.id;

            return (
              <div
                key={post.id}
                className="border rounded-lg bg-white overflow-hidden transition-all"
              >
                {/* Post header - always visible */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => togglePost(post.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {post.profiles?.avatar_url ? (
                        <img
                          src={post.profiles.avatar_url}
                          alt={post.profiles.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {post.profiles?.display_name?.[0] || '?'}
                        </span>
                      )}
                    </div>

                    {/* Post info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {post.profiles?.display_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(post.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
                      {!isExpanded && (
                        <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                      )}
                    </div>

                    {/* Expand/collapse icon */}
                    <button
                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePost(post.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t bg-gray-50">
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>

                    {/* Images */}
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {post.image_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
