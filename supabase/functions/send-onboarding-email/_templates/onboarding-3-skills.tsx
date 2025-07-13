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

interface OnboardingSkillsEmailProps {
  firstName: string;
  skillsLink: string;
}

export const OnboardingSkillsEmail = ({
  firstName = 'there',
  skillsLink = 'https://neighborhoodos.com/skills',
}: OnboardingSkillsEmailProps) => (
  <Html>
    <Head />
    <Preview>What are you surprisingly good at, {firstName}?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>What are you surprisingly good at, {firstName}?</Heading>
        
        <Text style={greeting}>Hey {firstName},</Text>
        
        <Text style={text}>
          Everyone's good at something. Maybe you make killer banana bread, know how to fix squeaky hinges, or can fold a fitted sheet properly (seriously, that's a superpower).
        </Text>
        
        <Link href={skillsLink} style={ctaButton}>
          Share Your Skills
        </Link>
        
        <Text style={text}>
          Share what you're good at, or find someone who can help with that thing you've been putting off for months. It's like a neighborhood favor exchange, but more organized and less awkward.
        </Text>
        
        <Text style={text}>
          Warning: You might actually enjoy helping your neighbors. Side effects include feeling useful and making new friends.
        </Text>
        
        <Text style={footer}>
          Share away,<br />
          The NeighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingSkillsEmail;

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