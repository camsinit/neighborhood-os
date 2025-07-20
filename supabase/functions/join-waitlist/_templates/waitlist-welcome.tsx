import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WaitlistWelcomeEmailProps {
  userEmail: string;
  baseUrl: string;
  firstName?: string;
  lastName?: string;
  neighborhoodName?: string;
  city?: string;
  state?: string;
  neighborsToOnboard?: number;
  aiCodingExperience?: string;
  openSourceInterest?: string;
}

export const WaitlistWelcomeEmail = ({
  userEmail,
  baseUrl,
  firstName,
  lastName,
  neighborhoodName,
  city,
  state,
  neighborsToOnboard,
  aiCodingExperience,
  openSourceInterest,
}: WaitlistWelcomeEmailProps) => {
  return (
  <Html>
    <Head />
    <Preview>Welcome to neighborhoodOS - You're on the waitlist!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to neighborhoodOS!</Heading>
        
        <Text style={text}>
          Thank you for joining our waitlist! We're excited to have you here.
        </Text>
        
        <Text style={text}>
          We're building a simple platform to help neighbors:
        </Text>
        
        <Section style={listContainer}>
          <Text style={listItem}>• Share and request items</Text>
          <Text style={listItem}>• Offer and find skills</Text>
          <Text style={listItem}>• Stay informed</Text>
          <Text style={listItem}>• Connect with neighbors</Text>
        </Section>
        
        <Text style={text}>
          You'll be among the first to know when we launch in your area.
        </Text>
        
        <Text style={text}>
          Stay tuned!
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          Questions? Reply to this email or reach out to us at{' '}
          <Link href="mailto:hello@neighborhoodos.com" style={link}>
            hello@neighborhoodos.com
          </Link>
        </Text>
        
        <Text style={footer}>
          Thanks for being part of the neighborhoodOS community!
        </Text>
      </Container>
    </Body>
  </Html>
)}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '40px 0 20px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const listContainer = {
  margin: '16px 0',
}

const listItem = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#007bff',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
}

const link = {
  color: '#007bff',
  textDecoration: 'underline',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
}