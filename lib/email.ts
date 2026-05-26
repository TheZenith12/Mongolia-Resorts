// lib/email.ts — Email мэдэгдэл (Resend)
// RESEND_API_KEY олдохгүй бол email илгээхгүй, алдаа гаргахгүй

const FROM = 'Монгол Нутаг <noreply@mongolnnutag.mn>';

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // key тохируулаагүй бол skip

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
  } catch {
    // email алдаа нь үндсэн flow-г зогсоохгүй
  }
}

// ── Захиалга баталгаажсан ────────────────────────────────────────────────────
export async function sendBookingConfirmation(opts: {
  to: string;
  guestName: string;
  placeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  bookingId: string;
}) {
  const { to, guestName, placeName, checkIn, checkOut, nights, totalAmount, bookingId } = opts;
  await send(to, `Захиалга баталгаажлаа — ${placeName}`, `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#1a3a2a;padding:20px 24px;border-radius:12px;margin-bottom:24px;">
        <h1 style="color:#fbbf24;margin:0;font-size:22px;">Монгол Нутаг</h1>
      </div>
      <h2 style="color:#1a3a2a;margin-bottom:8px;">Сайн байна уу, ${guestName}!</h2>
      <p style="color:#4b6a57;margin-bottom:24px;">Таны захиалга амжилттай баталгаажлаа.</p>
      <div style="background:#f0faf4;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h3 style="color:#1a3a2a;margin:0 0 16px;">${placeName}</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#4b6a57;padding:6px 0;">Нэвтрэх өдөр</td><td style="color:#1a3a2a;font-weight:600;text-align:right;">${checkIn}</td></tr>
          <tr><td style="color:#4b6a57;padding:6px 0;">Гарах өдөр</td><td style="color:#1a3a2a;font-weight:600;text-align:right;">${checkOut}</td></tr>
          <tr><td style="color:#4b6a57;padding:6px 0;">Шөнө</td><td style="color:#1a3a2a;font-weight:600;text-align:right;">${nights}</td></tr>
          <tr style="border-top:1px solid #d1fae5;"><td style="color:#4b6a57;padding:10px 0 0;font-weight:600;">Нийт дүн</td><td style="color:#d97706;font-weight:700;font-size:18px;text-align:right;padding-top:10px;">₮${totalAmount.toLocaleString()}</td></tr>
        </table>
      </div>
      <p style="color:#4b6a57;font-size:14px;">Захиалгын дугаар: <strong>${bookingId}</strong></p>
      <p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
        Энэ имэйл Монгол Нутаг системээс автоматаар илгээгдлээ.
      </p>
    </div>
  `);
}

// ── Захиалга зөвшөөрөгдсөн (manager/admin) ──────────────────────────────────
export async function sendBookingApproved(opts: {
  to: string;
  guestName: string;
  placeName: string;
  checkIn: string;
  checkOut: string;
}) {
  await send(opts.to, `Захиалга зөвшөөрөгдлөө — ${opts.placeName}`, `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#1a3a2a;padding:20px 24px;border-radius:12px;margin-bottom:24px;">
        <h1 style="color:#fbbf24;margin:0;font-size:22px;">Монгол Нутаг</h1>
      </div>
      <h2 style="color:#1a3a2a;">Сайн мэдээ!</h2>
      <p style="color:#4b6a57;">Сайн байна уу, <strong>${opts.guestName}</strong>! Таны <strong>${opts.placeName}</strong>-д хийсэн захиалга <span style="color:#16a34a;font-weight:700;">зөвшөөрөгдлөө</span>.</p>
      <div style="background:#f0faf4;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0;color:#1a3a2a;"><strong>Нэвтрэх:</strong> ${opts.checkIn}</p>
        <p style="margin:8px 0 0;color:#1a3a2a;"><strong>Гарах:</strong> ${opts.checkOut}</p>
      </div>
      <p style="color:#4b6a57;">Аялалдаа амжилт хүсье!</p>
    </div>
  `);
}

// ── Газар зөвшөөрөгдсөн ─────────────────────────────────────────────────────
export async function sendPlaceApproved(opts: {
  to: string;
  submitterName: string;
  placeName: string;
  placeUrl: string;
}) {
  await send(opts.to, `Таны газар нийтлэгдлээ — ${opts.placeName}`, `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#1a3a2a;padding:20px 24px;border-radius:12px;margin-bottom:24px;">
        <h1 style="color:#fbbf24;margin:0;font-size:22px;">Монгол Нутаг</h1>
      </div>
      <h2 style="color:#1a3a2a;">Баяр хүргэе!</h2>
      <p style="color:#4b6a57;">Сайн байна уу, <strong>${opts.submitterName}</strong>! Таны нэмсэн <strong>${opts.placeName}</strong> газар <span style="color:#16a34a;font-weight:700;">зөвшөөрөгдөж нийтлэгдлээ</span>.</p>
      <a href="${opts.placeUrl}" style="display:inline-block;background:#1a3a2a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Газраа харах</a>
      <p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">Монгол Нутаг</p>
    </div>
  `);
}

// ── Газар татгалзсан ─────────────────────────────────────────────────────────
export async function sendPlaceRejected(opts: {
  to: string;
  submitterName: string;
  placeName: string;
  reason: string;
}) {
  await send(opts.to, `Газар нэмэх хүсэлт — ${opts.placeName}`, `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#1a3a2a;padding:20px 24px;border-radius:12px;margin-bottom:24px;">
        <h1 style="color:#fbbf24;margin:0;font-size:22px;">Монгол Нутаг</h1>
      </div>
      <h2 style="color:#1a3a2a;">Хүсэлтийн үр дүн</h2>
      <p style="color:#4b6a57;">Сайн байна уу, <strong>${opts.submitterName}</strong>. Таны <strong>${opts.placeName}</strong> газрын хүсэлтийг харамсалтай нь зөвшөөрөх боломжгүй боллоо.</p>
      <div style="background:#fef2f2;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#991b1b;"><strong>Шалтгаан:</strong> ${opts.reason}</p>
      </div>
      <p style="color:#4b6a57;">Мэдээллийг засаж дахин илгээх боломжтой.</p>
    </div>
  `);
}
