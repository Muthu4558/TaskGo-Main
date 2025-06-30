import fetch from 'node-fetch';

const API_KEY = 'Ay8Q-D6iv-vqKo'; // Ensure you set this environment variable
const API_URL = 'https://api.qikchat.in/v1/messages';

// Example data (replace with your actual dynamic values)
const data = {
  name: 'John Doe',
  company_name: 'Tech Corp',
  phone_no: '6385931500',
  db_link: 'https://yourdashboard.link',
};

const payload = {
  to_contact: `+91${data.phone_no}`,
  type: 'template',
  template: {
    name: 'dashboard_temp',
    language: 'en_US',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: data.name },
          { type: 'text', text: data.company_name },
          { type: 'text', text: data.db_link },
        ],
      },
    ],
  },
};

async function sendTemplateMessage() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'QIKCHAT-API-KEY': API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send message:', result);
    } else {
      console.log('✅ Message sent successfully:', result);
    }
  } catch (error) {
    console.error('🔥 Error sending message:', error.message);
  }
}

sendTemplateMessage();
