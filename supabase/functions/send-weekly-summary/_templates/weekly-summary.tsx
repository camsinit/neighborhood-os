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
    availableItems: number
    safetyUpdates: number
  }
  highlights: {
    events: Array<{
      title: string
      date: string
      attendees: number
    }>
    items: Array<{
      title: string
      category: string
      daysAgo: number
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
        
        {/* AI-Generated New Neighbor Welcome - simple paragraph style */}
        {aiContent.newNeighborWelcome && (
          <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.newNeighborWelcome }} />
        )}

        {/* AI-Generated Past Week Recap - simple paragraph style */}
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.pastWeekRecap }} />

        {/* Simple activity summary */}
        {(stats.newMembers > 0 || stats.upcomingEvents > 0 || stats.activeSkillRequests > 0 || stats.availableItems > 0) && (
          <Text style={paragraph}>
            This week in numbers: {stats.newMembers > 0 && `${stats.newMembers} new neighbors joined us`}
            {stats.newMembers > 0 && (stats.upcomingEvents > 0 || stats.activeSkillRequests > 0 || stats.availableItems > 0) && ', '}
            {stats.upcomingEvents > 0 && `${stats.upcomingEvents} gatherings coming up`}
            {stats.upcomingEvents > 0 && (stats.activeSkillRequests > 0 || stats.availableItems > 0) && ', '}
            {stats.activeSkillRequests > 0 && `${stats.activeSkillRequests} neighbors looking for help`}
            {stats.activeSkillRequests > 0 && stats.availableItems > 0 && ', '}
            {stats.availableItems > 0 && `${stats.availableItems} free items shared`}.
          </Text>
        )}

        {/* Upcoming events - simple list */}
        {highlights.events.length > 0 && (
          <>
            <Text style={sectionHeading}>Coming up this week:</Text>
            {highlights.events.map((event, index) => (
              <Text key={index} style={listItemText}>
                • <strong>{event.title}</strong> on {event.date} ({event.attendees} neighbors attending)
              </Text>
            ))}
            <Text style={paragraph}>
              <Link href={getWeeklySummaryEventsURL()} style={link}>See all upcoming gatherings</Link>
            </Text>
          </>
        )}

        {/* Skills - simple list */}
        {highlights.skills.length > 0 && (
          <>
            <Text style={sectionHeading}>Skills & help available:</Text>
            {highlights.skills.map((skill, index) => (
              <Text key={index} style={listItemText}>
                • <strong>{skill.title}</strong> ({skill.requestType === 'offered' ? 'someone offering help' : 'help needed'})
              </Text>
            ))}
            <Text style={paragraph}>
              <Link href={getWeeklySummarySkillsURL()} style={link}>Browse all skills and requests</Link>
            </Text>
          </>
        )}

        {/* Items - simple list */}
        {highlights.items.length > 0 && (
          <>
            <Text style={sectionHeading}>Free items available:</Text>
            {highlights.items.map((item, index) => (
              <Text key={index} style={listItemText}>
                • <strong>{item.title}</strong> ({item.category}, posted {item.daysAgo} day{item.daysAgo !== 1 ? 's' : ''} ago)
              </Text>
            ))}
            <Text style={paragraph}>
              <Link href={getWeeklySummaryGoodsURL()} style={link}>See all available items</Link>
            </Text>
          </>
        )}

        {/* Safety updates - simple list */}
        {highlights.safety.length > 0 && (
          <>
            <Text style={sectionHeading}>Neighborhood safety updates:</Text>
            {highlights.safety.map((update, index) => (
              <Text key={index} style={listItemText}>
                • <strong>{update.title}</strong> ({update.daysAgo} day{update.daysAgo !== 1 ? 's' : ''} ago)
              </Text>
            ))}
            <Text style={paragraph}>
              <Link href={getWeeklySummarySafetyURL()} style={link}>View all safety updates</Link>
            </Text>
          </>
        )}

        {/* AI-Generated Week Ahead Preview - simple paragraph */}
        <Text style={paragraph} dangerouslySetInnerHTML={{ __html: aiContent.weekAheadPreview }} />

        <Text style={paragraph}>
          <Link href={getWeeklySummaryDashboardURL()} style={ctaLink}>
            Visit your neighborhood dashboard
          </Link>
        </Text>

        {/* Simple footer */}
        <Text style={footerText}>
          Thanks for being part of what makes {neighborhoodName} a great place to live.{' '}
          <Link href={getWeeklySummarySettingsURL()} style={link}>Update your email preferences</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WeeklySummaryEmail

// Letter-style simple formatting
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Georgia, "Times New Roman", serif', // More letter-like font
  lineHeight: '1.6',
}

const container = {
  margin: '0 auto',
  padding: '30px 40px',
  maxWidth: '600px',
}

const letterHeader = {
  color: '#2c3e50',
  fontSize: '22px',
  fontWeight: 'normal',
  margin: '0 0 5px 0',
  textAlign: 'center' as const,
}

const dateText = {
  color: '#7f8c8d',
  fontSize: '14px',
  margin: '0 0 30px 0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
}

const greeting = {
  color: '#2c3e50',
  fontSize: '16px',
  margin: '0 0 20px 0',
}

const paragraph = {
  color: '#34495e',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 20px 0',
}

const sectionHeading = {
  color: '#2c3e50',
  fontSize: '16px',
  fontWeight: '600',
  margin: '25px 0 10px 0',
}

const listItemText = {
  color: '#34495e',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
  paddingLeft: '10px',
}

const link = {
  color: '#3498db',
  textDecoration: 'underline',
}

const ctaLink = {
  color: '#2980b9',
  textDecoration: 'none',
  fontWeight: '600',
  borderBottom: '2px solid #3498db',
  paddingBottom: '2px',
}

const footerText = {
  color: '#7f8c8d',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '30px 0 0 0',
  paddingTop: '20px',
  borderTop: '1px solid #ecf0f1',
  fontStyle: 'italic',
}
