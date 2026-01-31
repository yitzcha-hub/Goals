// Microsoft Graph API (Outlook Calendar) integration

const MS_CLIENT_ID = import.meta.env.VITE_MICROSOFT_GRAPH_CLIENT_ID || '';
const MS_REDIRECT_URI = window.location.origin;
const MS_SCOPES = ['Calendars.ReadWrite', 'User.Read'];

let msalInstance: any = null;

// Initialize MSAL
export async function initMicrosoftGraph(): Promise<void> {
  if (msalInstance) return;

  // Load MSAL library
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js';
    script.onload = () => {
      const msalConfig = {
        auth: {
          clientId: MS_CLIENT_ID,
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: MS_REDIRECT_URI,
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false,
        }
      };

      msalInstance = new (window as any).msal.PublicClientApplication(msalConfig);
      msalInstance.initialize().then(resolve).catch(reject);
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Authenticate with Microsoft
export async function authenticateMicrosoft(): Promise<string> {
  if (!msalInstance) {
    await initMicrosoftGraph();
  }

  const loginRequest = {
    scopes: MS_SCOPES,
  };

  try {
    const response = await msalInstance.loginPopup(loginRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Microsoft authentication error:', error);
    throw error;
  }
}

// Get access token
export async function getMicrosoftToken(): Promise<string> {
  if (!msalInstance) {
    await initMicrosoftGraph();
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    return authenticateMicrosoft();
  }

  const request = {
    scopes: MS_SCOPES,
    account: accounts[0],
  };

  try {
    const response = await msalInstance.acquireTokenSilent(request);
    return response.accessToken;
  } catch (error) {
    return authenticateMicrosoft();
  }
}

// Create event in Outlook Calendar
export async function createOutlookCalendarEvent(event: {
  subject: string;
  body?: string;
  start: string;
  end: string;
  reminders?: number[];
}): Promise<any> {
  const token = await getMicrosoftToken();

  const eventData = {
    subject: event.subject,
    body: {
      contentType: 'HTML',
      content: event.body || '',
    },
    start: {
      dateTime: event.start,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.end,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    isReminderOn: true,
    reminderMinutesBeforeStart: event.reminders?.[0] || 30,
  };

  const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error('Failed to create Outlook event');
  }

  return response.json();
}

// Sign out
export async function signOutMicrosoft(): Promise<void> {
  if (msalInstance) {
    await msalInstance.logoutPopup();
  }
}
