
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
} from '@react-email/components'
import * as React from 'react'

// Import unified email types for consistency across all templates
import type { BaseEmailProps } from '../src/types/emailTypes'

interface WelcomeEmailProps extends BaseEmailProps {
  // Welcome-specific properties
  skillsUrl?: string         // Link to skills exchange with UTM tracking
  createEventUrl?: string    // Link to create events with UTM tracking
  
  // Template-specific customization
  welcomeMessage?: string    // Optional personalized welcome message
  nextSteps?: Array<{        // Optional next steps customization
    icon: string
    title: string
    description: string
    url: string
  }>
}

export const WelcomeEmail = ({
  // Use unified base properties for consistent naming and URL generation
  recipientName = 'there',
  neighborhoodName = 'your neighborhood',
  homeUrl = 'https://neighborhoodos.com/dashboard',
  skillsUrl = 'https://neighborhoodos.com/skills',
  createEventUrl = 'https://neighborhoodos.com/events/create',
  fromName = 'neighborhoodOS',
  
  // Welcome-specific properties with sensible defaults
  welcomeMessage,
  nextSteps = [
    {
      icon: '🏠',
      title: 'Explore your neighborhood',
      description: 'See what\'s happening locally',
      url: homeUrl
    },
    {
      icon: '🤝',
      title: 'Share your skills',
      description: 'Offer help or find someone with the skills you need',
      url: skillsUrl || 'https://neighborhoodos.com/skills'
    },
    {
      icon: '📅',
      title: 'Create an event',
      description: 'Organize gatherings and bring neighbors together',
      url: createEventUrl || 'https://neighborhoodos.com/events/create'
    }
  ]
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to your neighborhood community!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={h1}>Welcome to {neighborhoodName}! 👋</Heading>
        </Section>
        
        <Section style={contentSection}>
          <Text style={text}>
            Hi {recipientName},
          </Text>
          
          <Text style={text}>
            {welcomeMessage || 
              `Welcome to ${neighborhoodName}! You're now connected with your neighbors through neighborhoodOS, a platform that helps local communities thrive together.`
            }
          </Text>
          
          <Text style={text}>
            Here's how you can get started:
          </Text>
          
          {/* Render next steps dynamically - allows for future customization */}
          <ul style={list}>
            {nextSteps.map((step, index) => (
              <li key={index} style={listItem}>
                {step.icon} <Button style={inlineButton} href={step.url}>{step.title}</Button> - {step.description}
              </li>
            ))}
          </ul>
          
          <Text style={text}>
            Your neighbors are excited to meet you and build stronger connections in {neighborhoodName}. Jump in whenever you're ready!
          </Text>
          
          <Button style={button} href={homeUrl}>
            Visit Your Neighborhood
          </Button>
          
          <Text style={smallText}>
            Questions? Just reply to this email - we're here to help you make the most of your neighborhood community.
          </Text>
        </Section>
        
        <Section style={footerSection}>
          <Text style={footer}>
            Best regards,<br />
            The {fromName} Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logoSection = {
  padding: '32px 32px 0',
}

const contentSection = {
  padding: '0 32px',
}

const footerSection = {
  padding: '0 32px 32px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  paddingLeft: '0',
}

const listItem = {
  margin: '8px 0',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '32px 0',
}

const inlineButton = {
  backgroundColor: '#007ee6',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '4px 8px',
  display: 'inline',
}

const smallText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
}
