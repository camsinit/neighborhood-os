
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a logger for this function
const logger = createLogger('slack');

/**
 * Interface for waitlist signup notification
 */
interface WaitlistNotification {
  email: string;
  timestamp: string;
}

/**
 * Interface for survey submission notification
 */
interface SurveyNotification {
  email: string;
  firstName: string;
  lastName: string;
  neighborhoodName: string;
  city: string;
  state: string;
  neighborsToOnboard: number;
  aiCodingExperience: string;
  openSourceInterest: string;
  priorityScore: number;
  timestamp: string;
}

/**
 * Sends a formatted message to Slack webhook
 */
async function sendSlackMessage(message: any): Promise<void> {
  const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  
  if (!webhookUrl) {
    logger.error('SLACK_WEBHOOK_URL not configured');
    throw new Error('Slack webhook URL not configured');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    logger.error('Failed to send Slack message:', response.status, response.statusText);
    throw new Error(`Failed to send Slack message: ${response.status}`);
  }
}

/**
 * Formats and sends waitlist signup notification to Slack
 */
export async function notifyWaitlistSignup(data: WaitlistNotification): Promise<void> {
  logger.info('Sending waitlist signup notification:', data.email);
  
  const message = {
    text: "🎉 New Waitlist Signup!",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎉 New Waitlist Signup!"
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Email:*\n${data.email}`
          },
          {
            type: "mrkdwn",
            text: `*Signed up:*\n${new Date(data.timestamp).toLocaleString()}`
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Someone just joined the neighborhood dashboard waitlist! 🏘️"
          }
        ]
      }
    ]
  };

  await sendSlackMessage(message);
  logger.info('Waitlist notification sent successfully');
}

/**
 * Formats and sends survey submission notification to Slack
 */
export async function notifySurveySubmission(data: SurveyNotification): Promise<void> {
  logger.info('Sending survey submission notification:', data.email);
  
  const message = {
    text: "📝 Waitlist Survey Completed!",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📝 Waitlist Survey Completed!"
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Name:*\n${data.firstName} ${data.lastName}`
          },
          {
            type: "mrkdwn",
            text: `*Email:*\n${data.email}`
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Neighborhood:*\n${data.neighborhoodName}`
          },
          {
            type: "mrkdwn",
            text: `*Location:*\n${data.city}, ${data.state}`
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Neighbors to Onboard:*\n${data.neighborsToOnboard}`
          },
          {
            type: "mrkdwn",
            text: `*Priority Score:*\n${data.priorityScore}`
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*AI/Coding Experience:*\n${data.aiCodingExperience}`
          },
          {
            type: "mrkdwn",
            text: `*Open Source Interest:*\n${data.openSourceInterest}`
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Submitted at ${new Date(data.timestamp).toLocaleString()}`
          }
        ]
      }
    ]
  };

  await sendSlackMessage(message);
  logger.info('Survey notification sent successfully');
}

/**
 * Main edge function handler for Slack notifications
 * Can be called directly or used as a module
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const { type, data } = await req.json();
    
    logger.info('Received notification request:', type);

    switch (type) {
      case 'waitlist_signup':
        await notifyWaitlistSignup(data as WaitlistNotification);
        break;
      
      case 'survey_submission':
        await notifySurveySubmission(data as SurveyNotification);
        break;
      
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    return successResponse(null, 'Notification sent successfully');

  } catch (error: any) {
    logger.error('Error in notification handler:', error);
    return errorResponse(error.message);
  }
};

serve(handler);
