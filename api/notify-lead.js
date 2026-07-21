// Vercel Serverless Function — /api/notify-lead.js
// Sends email notification to sales@erthreality.com when a new lead comes in
// Uses Resend (resend.com) — free tier: 100 emails/day, 3000/month

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, phone, email, message, source, property_name, lead_score, budget, timeline } = req.body;

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return res.status(200).json({ ok: false, skipped: true });
    }

    const scoreEmoji = lead_score === "hot" ? "🔥 HOT" : lead_score === "warm" ? "🌤 WARM" : "❄️ COLD";
    const scoreColor = lead_score === "hot" ? "#EF4444" : lead_score === "warm" ? "#F59E0B" : "#6B7280";

    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#F5F0E8;padding:0">
        <div style="background:linear-gradient(135deg,#2C4A3E,#1A2E26);padding:24px 28px">
          <div style="color:#C4A882;font-size:20px;font-weight:700;letter-spacing:2px">ERTH</div>
          <div style="color:#ffffff;font-size:16px;margin-top:8px;font-weight:700">🎯 New Lead Received</div>
        </div>
        <div style="padding:24px 28px;background:#ffffff">
          <div style="display:inline-block;background:${scoreColor}20;color:${scoreColor};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:16px">${scoreEmoji}</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6B6B6B;width:120px">Name</td><td style="padding:8px 0;color:#1E1E1E;font-weight:700">${name || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6B6B6B">Phone</td><td style="padding:8px 0;color:#1E1E1E;font-weight:700">${phone || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6B6B6B">Email</td><td style="padding:8px 0;color:#1E1E1E">${email || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6B6B6B">Property</td><td style="padding:8px 0;color:#1E1E1E">${property_name || "General enquiry"}</td></tr>
            <tr><td style="padding:8px 0;color:#6B6B6B">Budget</td><td style="padding:8px 0;color:#1E1E1E">${budget || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6B6B6B">Timeline</td><td style="padding:8px 0;color:#1E1E1E">${timeline || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6B6B6B">Source</td><td style="padding:8px 0;color:#1E1E1E">${source || "Website"}</td></tr>
          </table>
          ${message ? `<div style="margin-top:16px;padding:12px 14px;background:#F5F0E8;border-radius:8px;font-size:13px;color:#1E1E1E;line-height:1.6">"${message}"</div>` : ""}
          <div style="margin-top:20px;display:flex;gap:8px">
            ${phone ? `<a href="tel:${phone}" style="display:inline-block;background:#2C4A3E;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:700;margin-right:8px">📞 Call Now</a>` : ""}
            ${phone ? `<a href="https://wa.me/${String(phone).replace(/\D/g,"")}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:700">💬 WhatsApp</a>` : ""}
          </div>
        </div>
        <div style="padding:16px 28px;background:#1A2E26;text-align:center">
          <div style="color:#C4A882;font-size:11px">ERTH Reality · erthreality.com · Admin: erth-webapp.vercel.app/?admin</div>
        </div>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ERTH Leads <leads@erthreality.com>",
        to: ["sales@erthreality.com"],
        subject: `${scoreEmoji} New Lead: ${name || "Unknown"} ${property_name ? "— " + property_name : ""}`,
        html,
      }),
    });

    const result = await emailRes.json();
    if (!emailRes.ok) {
      console.error("Resend error:", result);
      return res.status(200).json({ ok: false, error: result });
    }

    return res.status(200).json({ ok: true, id: result.id });
  } catch (err) {
    console.error("Notify lead error:", err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
