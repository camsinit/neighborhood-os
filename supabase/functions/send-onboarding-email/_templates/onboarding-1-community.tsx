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

interface OnboardingCommunityEmailProps {
  firstName: string;
  neighborhoodName: string;
  homeLink: string;
}

export const OnboardingCommunityEmail = ({
  firstName = 'there',
  neighborhoodName = 'your neighborhood',
  homeLink = 'https://neighborhoodos.com',
}: OnboardingCommunityEmailProps) => (
  <Html>
    <Head />
    <Preview>The scoop on what's happening in {neighborhoodName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>The scoop on what's happening in {neighborhoodName}</Heading>
        
        <Text style={greeting}>Hi {firstName},</Text>
        
        <Text style={text}>
          Ready for the grand tour? Your neighborhood homepage is where all the action happens.
        </Text>
        
        <Link href={homeLink} style={ctaButton}>
          Check Out Your Neighborhood
        </Link>
        
        <Text style={text}>
          Think of it as your neighborhood's front porch - you'll see who's doing what, what events are coming up, and get a general sense of the vibe.
        </Text>
        
        <Text style={text}>
          No algorithm deciding what you see. Just real updates from real neighbors about real stuff. Refreshing, right?
        </Text>
        
        <Text style={footer}>
          Take a peek and see what you've been missing,<br />
          The neighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingCommunityEmail;

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
