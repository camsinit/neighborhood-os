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
  coverImageUrl?: string
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
    thisWeek: string
    weekAhead: string
    getInvolved: string[]
  }
}

export const WeeklySummaryEmail = ({
  neighborhoodName,
  neighborhoodId,
  memberName,
  weekOf,
  baseUrl,
  coverImageUrl,
  stats,
  highlights,
  aiContent,
}: WeeklySummaryEmailProps) => (
  <Html>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
    </Head>
    <Preview>{neighborhoodName} Weekly Neighborhood Digest</Preview>
    <Body style={main}>
      <Container style={container}>

        {/* Cover image header or text fallback */}
        {coverImageUrl ? (
          <div style={coverImageContainer}>
            <img src={coverImageUrl} alt={`${neighborhoodName} neighborhood`} style={coverImageStyle} />
            <div style={overlayContainer}>
              <Text style={overlayTitle}>{neighborhoodName}</Text>
              <Text style={overlayDate}>Week of {weekOf}</Text>
            </div>
          </div>
        ) : (
          <>
            <Text style={digestHeader}>{neighborhoodName}</Text>
            <Text style={digestSubheader}>Week of {weekOf}</Text>
          </>
        )}

        <Text style={greeting}>Hey neighbors!</Text>

        {/* This Week Section */}
        <Text style={thisWeekTitle}>This Week</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.thisWeek }} />

        {/* Show skill highlights naturally integrated */}
        {highlights.skillsByPerson.length > 0 && (
          <div style={skillsList}>
            {highlights.skillsByPerson.map((person, index) => (
              <Text key={index} style={skillItem}>
                <Link href={person.neighborProfileUrl} style={neighborNameLink}>{person.neighborName.split(' ')[0]}</Link>
                {person.skillCount === 1 ? (
                  <>
                    {' '}shared{' '}
                    <Link href={`${baseUrl}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${person.topSkills[0].id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skill`} style={skillNameLink}>
                      {person.topSkills[0].title}
                    </Link>
                  </>
                ) : (
                  <>
                    {' '}shared {person.skillCount} skills including{' '}
                    {person.topSkills.slice(0, 2).map((skill, skillIndex) => (
                      <span key={skillIndex}>
                        <Link href={`${baseUrl}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skill.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_skill`} style={skillNameLink}>
                          {skill.title}
                        </Link>
                        {skillIndex === 0 ? ' and ' : ''}
                      </span>
                    ))}
                  </>
                )}
                {person.skillCount > 1 && person.activityGroupId && (
                  <>
                    .{' '}
                    <Link href={`${baseUrl}/n/${neighborhoodId}/home?detail=${person.activityGroupId}&type=activity_group&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_neighbor_skills`} style={browseAllLink}>
                      See all of {person.neighborName.split(' ')[0]}'s offerings
                    </Link>
                  </>
                )}
                .
              </Text>
            ))}
          </div>
        )}

        {/* The Week Ahead Section */}
        <Text style={weekAheadTitle}>The Week Ahead</Text>
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.weekAhead }} />

        {/* Show upcoming events if any */}
        {highlights.upcomingEvents.length > 0 && (
          <div style={eventsList}>
            {highlights.upcomingEvents.map((event, index) => (
              <Text key={index} style={eventItem}>
                <Link href={`${baseUrl}/n/${neighborhoodId}/calendar?highlight=event&type=event&id=${event.id}&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_upcoming_event`} style={eventNameLink}>
                  {event.title}
                </Link>
                {' '}is {event.date}
                {event.attendees > 0 && ` (${event.attendees} attending)`}.
              </Text>
            ))}
          </div>
        )}

        {/* Ways to Get Involved Section */}
        <Text style={getInvolvedTitle}>Ways to Get Involved</Text>
        {aiContent.getInvolved.map((suggestion, index) => {
          // Color-code the links based on their type
          let coloredSuggestion = suggestion;

          // Apply event color (blue) to calendar/event links
          coloredSuggestion = coloredSuggestion.replace(
            /(<a href="[^"]*calendar[^"]*"[^>]*>)([^<]+)(<\/a>)/g,
            `$1<span style="color: #2563eb; text-decoration: none; font-weight: 500;">$2</span>$3`
          );

          // Apply skill color (green) to skills links
          coloredSuggestion = coloredSuggestion.replace(
            /(<a href="[^"]*skills[^"]*"[^>]*>)([^<]+)(<\/a>)/g,
            `$1<span style="color: #059669; text-decoration: none; font-weight: 500;">$2</span>$3`
          );

          // Apply group color (purple) to groups links
          coloredSuggestion = coloredSuggestion.replace(
            /(<a href="[^"]*groups[^"]*"[^>]*>)([^<]+)(<\/a>)/g,
            `$1<span style="color: #7c3aed; text-decoration: none; font-weight: 500;">$2</span>$3`
          );

          return (
            <Text key={index} style={paragraph} dangerouslySetInnerHTML={{ __html: `• ${coloredSuggestion}` }} />
          );
        })}

        <Text style={paragraph}>
          <Link href={`${baseUrl}/n/${neighborhoodId}?utm_source=email&utm_medium=email&utm_campaign=weekly_summary_dashboard`} style={ctaButton}>
            Visit Your Neighborhood Dashboard
          </Link>
        </Text>

        <Text style={signoff}>
          Stay neighborly,<br />
          The {neighborhoodName} Community
        </Text>

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
  width: '100%',
  // Mobile optimization
  '@media (max-width: 600px)': {
    padding: '16px 8px',
    maxWidth: '100%',
  },
};

