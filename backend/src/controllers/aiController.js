const { ChatThread } = require('../models/Nature');
const { isValidId, sanitizeText } = require('../utils/natureUtils');
const { callGeminiApi } = require('../services/geminiService');

const PULSE_SYSTEM = `You are Pulse, the guide inside NaturePulse, an AI-powered Nature Relationship Platform.
Your purpose is to help people notice, understand, experience, and care for the living world already around them.
Voice: calm, encouraging, intelligent, practical. Never preachy, never cute, never corporate.
Speak in short grounded paragraphs. Prefer specific sensory cues over slogans.
Never invent a species identification, toxicity claim, rarity status, or exact location.
If you are unsure, say so and describe only what is knowable.
Never ask for or repeat precise coordinates or street addresses. City and habitat type are enough.
Guide people through Observe → Understand → Experience → Act → Measure → Return.
Offer one clear next step when useful. Keep replies under 180 words unless the user asks for more.`;

const handlePulseChat = async (req, res) => {
  const { content, message, text, imageBase64, contentType, language, lang, messages, history } = req.body || {};
  const userText = (message || content || text || '').trim();
  if (!userText && !imageBase64) {
    return res.status(400).json({ error: 'Say something to Pulse.' });
  }

  let detectedLang = lang || language || 'en';
  const gujlishRegex = /\b(vishe|kaho|kem|che|nthi|chhe|mate|maj|aaj|apvo|joiye|nathi|tame|mane|amne)\b/i;
  const hindlishRegex = /\b(kaise|batao|kahan|kyun|mujhe|humko|dekho|pehle|pakshi)\b/i;

  if (lang === 'gu' || language === 'gu') {
    detectedLang = 'gu';
  } else if (lang === 'hi' || language === 'hi') {
    detectedLang = 'hi';
  } else if (lang === 'en' || language === 'en') {
    if (/[\u0A80-\u0AFF]/.test(userText)) detectedLang = 'gu';
    else if (/[\u0900-\u097F]/.test(userText)) detectedLang = 'hi';
    else detectedLang = 'en';
  } else if (/[\u0A80-\u0AFF]/.test(userText) || gujlishRegex.test(userText)) {
    detectedLang = 'gu';
  } else if (/[\u0900-\u097F]/.test(userText) || hindlishRegex.test(userText)) {
    detectedLang = 'hi';
  }

  let languageInstruction = '';
  if (detectedLang === 'gu') {
    languageInstruction = ' (CRITICAL: Answer strictly in natural, fluent Gujarati / ગુજરાતી language only!)';
  } else if (detectedLang === 'hi') {
    languageInstruction = ' (CRITICAL: Answer strictly in natural, fluent Hindi / हिंदी language only!)';
  } else if (detectedLang === 'en') {
    languageInstruction = ' (CRITICAL: Answer strictly in fluent, natural English only!)';
  } else if (detectedLang) {
    languageInstruction = ` (CRITICAL: Answer strictly in natural, fluent ${detectedLang} language only!)`;
  }

  const pulseSystem = `You are Pulse, the calm, intelligent, and practical ecological AI guide for NaturePulse (a Nature Relationship Platform).
Your purpose is to help people notice, understand, experience, and care for the living world around them.
Voice: calm, encouraging, intelligent, practical, friendly. Never preachy, never cute, never corporate.
Provide grounded answers with specific sensory cues, micro-observations, and actionable ecological insight.
CRITICAL MANDATES:
1. Answer the user's EXACT inquiry directly with helpful clarity and accurate ecological knowledge.
2. Language Rule: Answer strictly in ${detectedLang === 'gu' ? 'natural, fluent Gujarati (ગુજરાતી)' : detectedLang === 'hi' ? 'natural, fluent Hindi (हिंदी)' : 'fluent, natural English'}. Do not mix languages unless providing scientific names in parentheses.
3. If an image is provided, identify the species/nature element observed and describe visible field marks, habitat, and how to look closer.
4. Format your output cleanly with readable bullet points and short paragraphs when appropriate.`;

  let prompt = (userText || 'Look at this photo and describe what you observe.') + languageInstruction;

  // Format past history turns
  const pastTurns = Array.isArray(messages) ? messages : (Array.isArray(history) ? history : []);
  const formattedHistory = pastTurns
    .slice(-12) // Keep recent context
    .filter((m) => m && (m.content || m.text))
    .map((m) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      content: typeof m.content === 'string' ? m.content : (typeof m.text === 'string' ? m.text : ''),
    }));

  const ai = await callGeminiApi({
    prompt,
    system: pulseSystem,
    imageBase64,
    mimeType: contentType || 'image/jpeg',
    temperature: 0.6,
    messages: formattedHistory,
  });

  if (ai.text) {
    return res.json({ content: ai.text, reply: ai.text, text: ai.text });
  }

  // Fallback responses when Gemini is unavailable
  let fallbackReply = '';
  const textLower = userText.toLowerCase();

  if (detectedLang === 'gu') {
    if (textLower.includes('ahmedabad') || textLower.includes('place') || textLower.includes('visit') || textLower.includes('જોવા') || textLower.includes('સ્થાન') || textLower.includes('જગ્યા') || textLower.includes('ફરવા') || textLower.includes('ક્યાં')) {
      fallbackReply = 'અમદાવાદ અને આસપાસ મુલાકાત લેવા માટેના શ્રેષ્ઠ ૪ પ્રકૃતિ સ્થાનો:\n૧. સાબરમતી રિવરસાઇડ પાર્ક — નદી કિનારે પક્ષી દર્શન અને શાંતિ માટે\n૨. થોળ સરોવર પક્ષી અભયારણ્ય — ફ્લેમિંગો અને મિગ્રેટરી જળચરો માટે\n૩. પરિમલ ગાર્ડન — પ્રાચીન વડ અને બોટનિકલ ક્રેસ્ટ માટે\n૪. ઇન્દ્રોડા નેચર હેરિટેજ પાર્ક (ગાંધીનગર) — વિશાળ ફોરેસ્ટ ટ્રાયલ માટે\n\nતમે આમાંથી કયા સ્થાન વિશે વધુ વિગત જાણવા માંગો છો?';
    } else if (textLower.includes('bird') || textLower.includes('પક્ષી') || textLower.includes('pakshi') || textLower.includes('મોર') || textLower.includes('પોપટ')) {
      fallbackReply = 'ગુજરાત અને અમદાવાદમાં મોર (Peafowl), પોપટ (Parakeet), એશિયન કોયલ (Koel), શ્વેત બગલા (Egrets) અને લીલો પતંગો (Bee-Eater) મુખ્યત્વે જોવા મળે છે. તમે કયા પક્ષી વિશે વધુ વિગત જાણવા માગો છો?';
    } else if (textLower.includes('tree') || textLower.includes('વૃક્ષ') || textLower.includes('છોડ') || textLower.includes('vruksh') || textLower.includes('plant') || textLower.includes('flower') || textLower.includes('ફૂલ')) {
      fallbackReply = 'તમારી આસપાસ પવિત્ર વડ (Banyan Tree), ઔષધીય લીમડો (Neem), પીપળો (Peepal) અને અમલતાસ (Golden Shower) મુખ્ય ઓક્સિજન આપતા વૃક્ષો છે. તમે કયા વૃક્ષ કે ફૂલ વિશે પૂછવા માંગો છો?';
    } else if (textLower.includes('hi') || textLower.includes('hello') || textLower.includes('kem cho') || textLower.includes('કેમ') || textLower.includes('નામ') || textLower.includes('કોણ')) {
      fallbackReply = 'નમસ્તે! 🍃 હું પલ્સ (Pulse AI) છું — તમારો ઇકોલોજીકલ ગાઇડ. તમે મને અમદાવાદના સ્થાનો, પક્ષીઓ, વૃક્ષો, વાતાવરણ અથવા પર્યાવરણ વિશે ગમે તે પ્રશ્ન પૂછી શકો છો!';
    } else {
      fallbackReply = `તમારા પ્રશ્ન "${userText}" માટે પલ્સ ઇન્ટેલિજન્સ:\nપલ્સ એઆઈ તમારી આસપાસના પર્યાવરણ, જૈવવિવિધતા, અમદાવાદના સ્થાનો અને વનસ્પતિઓ વિશે સચોટ માહિતી આપે છે. તમે કયા ચોક્કસ વિષય કે પ્રજાતિ વિશે વધુ વિગત જાણવા માગો છો?`;
    }
  } else if (detectedLang === 'hi') {
    fallbackReply = `आपके प्रश्न "${userText}" के लिए पल्स उत्तर: साबरमती रिवरफ्रंट, थोड़ पक्षी अभयारण्य और परिमल उद्यान अहमदाबाद के प्रमुख प्राकृतिक स्थल हैं। प्रकृति के बारे में और क्या जानना चाहते हैं?`;
  } else {
    fallbackReply = `Pulse Intelligence for "${userText}": Nature ecosystems respond dynamically to canopy shade, seasonal soil moisture, and wildlife corridors. How else can Pulse assist your exploration?`;
  }

  return res.json({ content: fallbackReply, reply: fallbackReply, text: fallbackReply });
};

