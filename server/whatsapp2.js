import fetch from 'node-fetch';

const INSTANCE_ID = 'instance126668';
const TOKEN = 'd930187s292t220c';

const sendWhatsAppMessage = async () => {
  const url = `https://api.ultramsg.com/instance126668/messages/chat`;

  const payload = {
    token: TOKEN,
    to: '+918015576720', 
    body: '✅ Hello This is a test WhatsApp message from my MERN app (ESM) using UltraMsg!',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('✅ Message sent:', data);
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
  }
};

sendWhatsAppMessage();