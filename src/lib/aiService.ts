/**
 * RozKa Multi-Engine AI Service
 * Supports:
 * 1. Groq (Ultra-fast Llama-3.3 / Llama-3.1 for instant distributor message parsing)
 * 2. Google Gemini (Gemini 1.5 Flash / 2.0 Flash for deep inventory insights & trends)
 * 3. Local Offline NLP Engine (Deterministic regex & entity parser for Airplane mode)
 */

export interface ParsedOrderItem {
  name: string;
  quantity: number;
  unit: string;
  confidence?: number;
}

export interface ParseResult {
  engine: 'groq' | 'gemini' | 'local_offline';
  items: ParsedOrderItem[];
  rawSummary?: string;
}

// Read API Keys safely from environment variables (.env.local)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * 1. Groq Message Parser (Online primary)
 */
async function parseWithGroq(message: string): Promise<ParsedOrderItem[]> {
  const prompt = `You are a Kirana Store inventory assistant. Extract product names, quantities, and units from this retailer or distributor message.
Format strictly as a JSON array of objects with keys: "name" (string), "quantity" (number), "unit" (e.g. "pkt", "pcs", "kg", "g", "L", "ml", "box").
Example: [{"name": "Parle-G", "quantity": 20, "unit": "pkt"}, {"name": "Maggi Noodles", "quantity": 10, "unit": "pkt"}, {"name": "Refined Oil", "quantity": 5, "unit": "L"}]
Do not include any explanation or markdown formatting other than the JSON array.

Message: "${message}"`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(content);
  
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.items)) return parsed.items;
  if (Array.isArray(parsed.products)) return parsed.products;
  return [];
}

/**
 * 2. Google Gemini Message Parser (Online secondary fallback)
 */
async function parseWithGemini(message: string): Promise<ParsedOrderItem[]> {
  const prompt = `Extract product names, quantities, and units from this Indian kirana store distributor order message.
Return ONLY valid JSON matching this schema:
[{"name": "string", "quantity": number, "unit": "string"}]
Message: "${message}"`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.items)) return parsed.items;
  return [];
}

/**
 * 3. Local Offline NLP Engine (100% Airplane Mode safe)
 * Uses high-precision regex & tokenization to parse Hindi/English distributor orders
 */
function parseOfflineLocal(message: string): ParsedOrderItem[] {
  const items: ParsedOrderItem[] = [];
  const lines = message.split(/[\n,;।]+/);

  const unitPatterns = [
    { regex: /(?:packets?|pkts?|packet|pkt)/i, unit: 'pkt' },
    { regex: /(?:pieces?|pcs?|piece|pc|pece)/i, unit: 'pcs' },
    { regex: /(?:kilos?|kg|kilo|किलो)/i, unit: 'kg' },
    { regex: /(?:grams?|gm|g|ग्राम)/i, unit: 'g' },
    { regex: /(?:litres?|liters?|ltr|l|लीटर)/i, unit: 'L' },
    { regex: /(?:millilitres?|ml|मिली)/i, unit: 'ml' },
    { regex: /(?:boxes?|box|डिब्बा|पेटी)/i, unit: 'box' },
    { regex: /(?:dozens?|doz|दर्जन)/i, unit: 'dozen' },
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Pattern A: "Parle-G 20 packets" or "Maggi 10" or "5 kg sugar" or "oil 5 litre"
    let detectedUnit = 'pcs';
    for (const u of unitPatterns) {
      if (u.regex.test(line)) {
        detectedUnit = u.unit;
        break;
      }
    }

    // Find quantity (e.g. 20, 10, 5, 2.5)
    const qtyMatch = line.match(/(\d+(?:\.\d+)?)/);
    const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 1;

    // Clean product name by removing quantity and unit words
    let cleanedName = line
      .replace(/(\d+(?:\.\d+)?)/g, '')
      .replace(/(?:packets?|pkts?|pieces?|pcs?|kg|kilos?|litres?|liters?|ltr|l|grams?|gm|g|boxes?|box|dozens?|doz|डिब्बा|पेटी|दर्जन|किलो|लीटर)/gi, '')
      .replace(/[-–—:]/g, '')
      .trim();

    // Capitalize product name
    if (cleanedName.length > 1) {
      cleanedName = cleanedName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      items.push({
        name: cleanedName,
        quantity,
        unit: detectedUnit,
      });
    }
  }

  return items;
}

/**
 * Unified Parser with auto-fallback
 */
export async function parseDistributorOrderMessage(message: string): Promise<ParseResult> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

  // 1. Try Groq if online
  if (isOnline) {
    try {
      const items = await parseWithGroq(message);
      if (items.length > 0) {
        return { engine: 'groq', items, rawSummary: 'Parsed using Groq Llama-3.3' };
      }
    } catch (err) {
      console.warn('Groq parser failed, trying Gemini:', err);
    }

    // 2. Try Gemini fallback
    try {
      const items = await parseWithGemini(message);
      if (items.length > 0) {
        return { engine: 'gemini', items, rawSummary: 'Parsed using Google Gemini 1.5 Flash' };
      }
    } catch (err) {
      console.warn('Gemini parser failed, falling back to local engine:', err);
    }
  }

  // 3. Offline Local Engine (Deterministic & always available)
  const items = parseOfflineLocal(message);
  return {
    engine: 'local_offline',
    items,
    rawSummary: 'Parsed using RozKa Local-First On-Device Engine (Airplane Mode Active)',
  };
}

/**
 * Generate AI Business Insights & Reorder Advice
 */
export async function generateSmartInventoryInsights(
  storeName: string,
  totalSales: number,
  lowStockItems: string[],
  slowMovingItems: string[]
): Promise<string> {
  const prompt = `You are an AI retail advisor for a neighbourhood Indian Kirana store named "${storeName}".
Current Snapshot:
- Today's Sales: ₹${totalSales}
- Low Stock Items needing urgent reorder: ${lowStockItems.join(', ') || 'None'}
- Slow Moving Items: ${slowMovingItems.join(', ') || 'None'}

Give 3 concise, highly actionable, friendly bullet points in simple Hinglish (Hindi written in English alphabet) advising the shopkeeper on what to order today and how to clear slow stock. Keep it under 60 words.`;

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.4 },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || getDefaultInsights(lowStockItems);
      }
    } catch (e) {
      console.warn('Gemini insights call failed:', e);
    }
  }

  return getDefaultInsights(lowStockItems);
}

function getDefaultInsights(lowStockItems: string[]): string {
  if (lowStockItems.length > 0) {
    return `💡 Reorder Alert: ${lowStockItems.slice(0, 3).join(', ')} ka stock bohot kam hai. Supplier ko order turant bhejein taaki customer khaali haath na lautein.`;
  }
  return `✅ Sabhi zaruri items ka stock theek hai. Shaam ki bheed ke liye tayyar rahein!`;
}
