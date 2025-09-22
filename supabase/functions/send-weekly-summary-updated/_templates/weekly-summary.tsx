import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import {
  getWeeklySummaryEventsURL,
  getWeeklySummarySkillsURL,
  getWeeklySummaryGoodsURL,
  getWeeklySummarySafetyURL,
  getWeeklySummaryDashboardURL,
  getWeeklySummarySettingsURL,
} from '../_utils/urlGenerator.ts'

interface WeeklySummaryEmailProps {
  neighborhoodName: string
  memberName: string
  weekOf: string
  baseUrl: string
  stats: {
    newMembers: number
    upcomingEvents: number
    activeSkillRequests: number
    availableSkills: number
    safetyUpdates: number
    newGroups: number        // NEW
    groupJoins: number       // NEW
    activeGroups: number     // NEW
  }
  highlights: {
    events: Array<{
      title: string
      date: string
      attendees: number
      isGroupEvent?: boolean  // NEW
    }>
    skills: Array<{
      title: string
      category: string
      requestType: string
    }>
    safety: Array<{
      title: string
      type: string
      daysAgo: number
    }>
    groups: {               // NEW
      newGroups: Array<{
        name: string
        type: string
        createdBy: string
        unitValue?: string
      }>
      recentJoins: Array<{
        memberName: string
        groupName: string
        groupType: string
      }>
      activeGroups: Array<{
        name: string
        type: string
        memberCount: number
        unitValue?: string
      }>
    }
  }
  aiContent: {
    newNeighborWelcome: string
    pastWeekRecap: string
    weekAheadPreview: string
  }
}

