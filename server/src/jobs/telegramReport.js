import cron from 'node-cron';

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function sendTelegramMessage(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API error: ${res.status} ${body}`);
  }
}

export function scheduleTelegramReport(db) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('Telegram report disabled: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    return;
  }

  // Every day at 18:00 Asia/Bangkok
  cron.schedule('0 18 * * *', async () => {
    try {
      const today = formatDate(new Date());
      const rows = db
        .prepare(
          `SELECT t.*, v.name AS vehicle_name, v.license_plate, u.full_name
           FROM trips t
           JOIN vehicles v ON v.id = t.vehicle_id
           JOIN users u ON u.id = t.user_id
           WHERE date(t.start_datetime) = date('now', 'localtime')
           ORDER BY t.start_datetime ASC`
        )
        .all();

      let message = `สรุปการใช้งานรถประจำวัน ${today}\n`;
      if (rows.length === 0) {
        message += 'วันนี้ไม่มีการใช้งานรถ';
      } else {
        rows.forEach((r, i) => {
          const distance = Number(r.end_odometer) - Number(r.start_odometer);
          message += `${i + 1}. ${r.vehicle_name} (${r.license_plate})\n` +
            `ผู้ขับ: ${r.full_name}\n` +
            `เวลา: ${r.start_datetime} → ${r.end_datetime}\n` +
            `เลขไมล์: ${r.start_odometer} → ${r.end_odometer} (รวม ${distance} กม.)\n` +
            `วัตถุประสงค์: ${r.purpose || '-'}\n\n`;
        });
      }

      await sendTelegramMessage(token, chatId, message.trim());
      console.log('Telegram summary sent');
    } catch (err) {
      console.error('Failed to send Telegram summary:', err.message);
    }
  }, { timezone: 'Asia/Bangkok' });
} 