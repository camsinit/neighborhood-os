/**
 * AdminMembers - Member directory and role management
 * 
 * Features:
 * - Full member directory with contact info (respecting privacy settings)
 * - Role management: Promote neighbors to stewards (admin only)
 * - Member actions: Remove members, view member details
 * - Bulk operations: Export member emails
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNeighborhoodMembers } from '@/hooks/useNeighborhoodMembers';
import { useIsNeighborhoodAdmin } from '@/hooks/useIsNeighborhoodAdmin';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';
import { useNeighborhoodPhysicalConfig } from '@/hooks/useGroups';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, UserPlus, UserMinus, Eye, Mail, Phone, MapPin, Heart, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createLogger } from '@/utils/logger';

const AdminMembers = () => {
  const logger = createLogger('AdminMembers');
  const { data: members, isLoading } = useNeighborhoodMembers();
  const { data: physicalConfig } = useNeighborhoodPhysicalConfig();
  const { isAdmin } = useIsNeighborhoodAdmin();
  const { currentNeighborhood } = useNeighborhood();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [editingPhysicalUnit, setEditingPhysicalUnit] = useState<string | null>(null);

  // Get member initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'N';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary text-primary-foreground';
      case 'steward': return 'bg-blue-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Export member emails
  const handleExportEmails = () => {
    if (!members) return;
    
    // Filter members who have made their email visible
    const visibleEmails = members
      .filter(member => member.email_visible)
      .map(member => member.display_name || 'Unknown')
      .join(', ');
    
    // Create downloadable CSV content
    const csvContent = `Name,Role,Joined Date\n${members
      .filter(member => member.email_visible)
      .map(member => `"${member.display_name || 'Unknown'}","${member.neighborhood_role}","${new Date(member.joined_at).toLocaleDateString()}"`)
      .join('\n')}`;
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neighborhood-members.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Exported ${members.filter(m => m.email_visible).length} members with visible contact info.`,
    });
  };

  // Handle role promotion - now actually implements the functionality
  const handlePromoteToSteward = async (userId: string, userName: string) => {
    try {
      // Insert steward role into neighborhood_roles table
      const { error } = await supabase
        .from('neighborhood_roles')
        .insert({
          user_id: userId,
          neighborhood_id: currentNeighborhood?.id,
          role: 'steward'
        });

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `${userName} has been promoted to Steward successfully.`,
      });

      // Refresh the members list
      queryClient.invalidateQueries({ queryKey: ['neighborhood-members'] });
    } catch (error: any) {
      logger.error('Error promoting user', error);
      toast({
        title: "Error",
        description: `Failed to promote ${userName}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Handle member removal - now actually implements the functionality
  const handleRemoveMember = async (userId: string, userName: string) => {
    try {
      // Remove from neighborhood_members table
      const { error } = await supabase
        .from('neighborhood_members')
        .delete()
        .eq('user_id', userId)
        .eq('neighborhood_id', currentNeighborhood?.id);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: `${userName} has been removed from the neighborhood.`,
      });

      // Refresh the members list
      queryClient.invalidateQueries({ queryKey: ['neighborhood-members'] });
    } catch (error: any) {
      logger.error('Error removing user', error);
      toast({
        title: "Error",
        description: `Failed to remove ${userName}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Handle physical unit assignment update
  const handleUpdatePhysicalUnit = async (userId: string, userName: string, newPhysicalUnit: string | null) => {
    try {
      const { error } = await supabase
        .from('neighborhood_members')
        .update({ physical_unit_value: newPhysicalUnit })
        .eq('user_id', userId)
        .eq('neighborhood_id', currentNeighborhood?.id);

      if (error) throw error;

      toast({
        title: "Physical Unit Updated",
        description: `${userName}'s ${physicalConfig?.physical_unit_label?.toLowerCase() || 'physical unit'} assignment has been updated.`,
      });

      // Reset editing state and refresh data
      setEditingPhysicalUnit(null);
      queryClient.invalidateQueries({ queryKey: ['neighborhood-members'] });
      queryClient.invalidateQueries({ queryKey: ['physicalUnitsWithResidents'] });
    } catch (error: any) {
      logger.error('Error updating physical unit', error);
      toast({
        title: "Error",
        description: `Failed to update ${userName}'s assignment: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-600">
            Manage your neighborhood members and their roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportEmails} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Emails
          </Button>
        </div>
      </div>

      {/* Member Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{members?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {members?.filter(m => m.neighborhood_role === 'steward').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Stewards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {members?.filter(m => new Date(m.joined_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0}
            </div>
            <p className="text-sm text-muted-foreground">New This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            All neighborhood members with their contact information and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members?.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(member.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">
                        {member.display_name || 'Anonymous Neighbor'}
                      </h3>
                      <Badge className={getRoleBadgeColor(member.neighborhood_role)}>
                        {member.neighborhood_role}
                      </Badge>
                    </div>
                    
                    {/* Contact Info (respecting privacy settings) */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {member.email_visible && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>Email visible</span>
                        </div>
                      )}
                      {member.phone_visible && member.phone_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>Phone visible</span>
                        </div>
                      )}
                      {member.address_visible && member.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Address visible</span>
                        </div>
                      )}
                      {member.needs_visible && member.access_needs && (
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>Access needs shared</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Physical Unit Assignment - Only show if admin and physical units are configured */}
                    {isAdmin && physicalConfig?.physical_units && physicalConfig.physical_units.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-3 w-3 text-blue-500" />
                        {editingPhysicalUnit === member.user_id ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={member.physical_unit_value || ''}
                              onValueChange={(value) => handleUpdatePhysicalUnit(
                                member.user_id, 
                                member.display_name || 'Unknown',
                                value === '' ? null : value
                              )}
                            >
                              <SelectTrigger className="w-40 h-6 text-xs">
                                <SelectValue placeholder={`Select ${physicalConfig.physical_unit_label?.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">
                                  No {physicalConfig.physical_unit_label?.toLowerCase()}
                                </SelectItem>
                                {physicalConfig.physical_units.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingPhysicalUnit(null)}
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => setEditingPhysicalUnit(member.user_id)}
                          >
                            {member.physical_unit_value ? (
                              <span className="text-blue-600 font-medium">
                                {member.physical_unit_value}
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                Assign {physicalConfig.physical_unit_label?.toLowerCase()}
                              </span>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Member Actions - with hover effects and no border stroke */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-600"
                    title="View member details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {/* Admin-only actions */}
                  {isAdmin && member.neighborhood_role === 'neighbor' && (
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="hover:bg-green-50 hover:text-green-600"
                      title="Promote to Steward"
                      onClick={() => handlePromoteToSteward(member.user_id, member.display_name || 'Unknown')}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {isAdmin && member.neighborhood_role !== 'admin' && (
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50 hover:text-red-600"
                      title="Remove member"
                      onClick={() => handleRemoveMember(member.user_id, member.display_name || 'Unknown')}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {!members?.length && (
              <div className="text-center py-8 text-muted-foreground">
                No members found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMembers;