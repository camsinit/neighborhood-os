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

interface WeeklySummaryEmailProps {
  neighborhoodName: string
  neighborhoodId: string
  memberName: string
  weekOf: string
  baseUrl: string
  stats: {
    newMembers: number
    upcomingEvents: number
    activeSkillRequests: number
    availableSkills: number
    newGroups: number        
    groupJoins: number       
    activeGroups: number     
  }
  highlights: {
    events: Array<{
      title: string
      date: string
      attendees: number
      isGroupEvent?: boolean
    }>
    skills: Array<{
      title: string
      category: string
      requestType: string
    }>
    groups: {
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
    weekInReview: string
    skillsExchange: string
    communityGroups: string
    fullPicture: string
  }
}

export const WeeklySummaryEmail = ({
  neighborhoodName,
  neighborhoodId,
  memberName,
  weekOf,
  baseUrl,
  stats,
  highlights,
  aiContent,
}: WeeklySummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>{neighborhoodName} Weekly Neighborhood Digest</Preview>
    <Body style={main}>
      <Container style={container}>
        
        {/* Weekly digest header */}
        <Text style={digestHeader}>{neighborhoodName}</Text>
        <Text style={digestSubheader}>Week of {weekOf}</Text>
        
        <Text style={greeting}>Hey neighbors! 👋</Text>
        
        {/* THE WEEK IN REVIEW section */}
        <Text style={sectionTitle}>**THE WEEK IN REVIEW**</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.weekInReview }} />

        {/* Visual separator */}
        <Text style={separator}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

        {/* SKILLS EXCHANGE section */}
        <Text style={sectionTitle}>🛠️ **SKILLS EXCHANGE**</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.skillsExchange }} />

        {/* Individual skill links with proper deep linking */}
        {highlights.skills.filter(s => s.requestType === 'offer').length > 0 && (
          <div style={skillsList}>
            {highlights.skills.filter(s => s.requestType === 'offer').slice(0, 8).map((skill, index) => (
              <Text key={index} style={skillItem}>
                → **{skill.title}** - {skill.category} skill available{' '}
                <Link href={`${baseUrl}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skill.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skill`} style={skillLink}>
                  [Get help →]
                </Link>
              </Text>
            ))}
          </div>
        )}

        {highlights.skills.filter(s => s.requestType === 'request').length > 0 && (
          <>
            <Text style={requestsTitle}>**Neighbors looking for help:**</Text>
            <div style={skillsList}>
              {highlights.skills.filter(s => s.requestType === 'request').map((skill, index) => (
                <Text key={index} style={skillItem}>
                  → **{skill.title}** - Someone needs {skill.category} help! This could be your moment to shine{' '}
                  <Link href={`${baseUrl}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skill.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skill`} style={skillLink}>
                    [Offer to help →]
                  </Link>
                </Text>
              ))}
            </div>
          </>
        )}

        {stats.availableSkills > 8 && (
          <Text style={moreSkills}>
            Plus {stats.availableSkills - 8} more skills just waiting for the right moment...{' '}
            <Link href={`${baseUrl}/n/${neighborhoodId}/skills?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skills_all`} style={browseAllLink}>
              [Browse all {stats.availableSkills} skills →]
            </Link>
          </Text>
        )}

        {/* Visual separator */}
        <Text style={separator}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

        {/* COMMUNITY GROUPS section */}
        <Text style={sectionTitle}>👥 **COMMUNITY GROUPS**</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.communityGroups }} />

        {/* Individual group links */}
        {highlights.groups.activeGroups.length > 0 && (
          <div style={groupsList}>
            {highlights.groups.activeGroups.map((group, index) => (
              <Text key={index} style={groupItem}>
                **{group.name}** - {group.memberCount} members{group.type === 'physical' && group.unitValue ? ` (${group.unitValue})` : ''}{' '}
                <Link href={`${baseUrl}/n/${neighborhoodId}/groups?highlight=group&type=group&id=${group.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_group`} style={groupLink}>
                  [Join {group.name} →]
                </Link>
              </Text>
            ))}
          </div>
        )}

        <Text style={paragraph}>
          Got an idea for a new group?{' '}
          <Link href={`${baseUrl}/n/${neighborhoodId}/groups?create=true&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_create_group`} style={createGroupLink}>
            [Start your own group →]
          </Link>
        </Text>

        {/* Visual separator */}
        <Text style={separator}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

        {/* THE FULL PICTURE section */}
        <Text style={sectionTitle}>**THE FULL PICTURE**</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.fullPicture }} />

        <Text style={paragraph}>
          <Link href={`${baseUrl}/n/${neighborhoodId}?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_dashboard`} style={ctaButton}>
            Visit Your Neighborhood Dashboard
          </Link>
        </Text>

        <Text style={signoff}>
          Stay neighborly,<br />
          The {neighborhoodName} Community
        </Text>

        {/* Visual separator */}
        <Text style={separator}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            You're getting this because you're part of the {neighborhoodName} family.{' '}
            <Link href={`${baseUrl}/n/${neighborhoodId}/settings?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_settings`} style={link}>
              Update your notification preferences →
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WeeklySummaryEmail;

// GAZETTE STYLES - Updated for bulletin board format
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 12px',
  maxWidth: '600px',
};

// Weekly Neighborhood Digest header styles
const digestHeader = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
  textAlign: 'center' as const,
};

const digestSubheader = {
  color: '#666666',
  fontSize: '16px',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
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

const sectionHeader = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px 0',
};

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

// NEW: Gazette-specific styles
const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 12px 0',
};

const separator = {
  color: '#cccccc',
  fontSize: '14px',
  margin: '20px 0',
  textAlign: 'center' as const,
  fontFamily: 'monospace',
};

const skillsList = {
  margin: '12px 0',
};

const skillItem = {
  color: '#404040',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 8px 0',
};

const skillLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
};

const requestsTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '16px 0 8px 0',
};

const moreSkills = {
  color: '#666666',
  fontSize: '14px',
  margin: '12px 0',
  fontStyle: 'italic',
};

const browseAllLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
};

const groupsList = {
  margin: '12px 0',
};

const groupItem = {
  color: '#404040',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 8px 0',
};

const groupLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
};

const createGroupLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
};

const signoff = {
  color: '#404040',
  fontSize: '16px',
  margin: '20px 0',
  fontStyle: 'italic',
};
