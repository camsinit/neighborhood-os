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
import type { ActorRecipientEmailProps } from '../src/types/emailTypes'

interface BasicInvitationEmailProps extends ActorRecipientEmailProps {
  // Invitation-specific properties
  inviteUrl: string               // The specific invitation acceptance URL
  personalMessage?: string        // Optional personal message from inviter
  neighborhoodDescription?: string // Brief description of what the neighborhood is about
}

/**
 * Email template for basic neighborhood invitations
 * Sent when someone invites a new neighbor to join their neighborhood
 * Now uses unified parameter system for consistent personalization
 */
export const BasicInvitationEmail = ({
  // Unified base properties - consistent across all templates
  recipientName = 'neighbor',
  neighborhoodName = 'your neighborhood', 
  fromName = 'neighborhoodOS',
  
  // Actor-recipient properties - the inviter is the "actor"
  actorName = 'Your neighbor',     // e.g., "Your neighbor Sarah" (resolved by parameter system)
  actorAvatarUrl,                  // Optional avatar for the inviter
  actionDescription = 'invited you to join',  // What the actor did
  contentTitle = neighborhoodName, // What they're inviting them to
  primaryCtaText = 'Join Your Neighborhood',
  primaryCtaUrl: inviteUrl = 'https://neighborhoodos.com',
  
  // Invitation-specific properties
  personalMessage,                 // Optional personal note from the inviter
  neighborhoodDescription,         // Brief description of the neighborhood
}: BasicInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>{actorName} invited you to join {neighborhoodName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're invited to join {neighborhoodName}!</Heading>
        
        <Text style={greeting}>Hey there {recipientName}!</Text>
        
        {/* Show personal message if provided, otherwise use default messaging */}
        {personalMessage ? (
          <Text style={text}>
            {actorName} sent you this personal invitation to join {neighborhoodName}:
          </Text>
        ) : (
          <Text style={text}>
            {actorName} thought you'd be a great addition to the {neighborhoodName} neighborhood on neighborhoodOS.
          </Text>
        )}
        
        {/* Display personal message in a special style if provided */}
        {personalMessage && (
          <Text style={personalMessageStyle}>
            "{personalMessage}"
          </Text>
        )}
        
        <Text style={text}>
          {neighborhoodDescription || 
            "It's a simple way for neighbors to share useful stuff - like who's giving away extra tomatoes, when the next block party is, or if someone spotted a loose dog wandering around."
          }
        </Text>
        
        <Text style={text}>
          Ready to see what your neighbors are up to?
        </Text>
        
        <Link href={inviteUrl} style={ctaButton}>
          {primaryCtaText}
        </Link>
        
        <Text style={smallText}>
          Or copy and paste this link into your browser: {inviteUrl}
        </Text>
        
        <Text style={signOff}>
          Welcome to the neighborhood,<br />
          The {fromName} Team
        </Text>
        
        <Text style={footer}>
          You're receiving this because {actorName} invited you to join their neighborhood.
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

// New style for personal messages to make them stand out
const personalMessageStyle = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #0EA5E9',
  padding: '16px',
  margin: '16px 0',
  fontStyle: 'italic' as const,
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
};