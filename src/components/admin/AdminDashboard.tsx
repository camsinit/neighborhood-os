/**
 * AdminDashboard - Overview stats and activity KPIs
 * 
 * Displays neighborhood overview statistics including:
 * - Member count and recent growth
 * - Activity KPIs for past week, month, year
 * - Member growth chart
 * - Quick actions for admins
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useNeighborhoodMembers } from '@/hooks/useNeighborhoodMembers';
import { Users, TrendingUp, Calendar, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { currentNeighborhood } = useNeighborhood();
  const { data: members, isLoading: membersLoading } = useNeighborhoodMembers();

  // Calculate member stats
  const totalMembers = members?.length || 0;
  const adminCount = members?.filter(m => m.neighborhood_role === 'admin').length || 0;
  const stewardCount = members?.filter(m => m.neighborhood_role === 'steward').length || 0;
  const neighborCount = members?.filter(m => m.neighborhood_role === 'neighbor').length || 0;

  // TODO: These will be implemented with real data in future iterations
  const mockStats = {
    weeklyActivity: 45,
    monthlyActivity: 180,
    yearlyActivity: 2100,
    newMembersThisWeek: 3,
    newMembersThisMonth: 8,
    activeUsersThisWeek: 12
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {membersLoading ? '...' : totalMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              +{mockStats.newMembersThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.weeklyActivity}</div>
            <p className="text-xs text-muted-foreground">
              Posts, events, and interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeUsersThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Active in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{mockStats.newMembersThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              New members this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Member Roles</CardTitle>
            <CardDescription>
              Distribution of roles in your neighborhood
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm">Admins</span>
              </div>
              <span className="font-medium">{adminCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Stewards</span>
              </div>
              <span className="font-medium">{stewardCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Neighbors</span>
              </div>
              <span className="font-medium">{neighborCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Activity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
            <CardDescription>
              Engagement over different time periods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Week</span>
              <span className="font-medium">{mockStats.weeklyActivity} activities</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-medium">{mockStats.monthlyActivity} activities</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Year</span>
              <span className="font-medium">{mockStats.yearlyActivity} activities</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Growth Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Member Growth</CardTitle>
          <CardDescription>
            Track how your neighborhood has grown over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Member growth chart will be implemented in future update
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;