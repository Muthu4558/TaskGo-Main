import twilio from 'twilio';

const accountSid = 'ACfcf9421b9fa0c65bf0570971316ca2c2';
const authToken = '83e300eaa61d864885703cc976ece7e6';

const client = twilio(accountSid, authToken);

try {
  const message = await client.messages.create({
    body: '👋 Hello Guys! This is a test WhatsApp message from my MERN app (ESM).',
    from: 'whatsapp:+14155238886',
    to: 'whatsapp:+916385931500' 
  });

  console.log('✅ Message sent successfully! SID:', message.sid);
} catch (error) {
  console.error('❌ Failed to send WhatsApp message:', error);
}