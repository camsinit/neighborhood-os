import * as React from 'npm:react@18.3.1';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22';

interface InvitationAcceptedEmailProps {
  accepterName: string;
  neighborhoodName: string;
  isAdminNotification: boolean;
  directoryUrl: string;
  dashboardUrl: string;
}

/**
 * Email template for notifying when someone accepts a neighborhood invitation
 * Adapts message based on whether it's for the inviter or admin
 */
export const InvitationAcceptedEmail = ({
  accepterName = 'Someone',
  neighborhoodName = 'Your Neighborhood',
  isAdminNotification = false,
  directoryUrl = '',
  dashboardUrl = '',
}: InvitationAcceptedEmailProps) => {
  // Different content based on recipient type
  const subject = isAdminNotification 
    ? `New member joined ${neighborhoodName}: ${accepterName}`
    : `${accepterName} accepted your invitation to ${neighborhoodName}`;

  const content = isAdminNotification ? {
    greeting: `Great news!`,
    mainMessage: `${accepterName} has joined ${neighborhoodName}.`,
    detail: `As the neighborhood admin, you can see all members in your neighborhood directory and help new neighbors get connected.`,
    closing: `Keep building your community!`,
    signature: `Best,\nThe NeighborhoodOS Team`,
    ctaText: 'View Member Directory',
    ctaUrl: directoryUrl
  } : {
    greeting: `Good news!`,
    mainMessage: `${accepterName} has accepted your invitation to join ${neighborhoodName}.`,
    detail: `Your neighborhood is growing! ${accepterName} is now part of the community and can start connecting with neighbors, sharing skills, and participating in events.`,
    closing: `Thanks for helping grow your neighborhood`,
    signature: `The NeighborhoodOS Team`,
    ctaText: 'Explore Your Neighborhood',
    ctaUrl: dashboardUrl
  };

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
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