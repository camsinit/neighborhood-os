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

// Helper function to add context about how skills are useful with neighbor names
const getSkillContext = (skillTitle: string, category: string, neighborName: string, requestType: string): string => {
  const contexts = {
    'Internet Safety': `is offering their skills to help protect against online scams and keep your digital life secure`,
    'Transportation': `is available for rides when you need them, from grocery runs to appointments`,
    'Gardening/Landscaping': `can help transform your outdoor space with expert guidance`,
    'Notary Public': `offers official document services right in the neighborhood, no downtown trips needed`,
    'Crisis Management': `provides emergency planning expertise to keep your family prepared`,
    'Smart Home Setup': `offers tech installation help to modernize your home`,
    'Chucking Wood': `provides firewood prep services for cozy winter evenings`,
    'Computer Troubleshooting': `offers tech support from someone who actually knows what they're doing`,
    'Photography': `can help capture life's moments with professional guidance`,
    'Carpentry': `offers handy skills for home projects and repairs`,
    'Search and Rescue Experience': `provides safety expertise for outdoor adventures and emergency preparedness`
  };
  
  if (requestType === 'offer') {
    return contexts[skillTitle] || `offers ${category} expertise when you need it`;
  } else {
    return `needs ${category} help! This could be your moment to shine`;
  }
};

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
      id: string
      title: string
      category: string
      requestType: string
      neighborName: string
      neighborUserId: string
      neighborProfileUrl: string
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
    weekAhead: string
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
        <Text style={sectionTitle}>THE WEEK IN REVIEW</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.weekInReview }} />

        {/* Visual separator */}
        <Text style={separator}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

        {/* SKILLS EXCHANGE section */}
        <Text style={skillsHeader}>🛠️ SKILLS EXCHANGE</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.skillsExchange }} />

        {/* Fresh offers from neighbors */}
        {highlights.skills.filter(s => s.requestType === 'offer').length > 0 && (
          <>
            <Text style={subsectionTitle}>Fresh offers from your neighbors:</Text>
            <div style={skillsList}>
              {highlights.skills.filter(s => s.requestType === 'offer').slice(0, 8).map((skill, index) => (
                <Text key={index} style={skillItem}>
                  →{' '}
                  <Link href={`${baseUrl}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skill.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skill`} style={skillNameLink}>
                    {skill.title}
                  </Link>
                  {' '}- <Link href={skill.neighborProfileUrl} style={neighborNameLink}><strong>{skill.neighborName}</strong></Link>{' '}
                  {getSkillContext(skill.title, skill.category, skill.neighborName, skill.requestType)}
                </Text>
              ))}
            </div>
          </>
        )}

        {/* Neighbors looking for help */}
        {highlights.skills.filter(s => s.requestType === 'request').length > 0 && (
          <>
            <Text style={subsectionTitle}>Neighbors looking for help:</Text>
            <div style={skillsList}>
              {highlights.skills.filter(s => s.requestType === 'request').map((skill, index) => (
                <Text key={index} style={skillItem}>
                  →{' '}
                  <Link href={`${baseUrl}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skill.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skill`} style={skillNameLink}>
                    {skill.title}
                  </Link>
                  {' '}- <Link href={skill.neighborProfileUrl} style={neighborNameLink}><strong>{skill.neighborName}</strong></Link>{' '}
                  {getSkillContext(skill.title, skill.category, skill.neighborName, skill.requestType)}
                </Text>
              ))}
            </div>
          </>
        )}

        {stats.availableSkills > 8 && (
          <Text style={moreSkills}>
            Plus {stats.availableSkills - 8} more skills just waiting for the right moment...{' '}
            <Link href={`${baseUrl}/n/${neighborhoodId}/skills?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skills_all`} style={browseAllLink}>
              Browse all {stats.availableSkills} skills
            </Link>
          </Text>
        )}

        {/* Visual separator */}
        <Text style={separator}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

        {/* COMMUNITY GROUPS section */}
        <Text style={groupsHeader}>👥 COMMUNITY GROUPS</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.communityGroups }} />

        {/* Individual group links with recent updates */}
        {highlights.groups.activeGroups.length > 0 && (
          <div style={groupsList}>
            {highlights.groups.activeGroups.map((group, index) => (
              <Text key={index} style={groupItem}>
                <Link href={`${baseUrl}/n/${neighborhoodId}/groups?highlight=group&type=group&id=${group.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_group`} style={groupNameLink}>
                  {group.name}
                </Link>
                {' '}({group.memberCount} members){group.type === 'physical' && group.unitValue ? ` - ${group.unitValue}` : ''}
                <br />
                Recent activity: Planning neighborhood coffee meetup
              </Text>
            ))}
          </div>
        )}

        <Text style={paragraph}>
          Got an idea for a new group?{' '}
          <Link href={`${baseUrl}/n/${neighborhoodId}/groups?create=true&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_create_group`} style={createGroupLink}>
            Start your own group
          </Link>
        </Text>

        {/* Visual separator */}
        <Text style={separator}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

        {/* THE WEEK AHEAD section */}
        <Text style={weekAheadHeader}>THE WEEK AHEAD</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.weekAhead }} />

        <Text style={paragraph}>
          <Link href={`${baseUrl}/n/${neighborhoodId}?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_dashboard`} style={ctaButton}>
            Visit Your Neighborhood Dashboard
          </Link>
        </Text>

        {/* Quick Actions Section */}
        <Text style={quickActionsHeader}>🚀 WAYS TO GET INVOLVED THIS WEEK</Text>
        <div style={quickActionsList}>
          <Text style={quickActionItem}>
            • <Link href={`${baseUrl}/n/${neighborhoodId}/calendar?create=true&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_create_event`} style={eventActionLink}>
              Organize a neighborhood coffee meetup this Saturday morning
            </Link>
          </Text>
          <Text style={quickActionItem}>
            • <Link href={`${baseUrl}/n/${neighborhoodId}/skills?create=true&type=offer&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_offer_skill`} style={skillActionLink}>
              Share a skill you're good at (cooking, tech help, gardening tips)
            </Link>
          </Text>
          <Text style={quickActionItem}>
            • <Link href={`${baseUrl}/n/${neighborhoodId}/skills?create=true&type=request&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_request_skill`} style={skillActionLink}>
              Ask for help with a home project or learning something new
            </Link>
          </Text>
          <Text style={quickActionItem}>
            • <Link href={`${baseUrl}/n/${neighborhoodId}/groups?create=true&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_create_group`} style={groupActionLink}>
              Start a group for dog walkers, book club, or weekend hikers
            </Link>
          </Text>
          <Text style={quickActionItem}>
            • <Link href={`${baseUrl}/n/${neighborhoodId}/groups?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_join_group`} style={groupActionLink}>
              Post an update or event idea in one of your existing groups
            </Link>
          </Text>
        </div>

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
  fontSize: '16px',
  fontWeight: '600',
  margin: '12px 0 8px 0',
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

