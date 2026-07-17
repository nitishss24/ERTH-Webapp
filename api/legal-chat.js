// Vercel Serverless Function — /api/legal-chat.js
// Dedicated endpoint for ERTH Legal AI — separate from property chat (/api/chat.js)
// This keeps legal query usage/costs trackable separately from property advisor chat

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages, system } = req.body;

    // Uses a separate env variable so you can track/rotate the Legal AI key independently
    // Falls back to the main key if a dedicated one isn't set
    const apiKey = process.env.VITE_LEGAL_ANTHROPIC_KEY || process.env.VITE_ANTHROPIC_KEY || process.env.ANTHROPIC_KEY;

    if (!apiKey) return res.status(500).json({ error: "Legal AI API key not configured" });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200, // legal answers can run slightly longer than property chat
        system: system || "You are ERTH Legal AI, a real estate legal assistant specializing in Indian property law and RERA.",
        messages,
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