// Cover image styles
const coverImageContainer = {
  position: 'relative' as const,
  width: '100%',
  height: '200px',
  margin: '0 0 24px 0',
  borderRadius: '8px',
  overflow: 'hidden',
  // Mobile optimization
  '@media (max-width: 600px)': {
    height: '150px',
    margin: '0 0 16px 0',
    borderRadius: '4px',
  },
};

const coverImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  display: 'block',
};

const overlayContainer = {
  position: 'absolute' as const,
  bottom: '0',
  left: '0',
  right: '0',
  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.6))',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'flex-end',
  // Mobile optimization
  '@media (max-width: 600px)': {
    padding: '12px',
  },
};

const overlayTitle = {
  fontSize: '24px',
  lineHeight: '24px',
  margin: '0 0 4px 0',
  color: '#ffffff',
  fontWeight: 'bold',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  // Mobile optimization
  '@media (max-width: 600px)': {
    fontSize: '20px',
    lineHeight: '20px',
  },
};

const overlayDate = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  color: '#ffffff',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  opacity: '0.9',
  // Mobile optimization
  '@media (max-width: 600px)': {
    fontSize: '14px',
    lineHeight: '18px',
  },
};

// Weekly Neighborhood Digest header styles (fallback)
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
  // Mobile optimization
  '@media (max-width: 600px)': {
    fontSize: '15px',
    lineHeight: '22px',
    margin: '0 0 16px 0',
  },
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
  // Mobile optimization
  '@media (max-width: 600px)': {
    padding: '10px 20px',
    fontSize: '15px',
    marginTop: '12px',
    display: 'block',
    textAlign: 'center',
  },
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
// Different colors for each section title - neutral and readable
const thisWeekTitle = {
  color: '#374151', // Neutral dark gray
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 12px 0',
  // Mobile optimization
  '@media (max-width: 600px)': {
    fontSize: '16px',
    margin: '16px 0 8px 0',
  },
};

const weekAheadTitle = {
  color: '#6b7280', // Medium gray
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 12px 0',
  // Mobile optimization
  '@media (max-width: 600px)': {
    fontSize: '16px',
    margin: '16px 0 8px 0',
  },
};

const getInvolvedTitle = {
  color: '#4b5563', // Darker medium gray
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 12px 0',
  // Mobile optimization
  '@media (max-width: 600px)': {
    fontSize: '16px',
    margin: '16px 0 8px 0',
  },
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
  // Mobile optimization
  '@media (max-width: 600px)': {
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 6px 0',
  },
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
  // Mobile optimization
  '@media (max-width: 600px)': {
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 6px 0',
  },
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
