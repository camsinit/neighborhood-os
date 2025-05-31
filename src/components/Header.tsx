/**
 * Header Component
 * 
 * Main navigation header with user menu and notifications
 * Updated to use the new simplified notification system
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Home, Plus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useNeighborhood } from '@/contexts/neighborhood';
// Import from the new notification system
import { NotificationPopover } from '@/notifications';
// Import the new neighborhood creation functionality
import { useCreateNeighborhoodAccess } from '@/hooks/useCreateNeighborhoodAccess';
import { CreateNeighborhoodDialog } from '@/components/neighborhoods/CreateNeighborhoodDialog';

const Header = () => {
  const navigate = useNavigate();
  const user = useUser();
  const { currentNeighborhood, userNeighborhoods, switchNeighborhood } = useNeighborhood();
  const { hasAccess: canCreateNeighborhood } = useCreateNeighborhoodAccess();
  
  // State for create neighborhood dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  // Get user's display name or fallback
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand with Neighborhood Switcher */}
            <div className="flex items-center">
              {/* Neighborhood Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-xl font-bold text-gray-900 hover:text-blue-600 flex items-center"
                  >
                    <Home className="h-6 w-6 mr-2" />
                    {currentNeighborhood?.name || 'Neighborhood'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {/* Current Neighborhood */}
                  {currentNeighborhood && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                        Current: {currentNeighborhood.name}
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Other Neighborhoods */}
                  {userNeighborhoods && userNeighborhoods.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Switch to
                      </div>
                      {userNeighborhoods
                        .filter(n => n.id !== currentNeighborhood?.id)
                        .map((neighborhood) => (
                          <DropdownMenuItem
                            key={neighborhood.id}
                            onClick={() => switchNeighborhood(neighborhood.id)}
                            className="cursor-pointer"
                          >
                            {neighborhood.name}
                          </DropdownMenuItem>
                        ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Create New Neighborhood Option (Conditional) */}
                  {canCreateNeighborhood && (
                    <DropdownMenuItem
                      onClick={() => setShowCreateDialog(true)}
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create new neighborhood
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - Notifications and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications using the new system */}
              <NotificationPopover />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url} 
                        alt={displayName} 
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{displayName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Create Neighborhood Dialog */}
      <CreateNeighborhoodDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};

export default Header;
