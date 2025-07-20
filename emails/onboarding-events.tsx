
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface OnboardingEventsEmailProps {
  firstName: string;
  neighborhoodName: string;
  eventsLink: string;
}

/**
 * Email 2 of onboarding series: Events Page
 * Encourages participation in neighborhood gatherings
 */
export const OnboardingEventsEmail = ({
  firstName = 'there',
  neighborhoodName = 'your neighborhood',
  eventsLink = 'https://neighborhoodos.com/events',
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
        
        <Text style={footer}>
          Happy event hunting,<br />
          The neighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingEventsEmail;

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

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  whiteSpace: 'pre-line' as const,
};
