import 'dotenv/config';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("RESEND_API_KEY environment variable is not defined.");
  process.exit(1);
}

fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'onboarding@resend.dev',
    to: 'sourishmusib@gmail.com',
    subject: 'Test Email Override',
    html: '<p>This is a test of the forced email override.</p>'
  })
}).then(res => res.json()).then(console.log).catch(console.error);
