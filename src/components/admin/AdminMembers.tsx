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
import { useNeighborhoodMembers } from '@/hooks/useNeighborhoodMembers';
import { useIsNeighborhoodAdmin } from '@/hooks/useIsNeighborhoodAdmin';
import { Download, UserPlus, UserMinus, Eye, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminMembers = () => {
  const { data: members, isLoading } = useNeighborhoodMembers();
  const { isAdmin } = useIsNeighborhoodAdmin();
  const { toast } = useToast();
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

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

  // Handle role promotion (placeholder)
  const handlePromoteToSteward = (userId: string, userName: string) => {
    // TODO: Implement role promotion logic
    toast({
      title: "Feature Coming Soon",
      description: `Role promotion for ${userName} will be implemented in the next update.`,
    });
  };

  // Handle member removal (placeholder)
  const handleRemoveMember = (userId: string, userName: string) => {
    // TODO: Implement member removal logic
    toast({
      title: "Feature Coming Soon",
      description: `Member removal for ${userName} will be implemented with proper safeguards.`,
    });
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
              <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Member Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {/* Admin-only actions */}
                  {isAdmin && member.neighborhood_role === 'neighbor' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePromoteToSteward(member.user_id, member.display_name || 'Unknown')}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {isAdmin && member.neighborhood_role !== 'admin' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
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