export const WeeklySummaryEmail = ({
  neighborhoodName,
  memberName,
  weekOf,
  baseUrl,
  stats,
  highlights,
  aiContent,
}: WeeklySummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Your weekly note from {neighborhoodName}</Preview>
    <Body style={main}>
      <Container style={container}>
        
        {/* Simple letter-style header */}
        <Text style={letterHeader}>{neighborhoodName}</Text>
        <Text style={dateText}>Week of {weekOf}</Text>
        
        <Text style={greeting}>Hi {memberName},</Text>
        
        {/* AI-Generated New Neighbor Welcome */}
        {aiContent.newNeighborWelcome && (
          <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.newNeighborWelcome }} />
        )}

        {/* AI-Generated Past Week Recap */}
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.pastWeekRecap }} />

        {/* UPDATED: Enhanced activity summary with groups */}
        {(stats.newMembers > 0 || stats.upcomingEvents > 0 || stats.activeSkillRequests > 0 || stats.availableSkills > 0 || stats.newGroups > 0 || stats.groupJoins > 0) && (
          <Text style={paragraph}>
            This week in numbers: 
            {stats.newMembers > 0 && ` ${stats.newMembers} new neighbors joined us`}
            {stats.newMembers > 0 && (stats.upcomingEvents > 0 || stats.activeSkillRequests > 0 || stats.availableSkills > 0 || stats.newGroups > 0) && ', '}
            {stats.upcomingEvents > 0 && `${stats.upcomingEvents} gatherings coming up`}
            {stats.upcomingEvents > 0 && (stats.activeSkillRequests > 0 || stats.availableSkills > 0 || stats.newGroups > 0) && ', '}
            {stats.availableSkills > 0 && `${stats.availableSkills} skills offered`}
            {stats.availableSkills > 0 && (stats.activeSkillRequests > 0 || stats.newGroups > 0) && ', '}
            {stats.activeSkillRequests > 0 && `${stats.activeSkillRequests} neighbors looking for help`}
            {stats.activeSkillRequests > 0 && stats.newGroups > 0 && ', '}
            {stats.newGroups > 0 && `${stats.newGroups} new groups created`}
            {stats.newGroups > 0 && stats.groupJoins > 0 && ', '}
            {stats.groupJoins > 0 && `${stats.groupJoins} neighbors joined groups`}
            .
          </Text>
        )}

        {/* NEW: Groups section - show if there's group activity */}
        {(highlights.groups.newGroups.length > 0 || highlights.groups.recentJoins.length > 0 || highlights.groups.activeGroups.length > 0) && (
          <>
            <Text style={sectionHeader}>👥 Groups & Community</Text>
            
            {/* New groups created */}
            {highlights.groups.newGroups.length > 0 && (
              <div style={subsection}>
                <Text style={subsectionTitle}>New Groups Created:</Text>
                {highlights.groups.newGroups.map((group, index) => (
                  <Text key={index} style={listItem}>
                    • <strong>{group.name}</strong> 
                    {group.type === 'physical' && group.unitValue && ` (${group.unitValue})`}
                    {group.type === 'social' && ' (Social Group)'}
                    {group.createdBy && ` - started by ${group.createdBy}`}
                  </Text>
                ))}
              </div>
            )}

            {/* Recent group joins */}
            {highlights.groups.recentJoins.length > 0 && (
              <div style={subsection}>
                <Text style={subsectionTitle}>New Group Members:</Text>
                {highlights.groups.recentJoins.slice(0, 5).map((join, index) => (
                  <Text key={index} style={listItem}>
                    • {join.memberName} joined <strong>{join.groupName}</strong>
                  </Text>
                ))}
              </div>
            )}

            {/* Active groups overview */}
            {highlights.groups.activeGroups.length > 0 && (
              <div style={subsection}>
                <Text style={subsectionTitle}>Active Groups:</Text>
                {highlights.groups.activeGroups.slice(0, 3).map((group, index) => (
                  <Text key={index} style={listItem}>
                    • <strong>{group.name}</strong> ({group.memberCount} members)
                    {group.type === 'physical' && group.unitValue && ` - ${group.unitValue}`}
                  </Text>
                ))}
                <Link href={`${baseUrl}/n/groups`} style={sectionLink}>
                  View all groups →
                </Link>
              </div>
            )}
          </>
        )}

        {/* Upcoming events */}
        {highlights.events.length > 0 && (
          <>
            <Text style={sectionHeader}>📅 Upcoming Gatherings</Text>
            {highlights.events.slice(0, 5).map((event, index) => (
              <Text key={index} style={listItem}>
                • <strong>{event.title}</strong> - {event.date}
                {event.attendees > 0 && ` (${event.attendees} attending)`}
                {event.isGroupEvent && ' 👥'}
              </Text>
            ))}
            <Link href={`${baseUrl}/calendar`} style={sectionLink}>
              View calendar →
            </Link>
          </>
        )}

        {/* Skills exchange - ENHANCED to show more */}
        {highlights.skills.length > 0 && (
          <>
            <Text style={sectionHeader}>🛠️ Skills & Help</Text>
            
            {/* Separate skills offered vs requested */}
            {highlights.skills.filter(s => s.requestType === 'offer').length > 0 && (
              <div style={subsection}>
                <Text style={subsectionTitle}>Skills Offered:</Text>
                {highlights.skills.filter(s => s.requestType === 'offer').slice(0, 5).map((skill, index) => (
                  <Text key={index} style={listItem}>
                    • <strong>{skill.title}</strong> ({skill.category})
                  </Text>
                ))}
              </div>
            )}

            {highlights.skills.filter(s => s.requestType === 'request').length > 0 && (
              <div style={subsection}>
                <Text style={subsectionTitle}>Help Requested:</Text>
                {highlights.skills.filter(s => s.requestType === 'request').slice(0, 5).map((skill, index) => (
                  <Text key={index} style={listItem}>
                    • <strong>{skill.title}</strong> ({skill.category})
                  </Text>
                ))}
              </div>
            )}

            <Link href={`${baseUrl}/skills`} style={sectionLink}>
              Browse all skills →
            </Link>
          </>
        )}

        {/* Safety updates */}
        {highlights.safety.length > 0 && (
          <>
            <Text style={sectionHeader}>🚨 Safety Updates</Text>
            {highlights.safety.map((update, index) => (
              <Text key={index} style={listItem}>
                • <strong>{update.title}</strong> ({update.type}) - {update.daysAgo} day{update.daysAgo !== 1 ? 's' : ''} ago
              </Text>
            ))}
            <Link href={`${baseUrl}/safety`} style={sectionLink}>
              View all safety updates →
            </Link>
          </>
        )}

        {/* AI-Generated Week Ahead Preview */}
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.weekAheadPreview }} />

        <Hr style={divider} />

        {/* Call to action */}
        <Text style={paragraph}>
          <Link href={baseUrl} style={ctaButton}>
            Visit Your Neighborhood Dashboard
          </Link>
        </Text>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            This weekly summary helps keep our community connected and informed. No algorithms deciding what you see - just real updates from real neighbors.
          </Text>
          <Text style={footerText}>
            You're receiving this because you're a member of {neighborhoodName}. 
            <Link href={`${baseUrl}/settings`} style={link}> Update your notification preferences</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WeeklySummaryEmail;

// UPDATED styles with new group section styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 12px',
  maxWidth: '600px',
};

const letterHeader = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const dateText = {
  color: '#666666',
  fontSize: '16px',
  margin: '0 0 32px 0',
};

const greeting = {
  color: '#1a1a1a',
  fontSize: '16px',
  margin: '0 0 16px 0',
};

const paragraph = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
};

// NEW: Section header style
const sectionHeader = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px 0',
};

// NEW: Subsection styles for groups
const subsection = {
  margin: '0 0 16px 0',
};

const subsectionTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const listItem = {
  color: '#404040',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 4px 0',
};

const sectionLink = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'none',
  fontWeight: '500',
  margin: '8px 0 0 0',
  display: 'block',
};

const divider = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '16px',
  marginTop: '16px',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '24px',
  marginTop: '32px',
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px 0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'none',
};
