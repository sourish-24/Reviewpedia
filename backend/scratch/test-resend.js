const apiKey = 're_NbfoqqfF_4xV9Ewagc4XVjKaDS9SneDwa';
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
