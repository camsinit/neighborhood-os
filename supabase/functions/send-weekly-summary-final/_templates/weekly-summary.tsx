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
    createdEvents: Array<{
      title: string
      url: string
      createdAt: string
      eventTime: string
    }>
    upcomingEvents: Array<{
      title: string
      date: string
      attendees: number
      isGroupEvent?: boolean
    }>
    skillsByPerson: Array<{
      neighborName: string
      neighborUserId: string
      neighborProfileUrl: string
      skillCount: number
      topSkills: Array<{
        id: string
        title: string
        category: string
        requestType: string
      }>
      allSkills: Array<any>
    }>
    totalSkills: number
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

        {/* SKILLS EXCHANGE section - Curated community approach */}
        <Text style={skillsHeader}>🛠️ SKILLS EXCHANGE</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.skillsExchange }} />

        {/* Curated highlights by person */}
        {highlights.skillsByPerson.length > 0 && (
          <div style={skillsList}>
            {highlights.skillsByPerson.map((person, index) => (
              <div key={index} style={personSkillGroup}>
                {person.skillCount === 1 ? (
                  // Single skill - show normally
                  <Text style={skillItem}>
                    →{' '}
                    <Link href={`${baseUrl}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${person.topSkills[0].id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skill`} style={skillNameLink}>
                      {person.topSkills[0].title}
                    </Link>
                    {' '}- <Link href={person.neighborProfileUrl} style={neighborNameLink}><strong>{person.neighborName}</strong></Link>{' '}
                    {getSkillContext(person.topSkills[0].title, person.topSkills[0].category, person.neighborName, person.topSkills[0].requestType)}
                  </Text>
                ) : (
                  // Multiple skills - group them
                  <Text style={skillItem}>
                    →{' '}
                    <Link href={person.neighborProfileUrl} style={neighborNameLink}><strong>{person.neighborName}</strong></Link>
                    {' '}shared {person.skillCount} skills this week, including{' '}
                    {person.topSkills.map((skill, skillIndex) => (
                      <span key={skillIndex}>
                        <Link href={`${baseUrl}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skill.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skill`} style={skillNameLink}>
                          {skill.title}
                        </Link>
                        {skillIndex < person.topSkills.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {person.skillCount > 3 && (
                      <>
                        {' '}and {person.skillCount - 3} more.{' '}
                        <Link href={person.neighborProfileUrl} style={browseAllLink}>
                          View all of {person.neighborName}'s offerings →
                        </Link>
                      </>
                    )}
                  </Text>
                )}
              </div>
            ))}
          </div>
        )}

        {highlights.totalSkills > highlights.skillsByPerson.reduce((sum, p) => sum + p.skillCount, 0) && (
          <Text style={moreSkills}>
            Plus {highlights.totalSkills - highlights.skillsByPerson.reduce((sum, p) => sum + p.skillCount, 0)} more skills from other neighbors...{' '}
            <Link href={`${baseUrl}/n/${neighborhoodId}/skills?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skills_all`} style={browseAllLink}>
              Browse all {highlights.totalSkills} skills
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

        {/* CALENDAR EVENTS section - Curated community approach */}
        {highlights.createdEvents.length > 0 && (
          <>
            <Text style={calendarHeader}>📅 CALENDAR EVENTS</Text>
            <Text style={paragraph}>
              Your neighbors have been busy planning! This week brought {highlights.createdEvents.length} new events to the calendar, including{' '}
              {highlights.createdEvents.slice(0, 2).map((event, index) => (
                <span key={index}>
                  <Link href={event.url} style={eventNameLink}>
                    {event.title}
                  </Link>
                  {index < Math.min(highlights.createdEvents.length, 2) - 1 ? ' and ' : ''}
                </span>
              ))}
              {highlights.createdEvents.length > 2 && (
                <>
                  {' '}plus {highlights.createdEvents.length - 2} more gathering{highlights.createdEvents.length > 3 ? 's' : ''}.{' '}
                  <Link href={`${baseUrl}/n/${neighborhoodId}/calendar?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_calendar_all`} style={eventNameLink}>
                    Check out all the upcoming events →
                  </Link>
                </>
              )}
            </Text>
            
            {/* Visual separator */}
            <Text style={separator}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
          </>
        )}

        {/* THE WEEK AHEAD section - Two clear subsections */}
        <Text style={weekAheadHeader}>THE WEEK AHEAD</Text>
        
        {/* 1. Upcoming Events Subsection */}
        <Text style={subsectionTitle}>🗓️ Upcoming Events</Text>
        {highlights.upcomingEvents.length > 0 ? (
          <div style={eventsList}>
            {highlights.upcomingEvents.map((event, index) => (
              <Text key={index} style={eventItem}>
                →{' '}
                <Link href={`${baseUrl}/n/${neighborhoodId}/calendar?highlight=event&type=event&id=${event.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_upcoming_event`} style={eventNameLink}>
                  {event.title}
                </Link>
                {' '}on {event.date}
                {event.attendees > 0 && ` (${event.attendees} attending)`}
              </Text>
            ))}
          </div>
        ) : (
          <Text style={paragraph}>
            The calendar is wide open this week - check out the suggestions below for ways to get involved!
          </Text>
        )}

        {/* 2. Ways to be Neighborly Subsection */}
        <Text style={subsectionTitle}>🤝 Ways to be Neighborly</Text>
        <Text style={paragraph}>
          •{' '}
          <Link href={`${baseUrl}/n/${neighborhoodId}/calendar?create=true&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_create_event`} style={eventNameLink}>
            Organize a neighborhood coffee meetup, potluck, or group walk
          </Link>
          {' '}to bring everyone together this weekend.
        </Text>
        <Text style={paragraph}>
          •{' '}
          <Link href={`${baseUrl}/n/${neighborhoodId}/skills?create=true&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_share_skill`} style={skillNameLink}>
            Share a skill you're passionate about or ask for help with a project
          </Link>
          {' '}you've been putting off - your neighbors are here to help.
        </Text>
        <Text style={paragraph}>
          •{' '}
          <Link href={`${baseUrl}/n/${neighborhoodId}/groups?create=true&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_create_group`} style={groupNameLink}>
            Start a group for something you love or join an existing one
          </Link>
          {' '}to connect with neighbors who share your interests.
        </Text>

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

const calendarHeader = {
  color: '#2563eb', // Blue theme for calendar
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

// Event styles
const eventsList = {
  margin: '12px 0',
};

const eventItem = {
  color: '#404040',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 8px 0',
};

const eventNameLink = {
  color: '#2563eb', // Blue theme for events
  textDecoration: 'none',
  fontWeight: '600',
};

// Person skill grouping styles
const personSkillGroup = {
  margin: '0 0 12px 0',
};
