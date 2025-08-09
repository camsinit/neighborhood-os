/**
 * AdminInvitations - Invitation management and analytics
 * 
 * Features:
 * - Invitation history: Track who invited whom, acceptance rates
 * - Bulk invite tools: Upload CSV, create multiple invites  
 * - Invitation analytics: Conversion rates, most successful inviters
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Upload, Users, TrendingUp, Copy, Send, FileUp, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminInvitations = () => {
  const { toast } = useToast();
  const [bulkEmails, setBulkEmails] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Mock data for demonstration
  const invitationStats = {
    totalSent: 45,
    totalAccepted: 32,
    conversionRate: 71,
    pendingInvites: 8,
    topInviters: [
      { name: 'Sarah Johnson', sent: 8, accepted: 6 },
      { name: 'Mike Chen', sent: 6, accepted: 5 },
      { name: 'Lisa Brown', sent: 5, accepted: 4 }
    ]
  };

  const recentInvitations = [
    {
      id: '1',
      email: 'newneighbor@email.com',
      invitedBy: 'Sarah Johnson',
      sentDate: '2024-01-15',
      status: 'pending',
      inviteCode: 'ABC123'
    },
    {
      id: '2',
      email: 'friend@email.com', 
      invitedBy: 'Mike Chen',
      sentDate: '2024-01-14',
      status: 'accepted',
      acceptedDate: '2024-01-15',
      inviteCode: 'DEF456'
    },
    {
      id: '3',
      email: 'neighbor@email.com',
      invitedBy: 'Lisa Brown', 
      sentDate: '2024-01-13',
      status: 'expired',
      inviteCode: 'GHI789'
    }
  ];

  const handleSendBulkInvites = () => {
    const emails = bulkEmails.split('\n').filter(email => email.trim());
    if (emails.length === 0) {
      toast({
        title: "No Emails Found",
        description: "Please enter at least one email address.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement bulk invite sending
    toast({
      title: "Feature Coming Soon", 
      description: `Bulk invites for ${emails.length} emails will be implemented in the next update.`,
    });
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      // TODO: Process CSV file
      toast({
        title: "CSV Uploaded",
        description: `File "${file.name}" ready for processing. Implementation coming soon.`,
      });
    }
  };

  const handleResendInvite = (inviteId: string, email: string) => {
    // TODO: Implement invite resending
    toast({
      title: "Feature Coming Soon",
      description: `Resending invite to ${email} will be implemented in the next update.`,
    });
  };

  const copyInviteLink = (inviteCode: string) => {
    // Always generate public, production-ready links for sharing
    const link = `https://neighborhoodos.com/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline">Pending</Badge>;
      case 'accepted': return <Badge variant="default">Accepted</Badge>;
      case 'expired': return <Badge variant="destructive">Expired</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Invitations</h2>
        <p className="text-gray-600">
          Manage neighborhood invitations and track engagement
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{invitationStats.totalSent}</div>
            <p className="text-sm text-muted-foreground">Total Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{invitationStats.totalAccepted}</div>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{invitationStats.conversionRate}%</div>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{invitationStats.pendingInvites}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Invitation History</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Invites</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Invitation History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invitations</CardTitle>
              <CardDescription>
                Track all invitations sent and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{invite.email}</span>
                        {getStatusBadge(invite.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Invited by {invite.invitedBy} on {invite.sentDate}</p>
                        {invite.acceptedDate && (
                          <p>Accepted on {invite.acceptedDate}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyInviteLink(invite.inviteCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {invite.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResendInvite(invite.id, invite.email)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Invites Tab */}
        <TabsContent value="bulk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email List Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email List
                </CardTitle>
                <CardDescription>
                  Enter email addresses, one per line
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="neighbor1@email.com&#10;neighbor2@email.com&#10;neighbor3@email.com"
                  className="min-h-[200px]"
                />
                <Button onClick={handleSendBulkInvites} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitations
                </Button>
              </CardContent>
            </Card>

            {/* CSV Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  CSV Upload
                </CardTitle>
                <CardDescription>
                  Upload a CSV file with email addresses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file with email addresses
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="mb-4"
                  />
                  {csvFile && (
                    <p className="text-sm text-green-600">
                      File uploaded: {csvFile.name}
                    </p>
                  )}
                </div>
                <Button variant="outline" className="w-full" disabled={!csvFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Process CSV File
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Inviters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Inviters
                </CardTitle>
                <CardDescription>
                  Members who have sent the most successful invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitationStats.topInviters.map((inviter, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{inviter.name}</span>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{inviter.accepted}/{inviter.sent}</div>
                        <div className="text-muted-foreground">
                          {Math.round((inviter.accepted / inviter.sent) * 100)}% success
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Conversion Trends
                </CardTitle>
                <CardDescription>
                  Track invitation success rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Conversion chart will be implemented in future update
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

export default AdminInvitations;