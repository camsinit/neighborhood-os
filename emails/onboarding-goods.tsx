
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

// Import unified email types for consistency across all templates
import type { SystemBroadcastEmailProps } from '../src/types/emailTypes'

interface OnboardingGoodsEmailProps extends SystemBroadcastEmailProps {
  // Onboarding-specific properties
  firstName: string;          // Personal touch for onboarding series
  updatesLink: string;        // Link to the updates/goods page
  emailNumber?: number;       // Which email in the series (5th)
  nextEmailPreview?: string;  // Preview of what's coming next
}

/**
 * Onboarding email #5: Introducing the goods/updates page
 * Now uses unified system for consistent branding and tracking
 */
export const OnboardingGoodsEmail = ({
  // Unified base properties - automatically includes UTM tracking
  recipientName = 'there',            // Resolved display name with fallbacks
  neighborhoodName = 'your neighborhood',
  fromName = 'neighborhoodOS',
  homeUrl,                            // Dashboard link with UTM tracking
  
  // System broadcast properties
  personalizedGreeting,               // Optional custom greeting
  callToAction = {
    text: 'Check Neighborhood Updates',
    url: '',                          // Will be set from updatesLink
    description: 'Stay in the loop without the drama'
  },
  
  // Onboarding-specific properties (backwards compatibility)
  firstName,                          // Falls back to recipientName if not provided
  updatesLink = 'https://neighborhoodos.com/safety',
  emailNumber = 5,
  nextEmailPreview = 'Next, we\'ll show you the neighbor directory.'
}: OnboardingGoodsEmailProps) => {
  
  // Use firstName if provided, otherwise use unified recipientName
  const displayName = firstName || recipientName;
  const greeting = personalizedGreeting || `Hi ${displayName},`;
  
  // Set the CTA URL from updatesLink for backwards compatibility  
  callToAction.url = callToAction.url || updatesLink;
  
  return (
    <Html>
      <Head />
      <Preview>Stay in the loop (without the drama)</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Stay in the loop (without the drama)</Heading>
          
          <Text style={greetingStyle}>{greeting}</Text>
          
          <Text style={text}>
            Remember group chats that spiral into debates about proper hedge trimming techniques? Yeah, we don't do that here.
          </Text>
          
          <Link href={callToAction.url} style={ctaButton}>
            {callToAction.text}
          </Link>
          
          <Text style={text}>
            The updates page is for simple, useful neighborhood info. Construction notices, lost pet alerts, "heads up about the ice cream truck route" - the good stuff without the commentary.
          </Text>
          
          <Text style={text}>
            Just neighbors keeping neighbors informed. Novel concept, we know.
          </Text>
          
          {/* Preview of next email if provided */}
          {nextEmailPreview && (
            <Text style={previewText}>
              📧 Coming up: {nextEmailPreview}
            </Text>
          )}
          
          <Text style={footer}>
            Email {emailNumber} of your {neighborhoodName} onboarding series.<br/>
            Stay informed,<br />
            The {fromName} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

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

const greetingStyle = {
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

// New style for next email preview
const previewText = {
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
  fontSize: '14px',
  color: '#666666',
  fontStyle: 'italic' as const,
};
