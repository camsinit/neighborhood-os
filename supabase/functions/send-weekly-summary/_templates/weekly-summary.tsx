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
    welcomeMessage: string
    weeklyInsight: string
    communitySpotlight: string
    callToAction: string
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
    <Preview>Your {neighborhoodName} weekly neighborhood summary</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Weekly Summary</Heading>
        <Text style={subtitle}>{neighborhoodName} • Week of {weekOf}</Text>
        
        <Text style={greeting}>Hi {memberName},</Text>
        
        {/* AI-Generated Welcome Message */}
        <Section style={aiSection}>
          <Text style={aiText}>{aiContent.welcomeMessage}</Text>
          <Text style={aiText}>{aiContent.weeklyInsight}</Text>
        </Section>

        {/* Stats Section */}
        <Section style={statsSection}>
          <Heading style={h2}>This Week's Activity</Heading>
          <div style={statsGrid}>
            <div style={statItem}>
              <Text style={statNumber}>{stats.newMembers}</Text>
              <Text style={statLabel}>New neighbors joined</Text>
            </div>
            <div style={statItem}>
              <Text style={statNumber}>{stats.upcomingEvents}</Text>
              <Text style={statLabel}>Upcoming gatherings</Text>
            </div>
            <div style={statItem}>
              <Text style={statNumber}>{stats.activeSkillRequests}</Text>
              <Text style={statLabel}>Skills requested</Text>
            </div>
            <div style={statItem}>
              <Text style={statNumber}>{stats.availableItems}</Text>
              <Text style={statLabel}>Items shared</Text>
            </div>
          </div>
        </Section>

        <Hr style={divider} />

        {/* Upcoming Events */}
        {highlights.events.length > 0 && (
          <>
            <Section>
              <Heading style={h2}>🗓️ Upcoming Gatherings</Heading>
              {highlights.events.map((event, index) => (
                <div key={index} style={listItem}>
                  <Text style={itemTitle}>{event.title}</Text>
                  <Text style={itemDetails}>
                    {event.date} • {event.attendees} neighbors attending
                  </Text>
                </div>
              ))}
              <Link href={getWeeklySummaryEventsURL()} style={sectionLink}>
                View all gatherings →
              </Link>
            </Section>
            <Hr style={divider} />
          </>
        )}

        {/* Skills Exchange */}
        {highlights.skills.length > 0 && (
          <>
            <Section>
              <Heading style={h2}>🛠️ Skills & Help</Heading>
              {highlights.skills.map((skill, index) => (
                <div key={index} style={listItem}>
                  <Text style={itemTitle}>{skill.title}</Text>
                  <Text style={itemDetails}>
                    {skill.requestType === 'offered' ? 'Offering' : 'Looking for'} • {skill.category}
                  </Text>
                </div>
              ))}
              <Link href={getWeeklySummarySkillsURL()} style={sectionLink}>
                Browse all skills →
              </Link>
            </Section>
            <Hr style={divider} />
          </>
        )}

        {/* Available Items */}
        {highlights.items.length > 0 && (
          <>
            <Section>
              <Heading style={h2}>📦 Free Items Available</Heading>
              {highlights.items.map((item, index) => (
                <div key={index} style={listItem}>
                  <Text style={itemTitle}>{item.title}</Text>
                  <Text style={itemDetails}>
                    {item.category} • Posted {item.daysAgo} day{item.daysAgo !== 1 ? 's' : ''} ago
                  </Text>
                </div>
              ))}
              <Link href={getWeeklySummaryGoodsURL()} style={sectionLink}>
                See all available items →
              </Link>
            </Section>
            <Hr style={divider} />
          </>
        )}

        {/* Safety Updates */}
        {highlights.safety.length > 0 && (
          <>
            <Section>
              <Heading style={h2}>🚨 Safety Updates</Heading>
              {highlights.safety.map((update, index) => (
                <div key={index} style={listItem}>
                  <Text style={itemTitle}>{update.title}</Text>
                  <Text style={itemDetails}>
                    {update.type} • {update.daysAgo} day{update.daysAgo !== 1 ? 's' : ''} ago
                  </Text>
                </div>
              ))}
              <Link href={getWeeklySummarySafetyURL()} style={sectionLink}>
                View all safety updates →
              </Link>
            </Section>
            <Hr style={divider} />
          </>
        )}

        {/* AI-Generated Community Spotlight */}
        <Section style={aiSection}>
          <Heading style={h2}>🌟 Community Spotlight</Heading>
          <Text style={aiText}>{aiContent.communitySpotlight}</Text>
        </Section>

        <Hr style={divider} />

        {/* AI-Generated Call to Action */}
        <Section style={aiSection}>
          <Heading style={h2}>Stay Connected</Heading>
          <Text style={aiText}>{aiContent.callToAction}</Text>
          <Link href={getWeeklySummaryDashboardURL()} style={ctaButton}>
            Visit Your Neighborhood Dashboard
          </Link>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            This weekly summary helps keep our community connected and informed.
          </Text>
          <Text style={footerText}>
            You're receiving this because you're a member of {neighborhoodName}. 
            <Link href={getWeeklySummarySettingsURL()} style={link}>Update your notification preferences</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default WeeklySummaryEmail

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 12px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const subtitle = {
  color: '#666666',
  fontSize: '16px',
  margin: '0 0 32px 0',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  margin: '24px 0 16px 0',
}

const greeting = {
  color: '#1a1a1a',
  fontSize: '16px',
  margin: '0 0 16px 0',
}

const text = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
}

const statsSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
}

const statItem = {
  textAlign: 'center' as const,
}

const statNumber = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const statLabel = {
  color: '#666666',
  fontSize: '14px',
  margin: '4px 0 0 0',
}

const listItem = {
  borderLeft: '3px solid #e5e7eb',
  paddingLeft: '16px',
  marginBottom: '16px',
}

const itemTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 4px 0',
}

const itemDetails = {
  color: '#666666',
  fontSize: '14px',
  margin: '0',
}

const sectionLink = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'none',
  fontWeight: '500',
}

const divider = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
}

const footer = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '24px',
  marginTop: '32px',
}

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px 0',
}

const link = {
  color: '#2563eb',
  textDecoration: 'none',
}

// AI Content Styles
const aiSection = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  borderLeft: '4px solid #667eea',
}

const aiText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
}

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
}
