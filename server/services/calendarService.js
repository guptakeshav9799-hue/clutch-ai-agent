const { google } = require('googleapis');
const { getOAuth2Client } = require('./gmailService');

async function createCalendarEvents(accessToken, taskTitle, suggestedSchedule) {
  const auth = getOAuth2Client();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });
  const eventIds = [];

  try {
    for (const slot of suggestedSchedule) {
      const startTime = new Date(`${slot.date}T09:00:00`);
      const endTime = new Date(startTime.getTime() + slot.hours * 3600 * 1000);

      const event = {
        summary: `🔴 CLUTCH: Work on ${taskTitle}`,
        description: `Focus: ${slot.focus}\n\nThis time block was automatically created by Clutch AI to help you stay on track.`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 15 }],
        },
        colorId: '11', // Red
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      eventIds.push(response.data.id);
    }

    return eventIds;
  } catch (error) {
    console.error('Calendar event creation error:', error.message);
    throw error;
  }
}

async function checkCalendarStatus(accessToken) {
  try {
    const auth = getOAuth2Client();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.calendarList.list({ maxResults: 1 });
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

module.exports = { createCalendarEvents, checkCalendarStatus };
