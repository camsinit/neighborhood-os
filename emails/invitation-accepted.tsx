
import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

// Import unified email types for consistent relationship-aware messaging
import type { ActorRecipientEmailProps, AdminNotificationEmailProps } from '../src/types/emailTypes'

interface InvitationAcceptedEmailProps extends ActorRecipientEmailProps {
  // Invitation acceptance specific properties
  isAdminNotification: boolean;        // Determines if this is for admin or inviter
  directoryUrl?: string;               // Link to member directory for admins
  dashboardUrl?: string;               // Link to dashboard for inviters
  
  // Community context for admins
  communityStats?: {
    totalMembers: number;
    weeklyActivity: number;
  };
}

/**
 * Email template for notifying when someone accepts a neighborhood invitation
 * Now uses unified system with relationship-aware messaging:
 * - For inviter: "John accepted YOUR invitation" (personal ownership)
 * - For admin: "New member joined your neighborhood: John" (administrative awareness)
 */
export const InvitationAcceptedEmail = ({
  // Unified base properties
  recipientName = 'Neighbor',
  neighborhoodName = 'Your Neighborhood',
  fromName = 'neighborhoodOS',
  homeUrl = 'https://neighborhoodos.com/dashboard',
  
  // Actor-recipient properties - the accepter is the "actor"
  actorName = 'Someone',              // e.g., "John" or "Your neighbor John"
  actorAvatarUrl,                     // Optional avatar
  contentTitle = neighborhoodName,    // What they joined
  
  // Invitation acceptance specific properties  
  isAdminNotification = false,
  directoryUrl = 'https://neighborhoodos.com/neighbors',
  dashboardUrl = 'https://neighborhoodos.com/dashboard',
  communityStats,
}: InvitationAcceptedEmailProps) => {
  
  // Relationship-aware content based on recipient type
  // The unified parameter resolver handles this, but templates can still customize
  const content = isAdminNotification ? {
    greeting: `Great news!`,
    mainMessage: `${actorName} has joined ${neighborhoodName}.`,
    detail: communityStats 
      ? `Your community now has ${communityStats.totalMembers} members. As the neighborhood admin, you can see all members in your directory and help new neighbors get connected.`
      : `As the neighborhood admin, you can see all members in your neighborhood directory and help new neighbors get connected.`,
    closing: `Keep building your community!`,
    signature: `Best,\nThe ${fromName} Team`,
    ctaText: 'View Member Directory',
    ctaUrl: directoryUrl
  } : {
    greeting: `Good news, ${recipientName}!`,
    mainMessage: `${actorName} accepted your invitation to join ${neighborhoodName}.`,
    detail: `Your neighborhood is growing! ${actorName} is now part of the community and can start connecting with neighbors, sharing skills, and participating in events.`,
    closing: `Thanks for helping grow your neighborhood`,
    signature: `The ${fromName} Team`,
    ctaText: 'Explore Your Neighborhood', 
    ctaUrl: dashboardUrl
  };

  return (
    <Html>
      <Head />
    <Preview>{content.mainMessage}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{content.greeting}</Heading>
          <Text style={text}>
            {content.mainMessage}
          </Text>
          <Text style={text}>
            {content.detail}
          </Text>
          
          <Button
            href={content.ctaUrl}
            style={button}
          >
            {content.ctaText}
          </Button>
          
          <Text style={text}>
            {content.closing}
          </Text>
          <Text style={footer}>
            {content.signature}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default InvitationAcceptedEmail;

// Styles matching the NeighborhoodOS design system
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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#007cba',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '24px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  whiteSpace: 'pre-line' as const,
};
