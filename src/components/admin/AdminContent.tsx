/**
 * AdminContent - Content moderation and management
 * 
 * Features:
 * - Content moderation tools: Review flagged posts, hide/remove content  
 * - Bulk content management: Archive old posts, manage categories
 * - Community guidelines: Set and edit neighborhood rules
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, Archive, Edit, Trash2, Eye, EyeOff, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminContent = () => {
  const { toast } = useToast();
  const [guidelines, setGuidelines] = useState(`# Community Guidelines

## Be Respectful
Treat all neighbors with kindness and respect. Personal attacks, harassment, or discrimination of any kind will not be tolerated.

## Stay On Topic
Keep discussions relevant to neighborhood matters. This includes local events, safety concerns, resource sharing, and community building.

## No Spam or Self-Promotion
Avoid excessive posting or promotional content. If you're sharing a business service, make sure it's valuable to the community.

## Protect Privacy
Don't share personal information about others without their consent. Be mindful of what you post publicly.

## Report Issues
If you see content that violates these guidelines, please report it to the neighborhood stewards or admins.`);

  // Mock data for demonstration
  const flaggedContent = [
    {
      id: '1',
      type: 'safety_update',
      title: 'Suspicious Activity Report',
      author: 'John D.',
      flagReason: 'Inappropriate language',
      flaggedBy: 'Jane S.',
      date: '2024-01-15',
      status: 'pending'
    },
    {
      id: '2', 
      type: 'goods_exchange',
      title: 'Free Furniture Available',
      author: 'Mike R.',
      flagReason: 'Spam/Commercial',
      flaggedBy: 'Sarah L.',
      date: '2024-01-14',
      status: 'pending'
    }
  ];

  const recentContent = [
    {
      id: '1',
      type: 'event',
      title: 'Neighborhood BBQ This Saturday',
      author: 'Community Center',
      date: '2024-01-15',
      category: 'Events',
      status: 'active'
    },
    {
      id: '2',
      type: 'safety_update', 
      title: 'Street Light Outage on Main St',
      author: 'City Services',
      date: '2024-01-14',
      category: 'Safety',
      status: 'active'
    },
    {
      id: '3',
      type: 'skills_exchange',
      title: 'Offering Math Tutoring Services',
      author: 'Teacher Parent',
      date: '2024-01-13',
      category: 'Skills',
      status: 'archived'
    }
  ];

  const handleSaveGuidelines = () => {
    // TODO: Implement guidelines saving
    toast({
      title: "Guidelines Updated",
      description: "Community guidelines have been saved successfully.",
    });
  };

  const handleContentAction = (contentId: string, action: string, title: string) => {
    // TODO: Implement content moderation actions
    toast({
      title: "Feature Coming Soon",
      description: `${action} action for "${title}" will be implemented in the next update.`,
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return '📅';
      case 'safety_update': return '🚨';
      case 'skills_exchange': return '🧠';
      case 'goods_exchange': return '🎁';
      default: return '📄';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="destructive">Pending Review</Badge>;
      case 'active': return <Badge variant="default">Active</Badge>;
      case 'archived': return <Badge variant="secondary">Archived</Badge>;
      case 'hidden': return <Badge variant="outline">Hidden</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
        <p className="text-gray-600">
          Moderate content and manage your neighborhood's community guidelines
        </p>
      </div>

      <Tabs defaultValue="flagged" className="space-y-6">
        <TabsList>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="recent">Recent Content</TabsTrigger>
          <TabsTrigger value="guidelines">Community Guidelines</TabsTrigger>
        </TabsList>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Flagged Content
              </CardTitle>
              <CardDescription>
                Review content that has been reported by community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flaggedContent.length > 0 ? (
                <div className="space-y-4">
                  {flaggedContent.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getContentTypeIcon(item.type)}</span>
                            <h3 className="font-medium">{item.title}</h3>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>By {item.author} • {item.date}</p>
                            <p className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              Flagged by {item.flaggedBy}: {item.flagReason}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleContentAction(item.id, 'View', item.title)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleContentAction(item.id, 'Hide', item.title)}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleContentAction(item.id, 'Remove', item.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="h-12 w-12 mx-auto mb-4" />
                  <p>No flagged content to review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Content Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Content</CardTitle>
              <CardDescription>
                Manage all recent posts and activities in your neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getContentTypeIcon(item.type)}</span>
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          By {item.author} • {item.date} • {item.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Community Guidelines
              </CardTitle>
              <CardDescription>
                Set the rules and expectations for your neighborhood community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Enter your community guidelines here..."
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveGuidelines}>
                  Save Guidelines
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;