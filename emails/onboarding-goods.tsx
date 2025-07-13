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

interface OnboardingGoodsEmailProps {
  firstName: string;
  updatesLink: string;
}

/**
 * Email 5 of onboarding series: Updates Page
 * Explains safety/community updates without drama
 */
export const OnboardingGoodsEmail = ({
  firstName = 'there',
  updatesLink = 'https://neighborhoodos.com/safety',
}: OnboardingGoodsEmailProps) => (
  <Html>
    <Head />
    <Preview>Stay in the loop (without the drama)</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Stay in the loop (without the drama)</Heading>
        
        <Text style={greeting}>Hi {firstName},</Text>
        
        <Text style={text}>
          Remember group chats that spiral into debates about proper hedge trimming techniques? Yeah, we don't do that here.
        </Text>
        
        <Link href={updatesLink} style={ctaButton}>
          Check Neighborhood Updates
        </Link>
        
        <Text style={text}>
          The updates page is for simple, useful neighborhood info. Construction notices, lost pet alerts, "heads up about the ice cream truck route" - the good stuff without the commentary.
        </Text>
        
        <Text style={text}>
          Just neighbors keeping neighbors informed. Novel concept, we know.
        </Text>
        
        <Text style={footer}>
          Stay informed,<br />
          The NeighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingGoodsEmail;

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