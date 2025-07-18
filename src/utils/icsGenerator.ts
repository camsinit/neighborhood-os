import { Event } from '../types/localTypes';
import { formatInTimeZone } from 'date-fns-tz';
import { parseISO, format } from 'date-fns';
import { toast } from 'sonner';

/**
 * Sanitizes text for ICS format by escaping special characters
 */
const sanitizeICSText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

/**
 * Formats a date for ICS format (YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS)
 */
const formatICSDate = (date: Date | string, timezone?: string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (timezone) {
    return formatInTimeZone(dateObj, timezone, "yyyyMMdd'T'HHmmss");
  } else {
    return format(dateObj, "yyyyMMdd'T'HHmmss'Z'");
  }
};

/**
 * Generates RRULE string for recurring events
 */
const generateRRule = (event: Event): string => {
  if (!event.is_recurring || !event.recurrence_pattern) {
    return '';
  }

  let freq = '';
  let interval = 1;

  switch (event.recurrence_pattern) {
    case 'daily':
      freq = 'DAILY';
      break;
    case 'weekly':
      freq = 'WEEKLY';
      break;
    case 'bi-weekly':
      freq = 'WEEKLY';
      interval = 2;
      break;
    case 'monthly':
      freq = 'MONTHLY';
      break;
    default:
      freq = 'WEEKLY';
  }

  let rrule = `RRULE:FREQ=${freq}`;
  
  if (interval > 1) {
    rrule += `;INTERVAL=${interval}`;
  }

  if (event.recurrence_end_date) {
    const endDate = formatICSDate(event.recurrence_end_date);
    rrule += `;UNTIL=${endDate}`;
  }

  return rrule;
};

/**
 * Generates VTIMEZONE component for ICS
 */
const generateVTimezone = (timezone: string): string => {
  const timezoneMap: { [key: string]: string } = {
    'America/Los_Angeles': 'Pacific Standard Time',
    'America/Denver': 'Mountain Standard Time',
    'America/Chicago': 'Central Standard Time',
    'America/New_York': 'Eastern Standard Time',
    'America/Anchorage': 'Alaska Standard Time',
    'Pacific/Honolulu': 'Hawaii Standard Time',
  };

  const tzName = timezoneMap[timezone] || timezone;

  return `BEGIN:VTIMEZONE
TZID:${timezone}
BEGIN:STANDARD
DTSTART:20071104T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
TZNAME:${tzName}
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:20070311T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
TZNAME:${tzName} Daylight Time
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
END:DAYLIGHT
END:VTIMEZONE`;
};

/**
 * Generates ICS content for an event
 */
export const generateICSContent = (event: Event, timezone: string): string => {
  const eventDate = parseISO(event.time);
  const dtStart = formatICSDate(eventDate, timezone);
  const dtEnd = formatICSDate(new Date(eventDate.getTime() + 60 * 60 * 1000), timezone);
  
  const now = new Date();
  const dtstamp = formatICSDate(now);
  
  const uid = `${event.id}@neighborhoodos.com`;
  const summary = sanitizeICSText(event.title);
  const description = sanitizeICSText(event.description || '');
  const location = sanitizeICSText(event.location || '');
  
  const rrule = generateRRule(event);
  const vtimezone = generateVTimezone(timezone);

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NeighborhoodOS//Calendar Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${vtimezone}
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART;TZID=${timezone}:${dtStart}
DTEND;TZID=${timezone}:${dtEnd}
SUMMARY:${summary}`;

  if (description) {
    icsContent += `\nDESCRIPTION:${description}`;
  }

  if (location) {
    icsContent += `\nLOCATION:${location}`;
  }

  if (rrule) {
    icsContent += `\n${rrule}`;
  }

  icsContent += `\nSTATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

/**
 * Sanitizes filename for download
 */
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
};

/**
 * Downloads an ICS file for the given event
 */
export const downloadICSFile = (event: Event, timezone: string): void => {
  try {
    const icsContent = generateICSContent(event, timezone);
    
    const eventDate = format(parseISO(event.time), 'yyyy-MM-dd');
    const sanitizedTitle = sanitizeFilename(event.title);
    const filename = `${sanitizedTitle}-${eventDate}.ics`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Calendar event downloaded!', {
      description: 'You can now import this event into your calendar app'
    });
  } catch (error: any) {
    console.error('Error downloading ICS file:', error);
    toast.error('Failed to download calendar event', {
      description: 'Please try again or contact support if the issue persists'
    });
  }
};
