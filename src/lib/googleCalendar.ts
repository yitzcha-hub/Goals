// Google Calendar API integration

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID || '';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const GOOGLE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Initialize Google API
export async function initGoogleCalendar(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gapiInited && gisInited) {
      resolve();
      return;
    }

    // Load gapi
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      (window as any).gapi.load('client', async () => {
        await (window as any).gapi.client.init({
          discoveryDocs: [GOOGLE_DISCOVERY_DOC],
        });
        gapiInited = true;
        if (gisInited) resolve();
      });
    };
    document.body.appendChild(gapiScript);

    // Load gis
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: '', // defined later
      });
      gisInited = true;
      if (gapiInited) resolve();
    };
    gisScript.onerror = reject;
    document.body.appendChild(gisScript);
  });
}

// Authenticate with Google
export async function authenticateGoogle(): Promise<string> {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      } else {
        resolve(resp.access_token);
      }
    };

    if ((window as any).gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

// Create event in Google Calendar
export async function createGoogleCalendarEvent(event: {
  summary: string;
  description?: string;
  start: string;
  end: string;
  reminders?: number[];
}): Promise<any> {
  const request = {
    calendarId: 'primary',
    resource: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: event.end, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      reminders: {
        useDefault: false,
        overrides: event.reminders?.map(m => ({ method: 'popup', minutes: m })) || [{ method: 'popup', minutes: 30 }]
      }
    }
  };

  return (window as any).gapi.client.calendar.events.insert(request);
}

// Sign out
export function signOutGoogle(): void {
  const token = (window as any).gapi.client.getToken();
  if (token !== null) {
    (window as any).google.accounts.oauth2.revoke(token.access_token);
    (window as any).gapi.client.setToken('');
  }
}
