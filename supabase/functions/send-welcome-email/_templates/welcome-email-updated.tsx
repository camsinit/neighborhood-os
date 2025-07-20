import * as React from 'npm:react@18.3.1';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22';

interface WelcomeEmailProps {
  firstName: string;
  neighborhoodName: string;
  homeLink: string;
  skillsLink: string;
  createEventLink: string;
}

/**
 * Updated Welcome Email template with proper CTA URLs
 * Sent when someone first joins a neighborhood
 */
export const WelcomeEmail = ({
  firstName = 'there',
  neighborhoodName = 'your neighborhood',
  homeLink = 'https://neighborhoodos.com/dashboard',
  skillsLink = 'https://neighborhoodos.com/skills',
  createEventLink = 'https://neighborhoodos.com/events/create',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {neighborhoodName}, {firstName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to {neighborhoodName}, {firstName}! 👋</Heading>
        
        <Text style={greeting}>Hey {firstName},</Text>
        
        <Text style={text}>
          Welcome to {neighborhoodName} on neighborhoodOS! 
        </Text>
        
        <Text style={text}>
          You're officially part of the neighborhood now. No turning back. (Just kidding - you can leave anytime, but we hope you won't want to.)
        </Text>
        
        <Text style={text}>
          Here's how to make the most of your new digital neighborhood:
        </Text>
        
        <Text style={sectionTitle}>🏠 Explore your neighborhood</Text>
        <Text style={text}>
          Check out what's happening around you
        </Text>
        <Link href={homeLink} style={ctaButton}>
          Explore Your Neighborhood
        </Link>
        
        <Text style={sectionTitle}>🤝 Share your skills</Text>
        <Text style={text}>
          Let neighbors know what you're good at (even if it's just making excellent grilled cheese)
        </Text>
        <Link href={skillsLink} style={secondaryButton}>
          Share Your Skills
        </Link>
        
        <Text style={sectionTitle}>🎉 Create your first event</Text>
        <Text style={text}>
          Host something simple and fun. Here are some low-effort ideas:
        </Text>
        <ul style={list}>
          <li style={listItem}>"Coffee on my porch" (bring your own mug)</li>
          <li style={listItem}>"Dog meetup at the park" (humans welcome too)</li>
          <li style={listItem}>"Neighborhood walk" (walking optional, chatting required)</li>
        </ul>
        
        <Link href={createEventLink} style={ctaButton}>
          Create Your First Event
        </Link>
        
        <Text style={text}>
          That's it! No 47-step tutorials or complicated setup. Just neighbors being neighborly.
        </Text>
        
        <Text style={text}>
          Questions? Just reply to this email. We're real people, not robots.
        </Text>
        
        <Text style={footer}>
          Welcome aboard,<br />
          The neighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// Styles matching NeighborhoodOS design system
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '40px 0 20px',
};

const greeting = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 16px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const sectionTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 8px 0',
};

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '4px 0',
};

const ctaButton = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '16px',
  margin: '16px 0',
};

const secondaryButton = {
  backgroundColor: '#f7fafc',
  color: '#667eea',
  border: '2px solid #667eea',
  padding: '12px 26px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '16px',
  margin: '16px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  whiteSpace: 'pre-line' as const,
};
