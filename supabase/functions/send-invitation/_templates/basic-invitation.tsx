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

interface BasicInvitationEmailProps {
  inviterName: string;
  neighborhoodName: string;
  inviteUrl: string;
  inviterAvatarUrl?: string;
  // Optional recipient name for personalized greeting (falls back to "neighbor")
  recipientName?: string;
  // Whether this is an admin invitation
  isAdminInvite?: boolean;
}

/**
 * Email template for basic neighborhood invitations
 * Sent when someone invites a new neighbor to join their neighborhood
 */
export const BasicInvitationEmail = ({
  inviterName = 'Your neighbor',
  neighborhoodName = 'your neighborhood',
  inviteUrl = 'https://neighborhoodos.com',
  inviterAvatarUrl,
  // Personalized greeting name derived by the edge function
  recipientName = 'Neighbor',
  isAdminInvite = false,
}: BasicInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your neighborhood is ready!</Preview>
    <Body style={main}>
      <Container style={container}>
        {inviterAvatarUrl && (
          <div style={titleContainer}>
            <img 
              src={inviterAvatarUrl} 
              alt={`${inviterName}'s profile`}
              style={avatarImage}
            />
          </div>
        )}
        
        {/* Personalized greeting using recipientName when provided */}
        <Text style={greeting}>Hi {recipientName || 'Neighbor'},</Text>

        {/* Core message - different copy for admin vs regular invitations */}
        {isAdminInvite ? (
          <>
            <Text style={text}>
              <strong>{neighborhoodName}</strong> is all set up in neighborhoodOS and ready for you to join as the neighborhood instigator!
            </Text>

            <Text style={text}>
              As the admin for the neighborhood, you'll be able to:
            </Text>

            {/* Simple bulleted list supported by React Email */}
            <ul style={list}>
              <li style={listItem}>Welcome your first neighbors</li>
              <li style={listItem}>Post updates and events</li>
              <li style={listItem}>Help keep the conversation friendly and useful</li>
            </ul>

            <Text style={text}>Your neighborhood awaits...</Text>
          </>
        ) : (
          <>
            <Text style={text}>
              <strong>{inviterName}</strong> invited you to join <strong>{neighborhoodName}</strong> on neighborhoodOS!
            </Text>

            <Text style={text}>
              Join your neighbors to:
            </Text>

            <ul style={list}>
              <li style={listItem}>Connect with people nearby</li>
              <li style={listItem}>Discover local events and activities</li>
              <li style={listItem}>Share skills and help each other out</li>
            </ul>

            <Text style={text}>Click below to join your neighborhood.</Text>
          </>
        )}
        
        {/* Clear action per new copy */}
        <Link href={inviteUrl} style={ctaButton}>
          Join Your Neighborhood
        </Link>
        
        <Text style={smallText}>
          Or copy and paste this link into your browser: {inviteUrl}
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

// Basic list styling for the bullet points in the new copy
const list = {
  color: '#555',
  paddingLeft: '20px',
  margin: '8px 0 16px',
};

const listItem = {
  margin: '6px 0',
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

const titleContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
};

const avatarImage = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  objectFit: 'cover' as const,
};