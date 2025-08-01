
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

interface OnboardingConclusionEmailProps {
  firstName: string;
  neighborhoodName: string;
  modulesLink: string;
}

/**
 * Email 7 of onboarding series: Neighborhood Modules
 * Final email explaining customization and concluding the series
 */
export const OnboardingConclusionEmail = ({
  firstName = 'there',
  neighborhoodName = 'your neighborhood',
  modulesLink = 'https://neighborhoodos.com/modules',
}: OnboardingConclusionEmailProps) => (
  <Html>
    <Head />
    <Preview>Making {neighborhoodName} work for everyone</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Making {neighborhoodName} work for everyone</Heading>
        
        <Text style={greeting}>Hey {firstName},</Text>
        
        <Text style={text}>
          Every neighborhood is different. Some love organizing elaborate holiday decorations, others just want to know when the garbage truck is running late.
        </Text>
        
        <Link href={modulesLink} style={ctaButton}>
          Explore Neighborhood Modules
        </Link>
        
        <Text style={text}>
          Neighborhood modules let your community customize neighborhoodOS for what matters to you. Think of it as the difference between a one-size-fits-all t-shirt and something actually tailored to fit.
        </Text>
        
        <Text style={text}>
          That's a wrap on your neighborhoodOS tour! You're all set to dive in and start connecting with your neighbors. Remember - the best neighborhood connections happen when people just show up and are genuinely helpful.
        </Text>
        
        <Text style={footer}>
          Your neighborhood, your way,<br />
          The neighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingConclusionEmail;

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
