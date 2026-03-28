export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, image } = req.body || {};
  if (!text && !image) return res.status(400).json({ error: 'Provide text or image' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const systemPrompt = `You are an expert GMAT math tutor. Analyze the given GMAT quant question and respond ONLY with valid JSON in this exact format:
{
  "topic": "<one of: Fractions & Operations | Linear & Quadratic Equations | Number Properties | Divisibility Rules | Factors/LCM/GCF | Roots & Radicals | Exponents | PEMDAS>",
  "questionType": "<one of: Computation | Conceptual | Word Problem | Data Sufficiency | Comparison>",
  "hints": [
    "<Hint 1: A gentle nudge — identify what concept or formula is relevant, no solving>",
    "<Hint 2: More direction — tell them what approach to take, still no solving>",
    "<Hint 3: First concrete step — show the very first move without completing the solution>"
  ]
}
Do not include any text outside the JSON object.`;

  let messageContent;
  if (image) {
    messageContent = [
      {
        type: 'image',
        source: { type: 'base64', media_type: image.mimeType || 'image/png', data: image.data }
      },
      { type: 'text', text: 'Analyze this GMAT question.' }
    ];
  } else {
    messageContent = `Analyze this GMAT question:\n\n${text}`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: messageContent }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');

    const raw = data.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
