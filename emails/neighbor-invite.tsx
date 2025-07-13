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

interface NeighborInviteEmailProps {
  inviterName: string;
  neighborhoodName: string;
  inviteUrl: string;
}

/**
 * Email template for neighbor invitations
 * Sent when someone invites a new neighbor to join their neighborhood
 */
export const NeighborInviteEmail = ({
  inviterName = 'Your neighbor',
  neighborhoodName = 'your neighborhood',
  inviteUrl = 'https://neighborhoodos.com',
}: NeighborInviteEmailProps) => (
  <Html>
    <Head />
    <Preview>{inviterName} invited you to join {neighborhoodName} on NeighborhoodOS</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're invited to join {neighborhoodName}!</Heading>
        
        <Text style={greeting}>Hi there!</Text>
        
        <Text style={text}>
          {inviterName} thought you'd be a great addition to the {neighborhoodName} community on NeighborhoodOS.
        </Text>
        
        <Text style={text}>
          This isn't another social media rabbit hole, promise. Just a simple way for neighbors to share useful stuff - like who's giving away extra tomatoes, when the next block party is, or if someone spotted a loose dog wandering around.
        </Text>
        
        <Text style={text}>
          Ready to see what your neighbors are up to?
        </Text>
        
        <Link href={inviteUrl} style={ctaButton}>
          Join {neighborhoodName}
        </Link>
        
        <Text style={text}>
          This invite expires in 7 days (because nothing good lasts forever).
        </Text>
        
        <Text style={footer}>
          Welcome to the neighborhood,<br />
          The NeighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default NeighborInviteEmail;

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