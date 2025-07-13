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

interface OnboardingDirectoryEmailProps {
  firstName: string;
  directoryLink: string;
}

export const OnboardingDirectoryEmail = ({
  firstName = 'there',
  directoryLink = 'https://neighborhoodos.com/neighbors',
}: OnboardingDirectoryEmailProps) => (
  <Html>
    <Head />
    <Preview>Meet your neighbors (they're actually pretty cool)</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Meet your neighbors (they're actually pretty cool)</Heading>
        
        <Text style={greeting}>{firstName},</Text>
        
        <Text style={text}>
          Ever wonder who that person is you wave to every morning? Or which neighbor has the amazing garden you admire on walks?
        </Text>
        
        <Link href={directoryLink} style={ctaButton}>
          Browse Neighborhood Directory
        </Link>
        
        <Text style={text}>
          The neighborhood directory helps you put names to faces and discover the interesting people living around you. Who knows - you might find your new favorite dog-walking buddy or discover someone who shares your obsession with sourdough starters.
        </Text>
        
        <Text style={footer}>
          Connecting neighbors, one introduction at a time,<br />
          The NeighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingDirectoryEmail;

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