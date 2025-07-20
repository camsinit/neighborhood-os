
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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeEmailProps {
  firstName?: string
  neighborhoodName?: string
  homeLink?: string
  skillsLink?: string
  createEventLink?: string
}

export const WelcomeEmail = ({
  firstName = 'there',
  neighborhoodName = 'your neighborhood',
  homeLink = 'https://neighborhoodos.com/dashboard',
  skillsLink = 'https://neighborhoodos.com/skills',
  createEventLink = 'https://neighborhoodos.com/events/create'
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
            Hi {firstName},
          </Text>
          
          <Text style={text}>
            Welcome to {neighborhoodName}! You're now connected with your neighbors through neighborhoodOS, a platform that helps local communities thrive together.
          </Text>
          
          <Text style={text}>
            Here's how you can get started:
          </Text>
          
          <ul style={list}>
            <li style={listItem}>🏠 <Button style={inlineButton} href={homeLink}>Explore your neighborhood</Button> - See what's happening locally</li>
            <li style={listItem}>🤝 <Button style={inlineButton} href={skillsLink}>Share your skills</Button> - Offer help or find someone with the skills you need</li>
            <li style={listItem}>📅 <Button style={inlineButton} href={createEventLink}>Create an event</Button> - Organize gatherings and bring neighbors together</li>
          </ul>
          
          <Text style={text}>
            Your neighbors are excited to meet you and build stronger connections in {neighborhoodName}. Jump in whenever you're ready!
          </Text>
          
          <Button style={button} href={homeLink}>
            Visit Your Neighborhood
          </Button>
          
          <Text style={smallText}>
            Questions? Just reply to this email - we're here to help you make the most of your neighborhood community.
          </Text>
        </Section>
        
        <Section style={footerSection}>
          <Text style={footer}>
            Best regards,<br />
            The neighborhoodOS Team
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
