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

interface OnboardingEventsEmailProps {
  firstName: string;
  neighborhoodName: string;
  eventsLink: string;
  createEventLink: string;
}

export const OnboardingEventsEmail = ({
  firstName = 'there',
  neighborhoodName = 'your neighborhood',
  eventsLink = 'https://neighborhoodos.com/events',
  createEventLink = 'https://neighborhoodos.com/events/create',
}: OnboardingEventsEmailProps) => (
  <Html>
    <Head />
    <Preview>What's happening around {neighborhoodName}?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>What's happening around {neighborhoodName}?</Heading>
        
        <Text style={greeting}>{firstName},</Text>
        
        <Text style={text}>
          Event planning doesn't have to be rocket science (unless you're hosting a rocket science meetup, in which case, cool).
        </Text>
        
        <Link href={eventsLink} style={ctaButton}>
          Browse Neighborhood Events
        </Link>
        
        <Text style={text}>
          See what's coming up in {neighborhoodName}, or create something yourself. Block parties, book clubs, or "let's all just sit outside and complain about the weather" gatherings - they're all fair game.
        </Text>
        
        <Text style={text}>
          Pro tip: The best neighborhood events are usually the simplest ones.
        </Text>
        
        <Link href={createEventLink} style={secondaryButton}>
          Create Your First Event
        </Link>
        
        <Text style={footer}>
          Happy event hunting,<br />
          The neighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingEventsEmail;

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

const ctaButton = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '16px',
  margin: '24px 0',
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
