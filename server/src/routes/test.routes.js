const router = require('express').Router();
const https  = require('https');

const sendMsg = (toPhone, message) => new Promise((resolve) => {
  const id    = process.env.GREEN_API_ID;
  const token = process.env.GREEN_API_TOKEN;
  if (!id || !token) return resolve({ error: 'GREEN_API_ID or GREEN_API_TOKEN not set in Render' });

  const postData = JSON.stringify({ chatId: `${toPhone}@c.us`, message });
  const opts = {
    hostname: 'api.green-api.com',
    path:     `/waInstance${id}/sendMessage/${token}`,
    method:   'POST',
    headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
  };
  const req = https.request(opts, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); } });
  });
  req.on('error', (e) => resolve({ error: e.message }));
  req.write(postData);
  req.end();
});

// Test send to ADMIN
router.get('/whatsapp', async (req, res) => {
  const ADMIN = process.env.ADMIN_WHATSAPP_PHONE || '916383174213';
  const result = await sendMsg(ADMIN, '🐔 Sunday Chicken — Admin WhatsApp test! ✅');
  res.json({
    to: ADMIN,
    success: !!result.idMessage,
    result,
    message: result.idMessage ? '✅ Sent to admin!' : '❌ Failed — check Green API credentials & QR scan',
  });
});

// Test send to CUSTOMER — pass phone in URL: /api/test/whatsapp-customer/919876543210
router.get('/whatsapp-customer/:phone', async (req, res) => {
  const phone  = req.params.phone;
  const result = await sendMsg(phone,
    `🐔 *Sunday Chicken - Order Confirmed!*\n\nHi! Your test order is confirmed.\n📞 Call us: 6383174213\n\nThank you! 😊`
  );
  res.json({
    to: phone,
    success: !!result.idMessage,
    result,
    message: result.idMessage ? `✅ Sent to ${phone}!` : '❌ Failed',
  });
});

// Check all env vars
router.get('/env', (req, res) => {
  res.json({
    GREEN_API_ID:          process.env.GREEN_API_ID     ? `✅ ${process.env.GREEN_API_ID}` : '❌ Missing',
    GREEN_API_TOKEN:       process.env.GREEN_API_TOKEN  ? '✅ Set' : '❌ Missing',
    ADMIN_WHATSAPP_PHONE:  process.env.ADMIN_WHATSAPP_PHONE || '916383174213 (default)',
    DATABASE_URL:          process.env.DATABASE_URL     ? '✅ Set' : '❌ Missing',
  });
});

module.exports = router;