const handleImageAnalyze = async (req, res) => {
  const { imageBase64, contentType, city, note } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({ error: 'A photograph is required.' });
  }

  const prompt = `Analyze this outdoor photograph for Nature Lens.
The photographer is in or near: ${city || 'an unspecified city'}.
User note: ${note || 'none'}.

Return ONLY JSON with this shape:
{
  "identified": boolean,
  "confidence": "high" | "medium" | "low" | "uncertain",
  "confidence_pct": number 0-100,
  "common_name": string | null,
  "scientific_name": string | null,
  "category": "plant" | "bird" | "insect" | "fungi" | "mammal" | "habitat" | "water" | "other",
  "visible_features": string[],
  "description": string,
  "why_it_matters": string,
  "experience_suggestion": string,
  "ecological_role": string,
  "uncertainty_note": string | null,
  "photo_coach_tip": string | null,
  "look_closer_steps": string[]
}

Rules:
- If you can reasonably identify the species or object, set identified=true, confidence="high" or "medium".
- If you cannot identify with reasonable confidence, ALWAYS give your best guess: set identified=false, confidence="low" or "uncertain", and fill common_name and scientific_name with your most likely candidate (never leave common_name null).
- confidence_pct must be a number 0-100 matching the confidence level (high 85-99, medium 60-84, low 40-59, uncertain 0-39).
- Describe only what is visible. Do not invent range, rarity, edibility, or toxicity.
- why_it_matters should be one grounded paragraph about ecological or human relationship.
- experience_suggestion must be a real-world next step.
- photo_coach_tip: one concrete framing or composition tip (or null).
- look_closer_steps: 3 short sensory actions (or empty array).`;

  const ai = await callGeminiApi({ prompt, system: PULSE_SYSTEM, imageBase64, mimeType: contentType || 'image/jpeg', json: true, temperature: 0.2 });

  if (ai.data) {
    const analysis = ai.data;
    let confidencePct = Number(analysis.confidence_pct);
    if (!Number.isFinite(confidencePct)) {
      confidencePct = analysis.confidence === 'high' ? 90 : analysis.confidence === 'medium' ? 65 : analysis.confidence === 'low' ? 40 : 20;
    }
    confidencePct = Math.max(0, Math.min(100, Math.round(confidencePct)));
    return res.json({ ...analysis, confidence_pct: confidencePct, ai_available: true });
  }

  res.status(503).json({ ai_available: false, error: 'Species analysis is temporarily unavailable. Please try again shortly.' });
};

