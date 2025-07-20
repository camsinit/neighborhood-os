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

interface OnboardingGoodsEmailProps {
  firstName: string;
  neighborhoodName: string;
  goodsLink: string;
}

export const OnboardingGoodsEmail = ({
  firstName = 'there',
  neighborhoodName = 'your neighborhood',
  goodsLink = 'https://neighborhoodos.com/goods',
}: OnboardingGoodsEmailProps) => (
  <Html>
    <Head />
    <Preview>One person's trash is another person's treasure (literally)</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>One person's trash is another person's treasure (literally)</Heading>
        
        <Text style={greeting}>{firstName},</Text>
        
        <Text style={text}>
          Got stuff you don't need? Need stuff you don't have? The freebies page is your new best friend.
        </Text>
        
        <Link href={goodsLink} style={ctaButton}>
          Browse Neighborhood Freebies
        </Link>
        
        <Text style={text}>
          From extra garden vegetables to that exercise bike you swore you'd use, neighbors in {neighborhoodName} are sharing all kinds of useful (and occasionally weird) stuff.
        </Text>
        
        <Text style={text}>
          It's like garage sale season, but without the early morning price negotiations.
        </Text>
        
        <Text style={footer}>
          Happy treasure hunting,<br />
          The neighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingGoodsEmail;

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
