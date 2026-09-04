import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// Helper to extract bearer token
function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7).trim();
}

// Firebase configuration route
app.get('/api/firebase-config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return res.json(config);
    }
  } catch (err) {
    console.error('Error reading firebase-applet-config.json:', err);
  }
  res.status(404).json({ error: 'Config not found' });
});

// Google Drive API Routes
app.get('/api/drive/about', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Drive about info:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/drive/files', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const { q, pageSize = 30, pageToken, filterAppFolder } = req.query;
    let queryParts = ['trashed = false'];
    if (q) {
      queryParts.push(`name contains '${q.replace(/'/g, "\\'")}'`);
    }

    const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
    driveUrl.searchParams.set('pageSize', pageSize);
    driveUrl.searchParams.set('fields', 'nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,description,owners)');
    driveUrl.searchParams.set('orderBy', 'modifiedTime desc');
    driveUrl.searchParams.set('q', queryParts.join(' and '));
    if (pageToken) driveUrl.searchParams.set('pageToken', pageToken);

    const response = await fetch(driveUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Error listing Drive files:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drive/upload', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const fileName = req.body.name || req.body.filename;
    const { content, mimeType = 'text/plain', description = '', createInAppFolder = true } = req.body;
    if (!fileName) return res.status(400).json({ error: 'File name is required' });

    let parentFolderId = null;
    if (createInAppFolder) {
      // Find or create "Consumer Tech Documentation" folder
      const folderQuery = "name = 'Consumer Tech Documentation' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        parentFolderId = searchData.files[0].id;
      } else {
        const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Consumer Tech Documentation',
            mimeType: 'application/vnd.google-apps.folder',
            description: 'Case studies, research logs, and experiment reports from Consumer Tech Documentation'
          })
        });
        const folderData = await createFolderRes.json();
        if (folderData.id) parentFolderId = folderData.id;
      }
    }

    const metadata = {
      name: fileName,
      mimeType,
      description
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
      (content || '') +
      closeDelimiter;

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    const fileData = await uploadRes.json();
    if (!uploadRes.ok) return res.status(uploadRes.status).json(fileData);
    res.json({
      success: true,
      file: fileData,
      webViewLink: fileData.webViewLink,
      folderId: parentFolderId
    });
  } catch (err) {
    console.error('Error uploading file to Drive:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/drive/files/:fileId', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const fileId = req.params.fileId;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 204 || response.ok) {
      return res.json({ success: true, message: 'File deleted successfully' });
    }
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Error deleting Drive file:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/drive/files/:fileId', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const fileId = req.params.fileId;
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,modifiedTime,webViewLink,description`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const metaData = await metaRes.json();
    if (!metaRes.ok) return res.status(metaRes.status).json(metaData);

    let textContent = null;
    // Attempt to download text/json content if small
    if (metaData.mimeType && (metaData.mimeType.startsWith('text/') || metaData.mimeType.includes('json') || metaData.mimeType.includes('markdown'))) {
      const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (contentRes.ok) {
        textContent = await contentRes.text();
      }
    }

    res.json({ ...metaData, content: textContent });
  } catch (err) {
    console.error('Error getting Drive file:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Google Gmail API Routes
// ==========================================

// Helper to decode Base64 / Base64URL string
function decodeBase64Url(str) {
  if (!str) return '';
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (e) {
    return '';
  }
}

// Helper to extract body from Gmail message payload
function extractMessageBody(payload) {
  if (!payload) return { text: '', html: '' };

  let text = '';
  let html = '';

  function traverse(part) {
    if (!part) return;
    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      text += decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
      html += decodeBase64Url(part.body.data);
    }

    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(traverse);
    }
  }

  if (payload.body && payload.body.data) {
    if (payload.mimeType === 'text/html') {
      html = decodeBase64Url(payload.body.data);
    } else {
      text = decodeBase64Url(payload.body.data);
    }
  }

  if (payload.parts) {
    payload.parts.forEach(traverse);
  }

  return { text, html };
}

// 1. Get Gmail User Profile
app.get('/api/gmail/profile', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Gmail profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Gmail Labels
app.get('/api/gmail/labels', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Gmail labels:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. List Gmail Messages (with preview metadata)
app.get('/api/gmail/messages', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const { q = 'label:INBOX', maxResults = 15, pageToken } = req.query;
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    if (q) url.searchParams.set('q', q);
    url.searchParams.set('maxResults', maxResults);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const listRes = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    if (!listRes.ok) return res.status(listRes.status).json(listData);

    const messages = listData.messages || [];
    // Fetch summary for top items in parallel (limiting concurrency)
    const detailedMessages = await Promise.all(
      messages.slice(0, 15).map(async (msg) => {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!detailRes.ok) return { id: msg.id, threadId: msg.threadId };
          const detail = await detailRes.json();
          const headers = (detail.payload && detail.payload.headers) || [];
          const headerMap = {};
          headers.forEach(h => { headerMap[h.name.toLowerCase()] = h.value; });

          return {
            id: detail.id,
            threadId: detail.threadId,
            labelIds: detail.labelIds || [],
            snippet: detail.snippet || '',
            subject: headerMap.subject || '(No Subject)',
            from: headerMap.from || '(Unknown Sender)',
            to: headerMap.to || '',
            date: headerMap.date || '',
            internalDate: detail.internalDate
          };
        } catch (e) {
          return { id: msg.id, threadId: msg.threadId };
        }
      })
    );

    res.json({
      messages: detailedMessages,
      nextPageToken: listData.nextPageToken,
      resultSizeEstimate: listData.resultSizeEstimate
    });
  } catch (err) {
    console.error('Error fetching Gmail messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Get single Gmail message (full details & body)
app.get('/api/gmail/messages/:messageId', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const { messageId } = req.params;
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const headers = (data.payload && data.payload.headers) || [];
    const headerMap = {};
    headers.forEach(h => { headerMap[h.name.toLowerCase()] = h.value; });

    const bodyContent = extractMessageBody(data.payload);

    res.json({
      id: data.id,
      threadId: data.threadId,
      labelIds: data.labelIds || [],
      snippet: data.snippet || '',
      subject: headerMap.subject || '(No Subject)',
      from: headerMap.from || '(Unknown Sender)',
      to: headerMap.to || '',
      cc: headerMap.cc || '',
      date: headerMap.date || '',
      bodyText: bodyContent.text,
      bodyHtml: bodyContent.html
    });
  } catch (err) {
    console.error('Error fetching Gmail message detail:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Send Gmail message (RFC 2822 base64url encoded)
app.post('/api/gmail/send', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const { to, subject, body, isHtml = true, inReplyTo, references } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'Recipient "to" and "subject" are required' });
    }

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageLines = [
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
      'MIME-Version: 1.0'
    ];

    if (inReplyTo) messageLines.push(`In-Reply-To: ${inReplyTo}`);
    if (references) messageLines.push(`References: ${references}`);

    messageLines.push('');
    messageLines.push(body || '');

    const rfcMessage = messageLines.join('\r\n');
    const raw = Buffer.from(rfcMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    });

    const sendData = await sendRes.json();
    if (!sendRes.ok) return res.status(sendRes.status).json(sendData);

    res.json({ success: true, message: sendData });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Create Gmail Draft
app.post('/api/gmail/drafts', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const { to, subject, body, isHtml = true } = req.body;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject || '(No Subject)').toString('base64')}?=`;
    const messageLines = [
      to ? `To: ${to}` : '',
      `Subject: ${utf8Subject}`,
      `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
      'MIME-Version: 1.0',
      '',
      body || ''
    ].filter(Boolean);

    const rfcMessage = messageLines.join('\r\n');
    const raw = Buffer.from(rfcMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const draftRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: { raw } })
    });

    const draftData = await draftRes.json();
    if (!draftRes.ok) return res.status(draftRes.status).json(draftData);

    res.json({ success: true, draft: draftData });
  } catch (err) {
    console.error('Error creating Gmail draft:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Move Gmail message to Trash (mutating/destructive - requires confirmation dialog in UI)
app.post('/api/gmail/messages/:messageId/trash', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization token' });

  try {
    const { messageId } = req.params;
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({ success: true, message: 'Message moved to trash', data });
  } catch (err) {
    console.error('Error trashing Gmail message:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve static assets from the current directory
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Route for root entry point
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route aliases
app.get(['/Document V5.2.3.htm', '/Document%20V5.2.3.htm', '/consumer-tech-documentation', '/consumer-tech-documentation.html', '/Consumer_Tech_Documentation_V5_5_2.html', '/Consumer_Tech_Documentation_V5_5_2', '/Consumer_Tech_Documentation_V5_5_3.html', '/Consumer_Tech_Documentation_V5_5_3'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/fodder-archive', '/fodder-archive.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'fodder-archive.html'));
});

app.get(['/Fodder Archive V2.htm', '/Fodder%20Archive%20V2.htm'], (req, res) => {
  res.sendFile(path.join(__dirname, 'Fodder Archive V2.htm'));
});

app.listen(PORT, HOST, () => {
  console.log(`Consumer Tech Documentation server listening at http://${HOST}:${PORT}`);
});