const toClientThread = (thread) => ({
  id: thread._id,
  title: thread.title || 'Ecological Inquiry',
  created_at: thread.createdAt,
  updated_at: thread.updatedAt,
  messages: (thread.messages || []).map((m) => ({
    id: m._id || `${thread._id}-${m.created_at?.getTime?.() || Date.now()}-${m.role}`,
    role: m.role, content: m.content, created_at: m.created_at,
  })),
});

const getPulseThreads = async (req, res) => {
  const threads = await ChatThread.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json(threads.map(toClientThread));
};

const createPulseThread = async (req, res) => {
  const title = sanitizeText(req.body?.title, 120) || 'Ecological Inquiry';
  const thread = await ChatThread.create({ user: req.user._id, title, messages: [] });
  res.status(201).json(toClientThread(thread));
};

const renamePulseThread = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid thread id.' });
  const title = sanitizeText(req.body?.title, 120);
  if (!title) return res.status(400).json({ error: 'A thread title is required.' });
  const thread = await ChatThread.findOneAndUpdate({ _id: id, user: req.user._id }, { title }, { new: true });
  if (!thread) return res.status(404).json({ error: 'Thread not found or not yours.' });
  res.json(toClientThread(thread));
};

const deletePulseThread = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid thread id.' });
  const thread = await ChatThread.findOne({ _id: id, user: req.user._id });
  if (!thread) return res.status(404).json({ error: 'Thread not found or not yours.' });
  await thread.deleteOne();
  res.json({ success: true });
};

const clearPulseThreads = async (req, res) => {
  await ChatThread.deleteMany({ user: req.user._id });
  res.json({ success: true });
};

const updatePulseThreadMessages = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid thread id.' });
  const raw = req.body?.messages;
  if (!Array.isArray(raw)) return res.status(400).json({ error: 'messages must be an array.' });
  const messages = [];
  for (const m of raw.slice(0, 200)) {
    const role = m?.role === 'assistant' ? 'assistant' : 'user';
    const content = sanitizeText(String(m?.content || ''), 20000);
    if (!content) continue;
    messages.push({ role, content, created_at: m?.created_at ? new Date(m.created_at) : new Date() });
  }
  const thread = await ChatThread.findOneAndUpdate({ _id: id, user: req.user._id }, { $set: { messages } }, { new: true });
  if (!thread) return res.status(404).json({ error: 'Thread not found or not yours.' });
  res.json(toClientThread(thread));
};

module.exports = {
  handlePulseChat, handleImageAnalyze,
  getPulseThreads, createPulseThread, renamePulseThread, deletePulseThread, clearPulseThreads, updatePulseThreadMessages,
};
