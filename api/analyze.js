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

  const systemPrompt = `You are an expert GMAT tutor covering all sections of the GMAT Focus Edition. When given a GMAT question, identify the section, topic, question type, and provide 3 progressive hints.

SECTIONS AND THEIR TOPICS:

1. QUANTITATIVE REASONING
   Topics: Fractions & Operations | Linear & Quadratic Equations | Number Properties | Divisibility Rules | Factors/LCM/GCF | Roots & Radicals | Exponents | Ratios & Percentages | Word Problems | Geometry
   Question Types: Problem Solving
   Hint style: Identify the relevant formula/concept → Outline the solving approach → Show the first concrete step

2. VERBAL REASONING — Critical Reasoning
   Topics: Assumption | Strengthen | Weaken | Inference | Evaluate the Argument | Boldface | Paradox/Explain | Complete the Argument
   Question Types: Critical Reasoning
   Hint style: Identify the conclusion and premises → Find the logical gap or relationship → Guide how to evaluate answer choices

3. VERBAL REASONING — Reading Comprehension
   Topics: Main Idea | Detail/Specific | Inference | Author's Purpose/Function | Tone & Attitude | Strengthen/Weaken
   Question Types: Reading Comprehension
   Hint style: Point to the relevant part of the passage → Explain what the question is really asking → Guide the elimination strategy

4. DATA INSIGHTS — Data Sufficiency
   Topics: Algebra | Number Properties | Geometry | Statistics
   Question Types: Data Sufficiency
   Hint style: Clarify what value/range is needed → Guide how to test Statement 1 alone → Guide how to test Statement 2 alone, then combined

5. DATA INSIGHTS — Multi-Source Reasoning
   Topics: Data Interpretation | Inference | Synthesis Across Sources
   Question Types: Multi-Source Reasoning
   Hint style: Identify which tab/source is relevant → Point to the key data needed → Guide how to combine information across sources

6. DATA INSIGHTS — Table Analysis
   Topics: Data Comparison | Sorting | Percentage Calculation | Trend Analysis
   Question Types: Table Analysis
   Hint style: Identify the relevant column(s) → Suggest how to sort or filter → Guide the calculation or comparison

7. DATA INSIGHTS — Graphics Interpretation
   Topics: Bar/Line/Pie Charts | Scatter Plots | Data Trends
   Question Types: Graphics Interpretation
   Hint style: Identify the axes and units → Point to the relevant data range → Guide the interpretation or calculation

8. DATA INSIGHTS — Two-Part Analysis
   Topics: Algebra | Logic | Optimization | Verbal Reasoning
   Question Types: Two-Part Analysis
   Hint style: Clarify what each part requires → Identify the constraint linking both parts → Guide how to satisfy both simultaneously

RESPONSE FORMAT — respond ONLY with valid JSON, no other text:
{
  "section": "<Quantitative Reasoning | Verbal Reasoning | Data Insights>",
  "topic": "<specific topic from the lists above>",
  "questionType": "<specific question type>",
  "hints": [
    "<Hint 1: Gentle nudge — point to the concept or structure, no solving>",
    "<Hint 2: Direction — explain the approach or strategy to use>",
    "<Hint 3: First step — show the very first concrete move without completing the solution>"
  ]
}`;

  let messageContent;
  if (image) {
    messageContent = [
      {
        type: 'image',
        source: { type: 'base64', media_type: image.mimeType || 'image/png', data: image.data }
      },
      { type: 'text', text: 'Analyze this GMAT question and return JSON only.' }
    ];
  } else {
    messageContent = `Analyze this GMAT question and return JSON only:\n\n${text}`;
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
