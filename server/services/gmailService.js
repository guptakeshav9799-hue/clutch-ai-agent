const { google } = require('googleapis');

function getOAuth2Client() {
  const redirectBase = process.env.PRODUCTION_URL || 'http://localhost:3001';
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${redirectBase}/api/auth/callback`
  );
}

async function scanEmails(accessToken) {
  const auth = getOAuth2Client();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const afterDate = `${thirtyDaysAgo.getFullYear()}/${thirtyDaysAgo.getMonth() + 1}/${thirtyDaysAgo.getDate()}`;

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `(deadline OR due OR submission OR exam OR meeting OR assignment OR interview) after:${afterDate}`,
      maxResults: 50,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return [];
    }

    const emails = [];
    for (const msg of response.data.messages.slice(0, 50)) {
      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });

        const headers = detail.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const snippet = detail.data.snippet || '';

        emails.push({ subject, from, snippet, id: msg.id });
      } catch (e) {
        console.error(`Error fetching email ${msg.id}:`, e.message);
      }
    }

    return emails;
  } catch (error) {
    console.error('Gmail scan error:', error.message);
    throw error;
  }
}

function getDemoEmails() {
  return [
    {
      id: 'demo-email-001',
      subject: 'CS301 Lab Report Due Friday',
      from: 'prof.sharma@university.edu',
      snippet: 'Dear students, this is a reminder that your CS301 Data Structures Lab Report is due this Friday at 11:59 PM. Please submit via the university portal. The report should cover all experiments from weeks 1-6.',
    },
    {
      id: 'demo-email-002',
      subject: 'Interview Scheduled - Software Engineer Intern',
      from: 'hr@techcorp.com',
      snippet: 'Your technical interview for the Software Engineer Intern position has been scheduled for next Wednesday at 2:00 PM IST. Please prepare for coding challenges in algorithms and system design.',
    },
    {
      id: 'demo-email-003',
      subject: 'Research Paper Submission Deadline Extended',
      from: 'conference@ieee.org',
      snippet: 'The deadline for paper submissions to the IEEE conference has been extended to next Monday. Please ensure your paper follows the formatting guidelines provided.',
    },
  ];
}

module.exports = { scanEmails, getDemoEmails, getOAuth2Client };
