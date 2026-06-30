const { google } = require('googleapis');
const { getOAuth2Client } = require('./gmailService');

async function createTaskDocument(accessToken, taskTitle, docContent) {
  const auth = getOAuth2Client();
  auth.setCredentials({ access_token: accessToken });

  const docs = google.docs({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  try {
    // Create the document
    const createResponse = await docs.documents.create({
      requestBody: {
        title: `[CLUTCH] ${taskTitle} - Starter Document`,
      },
    });

    const documentId = createResponse.data.documentId;
    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    // Build document content
    const requests = [];
    let index = 1;

    // Section 1: Task Overview
    const sections = [
      { heading: '📋 Task Overview', body: docContent.overview },
      { heading: '🎯 Key Points to Cover', body: docContent.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n') },
      { heading: '📚 Resources & References', body: docContent.resources.map((r, i) => `${i + 1}. Search: "${r}"`).join('\n') },
      { heading: '✏️ Draft / Work Area', body: '\n[Start your work here]\n' },
      { heading: '✅ Checklist', body: docContent.checklist.map(c => `☐ ${c}`).join('\n') },
    ];

    for (const section of sections) {
      requests.push({
        insertText: { location: { index }, text: `${section.heading}\n` },
      });
      index += section.heading.length + 1;

      requests.push({
        updateParagraphStyle: {
          range: { startIndex: index - section.heading.length - 1, endIndex: index },
          paragraphStyle: { namedStyleType: 'HEADING_1' },
          fields: 'namedStyleType',
        },
      });

      requests.push({
        insertText: { location: { index }, text: `${section.body}\n\n` },
      });
      index += section.body.length + 2;
    }

    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });

    return { docUrl, documentId };
  } catch (error) {
    console.error('Google Docs creation error:', error.message);
    throw error;
  }
}

module.exports = { createTaskDocument };