// NEW: Weekly Neighborhood Digest styles with theme colors
const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 12px 0',
};

// Theme-colored section headers
const skillsHeader = {
  color: '#059669', // Green theme for skills
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 12px 0',
};

const groupsHeader = {
  color: '#7c3aed', // Purple theme for groups  
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 12px 0',
};

const weekAheadHeader = {
  color: '#2563eb', // Blue theme for future/calendar
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

// NEW: Skill name links (green theme)
const skillNameLink = {
  color: '#059669',
  textDecoration: 'none',
  fontWeight: '600',
};

// NEW: Neighbor name links (green theme, bold)
const neighborNameLink = {
  color: '#059669',
  textDecoration: 'none',
  fontWeight: '700',
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
  color: '#059669', // Green theme to match skills
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

// NEW: Group name links (purple theme)
const groupNameLink = {
  color: '#7c3aed',
  textDecoration: 'none',
  fontWeight: '600',
};

const createGroupLink = {
  color: '#7c3aed', // Purple theme to match groups
  textDecoration: 'none',
  fontWeight: '500',
};

const signoff = {
  color: '#404040',
  fontSize: '16px',
  margin: '20px 0',
  fontStyle: 'italic',
};

// Quick Actions Styles
const quickActionsHeader = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const quickActionsList = {
  margin: '0 0 20px 0',
};

const quickActionItem = {
  color: '#404040',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
};

// Color-coordinated action links
const eventActionLink = {
  color: '#2563eb', // Blue for events/calendar
  textDecoration: 'none',
  fontWeight: '500',
};

const skillActionLink = {
  color: '#059669', // Green for skills
  textDecoration: 'none',
  fontWeight: '500',
};

const groupActionLink = {
  color: '#7c3aed', // Purple for groups
  textDecoration: 'none',
  fontWeight: '500',
};
