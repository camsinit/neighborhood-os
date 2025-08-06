
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
  Section,
  Hr,
} from '@react-email/components';

interface WaitlistWelcomeEmailProps {
  userEmail: string;
  baseUrl?: string;
  firstName?: string;
  lastName?: string;
  neighborhoodName?: string;
  city?: string;
  state?: string;
  neighborsToOnboard?: number;
  aiCodingExperience?: string;
  openSourceInterest?: string;
}

/**
 * Welcome email for people who join the waitlist and complete the survey
 * Maintains friendly, anticipatory tone about community building
 */
export const WaitlistWelcomeEmail = ({
  userEmail,
  baseUrl = 'https://neighborhoodos.com',
  firstName = 'there',
  lastName,
  neighborhoodName,
  city,
  state,
  neighborsToOnboard,
  aiCodingExperience,
  openSourceInterest,
}: WaitlistWelcomeEmailProps) => {
  const hasSubmittedSurvey = firstName && firstName !== 'there' && lastName && neighborhoodName && city && state;
  
  return (
    <Html>
      <Head />
      <Preview>
        {hasSubmittedSurvey 
          ? "Thanks for your neighborhood instigator survey!" 
          : "Welcome to the neighborhoodOS waitlist!"
        }
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {hasSubmittedSurvey ? `Hey ${firstName}!` : 'Hey there!'}
          </Heading>
          
          {hasSubmittedSurvey ? (
            <>
              <Text style={text}>
                Thanks for filling out the neighborhood instigator survey. We love your enthusiasm for getting {neighborhoodName} started!
              </Text>
              
              <Text style={text}>
                Here's what you shared with us:
              </Text>
              
              <Section style={listContainer}>
                <Text style={listItem}><strong>Neighborhood:</strong> {neighborhoodName} in {city}, {state}</Text>
                <Text style={listItem}><strong>Neighbors to onboard:</strong> {neighborsToOnboard || 0}</Text>
                <Text style={listItem}><strong>AI/Coding experience:</strong> {aiCodingExperience}</Text>
                <Text style={listItem}><strong>Open source interest:</strong> {openSourceInterest}</Text>
              </Section>
              
              <Text style={text}>
                We're analyzing responses from neighborhood instigators like yourself to figure out launch order. 
                You'll get the heads up when we're ready to onboard new neighborhoods.
              </Text>
              
              <Text style={text}>
                As a neighborhood instigator, you'll be the admin for {neighborhoodName} and responsible for inviting your neighbors once we launch. No pressure, but we're counting on you to be awesome at it.
              </Text>
            </>
          ) : (
            <>
              <Text style={text}>
                Welcome to the neighborhoodOS waitlist!
              </Text>
              
              <Text style={text}>
                We're building the platform to help you create a more connected and caring neighborhood. We're building it thoughtfully, which means we're not rushing to launch everywhere at once. You'll be among the first to know when your area is ready.
              </Text>
              
              <Text style={text}>
                In the meantime, maybe start noticing which neighbors you actually want to connect with. That's about as much prep work as you need.
              </Text>
              
              <Text style={text}>
                Questions? Just reply to this email. We're real people who actually read these.
              </Text>
            </>
          )}
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Thanks for being part of the neighborhoodOS community (even though it doesn't fully exist yet),<br />
            The neighborhoodOS Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistWelcomeEmail;

// Styles matching the NeighborhoodOS design system and tone
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

const listContainer = {
  margin: '16px 0',
};

const listItem = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
};
