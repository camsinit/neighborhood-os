import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface WaitlistWelcomeProps {
  firstName?: string;
  neighborhoodName?: string;
  city?: string;
  state?: string;
  neighborsToOnboard?: number;
  aiCodingExperience?: string;
  openSourceInterest?: string;
}

export const WaitlistWelcomeExample = ({
  firstName = "Sarah",
  neighborhoodName = "Sunset Hills",
  city = "Austin",
  state = "Texas", 
  neighborsToOnboard = 15,
  aiCodingExperience = "Advanced",
  openSourceInterest = "Very Interested"
}: WaitlistWelcomeProps) => (
  <Html>
    <Head />
    <Preview>Welcome to the NeighborhoodOS waitlist! Your neighborhood vision matters.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to the NeighborhoodOS Waitlist!</Heading>
        
        <Text style={text}>
          Hi {firstName}! 👋
        </Text>
        
        <Text style={text}>
          Thank you for your interest in bringing NeighborhoodOS to {neighborhoodName} in {city}, {state}! 
          We're excited about your vision to connect your neighbors through technology.
        </Text>

        <Section style={infoSection}>
          <Heading style={h2}>Your Submission Details:</Heading>
          <Text style={bulletText}>🏘️ <strong>Neighborhood:</strong> {neighborhoodName}</Text>
          <Text style={bulletText}>📍 <strong>Location:</strong> {city}, {state}</Text>
          <Text style={bulletText}>👥 <strong>Neighbors to onboard:</strong> {neighborsToOnboard}</Text>
          <Text style={bulletText}>💻 <strong>AI/Coding experience:</strong> {aiCodingExperience}</Text>
          <Text style={bulletText}>🔧 <strong>Open source interest:</strong> {openSourceInterest}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          As a neighborhood instigator, you'll be among the first to access our platform when we're 
          ready to onboard new neighborhoods. We'll notify you as soon as we can support {neighborhoodName}!
        </Text>
        
        <Text style={text}>
          In the meantime, feel free to think about which neighbors might be most excited to join 
          and help build a stronger community connection.
        </Text>
        
        <Text style={footer}>
          Best regards,<br />
          The NeighborhoodOS Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WaitlistWelcomeExample;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 10px 0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  margin: '24px 0',
  lineHeight: '24px',
};

const bulletText = {
  color: '#333',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '20px',
};

const infoSection = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '6px',
  margin: '24px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};