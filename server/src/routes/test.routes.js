const router = require('express').Router();
const https  = require('https');

router.get('/whatsapp', async (req, res) => {
  const idInstance       = process.env.GREEN_API_ID;
  const apiTokenInstance = process.env.GREEN_API_TOKEN;

  if (!idInstance || !apiTokenInstance) {
    return res.json({
      success: false,
      error: 'GREEN_API_ID or GREEN_API_TOKEN not set in Render environment variables'
    });
  }

  const postData = JSON.stringify({
    chatId:  '916383174213@c.us',
    message: '🐔 Sunday Chicken — WhatsApp test! If you see this it works! ✅'
  });

  const options = {
    hostname: 'api.green-api.com',
    path:     `/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', c => data += c);
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        res.json({
          success:  !!parsed.idMessage,
          result:   parsed,
          message:  parsed.idMessage ? '✅ WhatsApp sent!' : '❌ Failed — check credentials',
          id_used:  idInstance,
        });
      } catch {
        res.json({ success: false, raw: data });
      }
    });
  });

  apiReq.on('error', (e) => res.json({ success: false, error: e.message }));
  apiReq.write(postData);
  apiReq.end();
});

router.get('/env', (req, res) => {
  res.json({
    GREEN_API_ID:     process.env.GREEN_API_ID    ? '✅ Set: ' + process.env.GREEN_API_ID : '❌ Missing',
    GREEN_API_TOKEN:  process.env.GREEN_API_TOKEN  ? '✅ Set' : '❌ Missing',
    DATABASE_URL:     process.env.DATABASE_URL     ? '✅ Set' : '❌ Missing',
  });
});

module.exports = router;
