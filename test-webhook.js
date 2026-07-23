fetch('https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/setWebhook?url=https://example.com/api/webhook/123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
