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

interface WelcomeEmailProps {
  userName?: string
  userEmail?: string
  loginUrl?: string
}

export const WelcomeEmail = ({
  userName = 'there',
  userEmail = 'user@example.com',
  loginUrl = 'https://yourapp.com/login'
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to our neighborhood platform!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={h1}>Welcome to NeighborhoodOS! 👋</Heading>
        </Section>
        
        <Section style={contentSection}>
          <Text style={text}>
            Hi {userName},
          </Text>
          
          <Text style={text}>
            We're excited to welcome you to our neighborhood platform! You're now part of a community that helps neighbors connect, share resources, and support each other.
          </Text>
          
          <Text style={text}>
            Here's what you can do:
          </Text>
          
          <ul style={list}>
            <li style={listItem}>🏠 Connect with neighbors nearby</li>
            <li style={listItem}>🤝 Share skills and resources</li>
            <li style={listItem}>📅 Join local events</li>
            <li style={listItem}>🚨 Stay updated on safety alerts</li>
          </ul>
          
          <Button style={button} href={loginUrl}>
            Get Started
          </Button>
          
          <Text style={smallText}>
            If you have any questions, just reply to this email. We're here to help!
          </Text>
        </Section>
        
        <Section style={footerSection}>
          <Text style={footer}>
            Best regards,<br />
            The NeighborhoodOS Team
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