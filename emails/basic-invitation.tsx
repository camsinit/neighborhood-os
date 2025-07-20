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

interface BasicInvitationEmailProps {
  inviterName: string;
  neighborhoodName: string;
  inviteUrl: string;
}

/**
 * Email template for basic neighborhood invitations
 * Sent when someone invites a new neighbor to join their neighborhood
 */
export const BasicInvitationEmail = ({
  inviterName = 'Your neighbor',
  neighborhoodName = 'your neighborhood',
  inviteUrl = 'https://neighborhoodos.com',
}: BasicInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>{inviterName} invited you to join {neighborhoodName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're invited to join {neighborhoodName}!</Heading>
        
        <Text style={greeting}>Hey there neighbor!</Text>
        
        <Text style={text}>
          {inviterName} thought you'd be a great addition to the {neighborhoodName} neighborhood on neighborhoodOS.
        </Text>
        
        <Text style={text}>
          It's a simple way for neighbors to share useful stuff - like who's giving away extra tomatoes, when the next block party is, or if someone spotted a loose dog wandering around.
        </Text>
        
        <Text style={text}>
          Ready to see what your neighbors are up to?
        </Text>
        
        <Link href={inviteUrl} style={ctaButton}>
          Join {neighborhoodName}
        </Link>
        
        <Text style={smallText}>
          Or copy and paste this link into your browser: {inviteUrl}
        </Text>
        
        <Text style={signOff}>
          Welcome to the neighborhood,<br />
          Cam
        </Text>
        
        <Text style={footer}>
          You're receiving this because {inviterName} invited you to join their neighborhood.
          If you didn't expect this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BasicInvitationEmail;

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
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const ctaButton = {
  backgroundColor: '#0EA5E9',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '16px',
  margin: '24px 0',
};

const smallText = {
  color: '#777',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
};

const signOff = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 16px',
  whiteSpace: 'pre-line' as const,
};

const footer = {
  color: '#999',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '32px 0 0',
};