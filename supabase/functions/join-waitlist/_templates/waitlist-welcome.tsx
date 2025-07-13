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
  const hasSubmittedSurvey = firstName && lastName && neighborhoodName && city && state;
  
  return (
  <Html>
    <Head />
    <Preview>Welcome to neighborhoodOS - You're on the waitlist!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to neighborhoodOS!</Heading>
        
        {hasSubmittedSurvey ? (
          <>
            <Text style={text}>
              Thanks for submitting your neighborhood instigator survey, {firstName}! Here's what you shared with us:
            </Text>
            
            <Section style={listContainer}>
              <Text style={listItem}><strong>Neighborhood:</strong> {neighborhoodName} in {city}, {state}</Text>
              <Text style={listItem}><strong>Neighbors to onboard:</strong> {neighborsToOnboard || 0}</Text>
              <Text style={listItem}><strong>AI/Coding experience:</strong> {aiCodingExperience}</Text>
              <Text style={listItem}><strong>Open source interest:</strong> {openSourceInterest}</Text>
            </Section>
            
            <Text style={text}>
              We'll be analyzing responses from neighborhood instigators like yourself to determine the launch order. 
              You'll be notified when we're ready to onboard new neighborhoods.
            </Text>
            
            <Text style={text}>
              As a neighborhood instigator, you'll be the admin for {neighborhoodName} and responsible for inviting your neighbors once we launch.
            </Text>
          </>
        ) : (
          <>
            <Text style={text}>
              Thank you for joining our waitlist! We're excited to have you as part of the neighborhoodOS community.
            </Text>
            
            <Text style={text}>
              neighborhoodOS is building the future of neighborhood connection - a platform where neighbors can:
            </Text>
            
            <Section style={listContainer}>
              <Text style={listItem}>• Share and request items with neighbors</Text>
              <Text style={listItem}>• Offer and find skills within your community</Text>
              <Text style={listItem}>• Stay informed about neighborhood events and safety</Text>
              <Text style={listItem}>• Connect with neighbors who share your interests</Text>
            </Section>
            
            <Text style={text}>
              You'll be among the first to know when we launch in your area. Complete our quick survey to help us prioritize neighborhood launches.
            </Text>
            
            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`${baseUrl}/?survey=true&email=${encodeURIComponent(userEmail)}`}
              >
                Complete Survey
              </Button>
            </Section>
          </>
        )}
        
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