/**
 * AdminReports - Usage analytics and reports
 * 
 * Features:
 * - Usage analytics: Active users, popular features, engagement trends
 * - Content reports: Post frequency, category breakdown
 * - Member reports: New member onboarding completion, inactive users  
 * - Export capabilities: CSV exports for all data
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, Users, FileText, Calendar, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminReports = () => {
  const { toast } = useToast();

  // Mock analytics data
  const usageStats = {
    dailyActiveUsers: 24,
    weeklyActiveUsers: 67,
    monthlyActiveUsers: 89,
    totalPosts: 156,
    totalEvents: 23,
    totalSkillShares: 45
  };

  const popularFeatures = [
    { name: 'Events', usage: 85, trend: 'up' },
    { name: 'Safety Updates', usage: 72, trend: 'up' },
    { name: 'Skills Exchange', usage: 68, trend: 'stable' },
    { name: 'Goods Exchange', usage: 45, trend: 'down' },
    { name: 'Neighbor Directory', usage: 91, trend: 'up' }
  ];

  const contentBreakdown = [
    { category: 'Events', count: 23, percentage: 35 },
    { category: 'Safety Updates', count: 18, percentage: 28 },
    { category: 'Skills Exchange', count: 12, percentage: 18 },
    { category: 'Goods Exchange', count: 8, percentage: 12 },
    { category: 'General Posts', count: 5, percentage: 7 }
  ];

  const memberMetrics = {
    totalMembers: 89,
    newThisMonth: 12,
    completedOnboarding: 76,
    onboardingRate: 85,
    inactiveUsers: 8,
    averageSessionTime: '12 min'
  };

  const handleExportData = (dataType: string) => {
    // TODO: Implement data export functionality
    toast({
      title: "Export Started",
      description: `${dataType} data export will be implemented in the next update.`,
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">
            Track your neighborhood's activity and engagement
          </p>
        </div>
        <Button onClick={() => handleExportData('All')} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export All Data
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{usageStats.dailyActiveUsers}</div>
            <p className="text-sm text-muted-foreground">Daily Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{usageStats.weeklyActiveUsers}</div>
            <p className="text-sm text-muted-foreground">Weekly Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{usageStats.monthlyActiveUsers}</div>
            <p className="text-sm text-muted-foreground">Monthly Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{usageStats.totalPosts}</div>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{usageStats.totalEvents}</div>
            <p className="text-sm text-muted-foreground">Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{usageStats.totalSkillShares}</div>
            <p className="text-sm text-muted-foreground">Skills Shared</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Reports</TabsTrigger>
          <TabsTrigger value="members">Member Reports</TabsTrigger>
        </TabsList>

        {/* Usage Analytics Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Features
                </CardTitle>
                <CardDescription>
                  Most used features in your neighborhood
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span>{feature.name}</span>
                        <span>{getTrendIcon(feature.trend)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${feature.usage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{feature.usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('Usage')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Usage Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement Trends
                </CardTitle>
                <CardDescription>
                  Activity levels over the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Engagement chart will be implemented in future update
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Reports Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Categories
                </CardTitle>
                <CardDescription>
                  Breakdown of posts by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" style={{
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                        }}></div>
                        <span>{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.count}</Badge>
                        <span className="text-sm text-muted-foreground w-8">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('Content')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Content Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Post Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Post Frequency
                </CardTitle>
                <CardDescription>
                  When your community is most active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monday</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm w-8">12</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tuesday</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-sm w-8">16</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Wednesday</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      <span className="text-sm w-8">18</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekend</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm w-8">8</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Member Reports Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Onboarding Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Member Onboarding
                </CardTitle>
                <CardDescription>
                  Track how well new members complete setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Members</span>
                  <Badge>{memberMetrics.totalMembers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>New This Month</span>
                  <Badge variant="outline">{memberMetrics.newThisMonth}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed Onboarding</span>
                  <div className="flex items-center gap-2">
                    <Badge>{memberMetrics.completedOnboarding}</Badge>
                    <span className="text-sm text-green-600">
                      ({memberMetrics.onboardingRate}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Inactive Users</span>
                  <Badge variant="destructive">{memberMetrics.inactiveUsers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg. Session Time</span>
                  <Badge variant="outline">{memberMetrics.averageSessionTime}</Badge>
                </div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExportData('Members')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Member Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Member Growth Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Member Growth</CardTitle>
                <CardDescription>
                  Track membership growth over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Member growth chart will be implemented in future update
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;