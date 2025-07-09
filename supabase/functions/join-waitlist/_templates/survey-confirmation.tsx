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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface SurveyConfirmationEmailProps {
  firstName: string;
  neighborhoodName: string;
  city: string;
  state: string;
}

export const SurveyConfirmationEmail = ({
  firstName,
  neighborhoodName,
  city,
  state,
}: SurveyConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for completing our survey!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank you, {firstName}!</Heading>
        
        <Text style={text}>
          We've received your survey response and appreciate you taking the time to share your thoughts about neighborhoodOS.
        </Text>
        
        <Section style={summaryContainer}>
          <Text style={summaryTitle}>Your Information:</Text>
          <Text style={summaryItem}>
            <strong>Neighborhood:</strong> {neighborhoodName}
          </Text>
          <Text style={summaryItem}>
            <strong>Location:</strong> {city}, {state}
          </Text>
        </Section>
        
        <Text style={text}>
          Your insights help us understand what features matter most to neighbors like you. 
          We're using this feedback to build a platform that truly serves your community's needs.
        </Text>
        
        <Text style={text}>
          We'll keep you updated on our progress and let you know as soon as neighborhoodOS 
          is ready for your neighborhood. In the meantime, feel free to share neighborhoodOS 
          with other neighbors who might be interested!
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          Questions or suggestions? Reply to this email or reach out to us at{' '}
          <Link href="mailto:hello@neighborhoodos.com" style={link}>
            hello@neighborhoodos.com
          </Link>
        </Text>
        
        <Text style={footer}>
          Thanks for helping us build the future of neighborhood connection!
        </Text>
      </Container>
    </Body>
  </Html>
)

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

const summaryContainer = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const summaryTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const summaryItem = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
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