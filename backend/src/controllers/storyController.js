const { Story } = require('../models/Nature');
const { isValidId, pick, sanitizeText, sanitizeMultiline } = require('../utils/natureUtils');
const { callGeminiApi } = require('../services/geminiService');

const storyAllowlist = ['title', 'narrative', 'species_highlights', 'image_url'];

const getStories = async (req, res) => {
  const stories = await Story.find({}).sort({ createdAt: -1 }).limit(100);
  res.json(stories);
};

const createStory = async (req, res) => {
  const body = pick(req.body || {}, storyAllowlist);
  if (!body.title || !String(body.title).trim()) {
    return res.status(400).json({ error: 'A story title is required.' });
  }
  body.title = sanitizeText(body.title, 300);
  if (body.narrative) body.narrative = sanitizeMultiline(body.narrative, 50000);
  if (Array.isArray(body.species_highlights)) {
    body.species_highlights = body.species_highlights
      .map((s) => sanitizeText(String(s), 120))
      .filter(Boolean)
      .slice(0, 30);
  }
  const story = await Story.create({ user: req.user._id, ...body });
  res.status(201).json(story);
};

const deleteStory = async (req, res) => {
  const id = req.params.id || req.body?.id;
  if (!isValidId(id)) return res.status(400).json({ error: 'Invalid story id.' });
  const story = await Story.findOne({ _id: id, user: req.user._id });
  if (!story) return res.status(404).json({ error: 'Story not found or not yours.' });
  await story.deleteOne();
  res.json({ success: true });
};

const generateAIStory = async (req, res) => {
  const { prompt, genre = 'Nature & Eco', mood = 'Mystical', title, language = 'en' } = req.body || {};
  if (!prompt || !String(prompt).trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const systemInstruction = `You are a master nature storyteller and cinematic eco-worldbuilder.
Write evocative, sensory-rich, biologically and ecologically grounded stories that connect human emotions with the mysteries of nature, forests, wildlife, mycorrhizal networks, and living ecosystems.`;

  const userPrompt = `Create a captivating interactive story based on this idea:
Idea / Prompt: "${prompt}"
Desired Title: "${title || 'Auto-generate a poetic title'}"
Genre: "${genre}"
Mood: "${mood}"
Language: "${language}"

Return ONLY a valid JSON object matching this structure:
{
  "title": "Poetic and captivating title",
  "genre": "${genre}",
  "mood": "${mood}",
  "readTime": "3 min read",
  "summary": "1-2 sentence compelling teaser summary",
  "narrative": "A vivid 3-4 paragraph story text with sensory details, dialogue, and atmospheric worldbuilding.",
  "choices": [
    {
      "id": "c1",
      "text": "First interactive choice for the reader",
      "nextText": "1-2 paragraphs revealing what happens if this choice is taken."
    },
    {
      "id": "c2",
      "text": "Second interactive choice offering an alternative path",
      "nextText": "1-2 paragraphs revealing what happens if this choice is taken."
    }
  ]
}`;

  const ai = await callGeminiApi({ prompt: userPrompt, system: systemInstruction, json: true, temperature: 0.7 });

  if (ai.data && ai.data.title && ai.data.narrative) {
    return res.json({ success: true, story: { id: `story-${Date.now()}`, ...ai.data, isInteractive: true } });
  }

  res.status(503).json({ success: false, ai_available: false, error: 'The story generator is temporarily unavailable. Please try again shortly.' });
};

const assistAIStory = async (req, res) => {
  const { action, storyTitle, narrative, genre, mood, customPrompt, targetLanguage } = req.body || {};

  const systemInstruction = `You are an expert AI Story Assistant and Literary Co-writer for NaturePulse.
You help authors enhance, rewrite, mood-shift, translate, or expand their nature stories.
Provide output that directly fits into or enriches the narrative.`;

  let prompt = '';
  if (action === 'rewrite') {
    prompt = `Rewrite and elevate this story narrative with richer sensory descriptions, cinematic prose, and heightened ecological wonder:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the rewritten narrative text.`;
  } else if (action === 'mood') {
    prompt = `Shift the atmosphere of this story towards a "${customPrompt || 'Mysterious, Eerie & Bioluminescent'}" mood. Infuse tension, wonder, and atmospheric environmental cues:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the modified narrative text.`;
  } else if (action === 'ending') {
    prompt = `Write an alternative, unforgettable climax and ending paragraph for this story:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the new ending section starting with [Alternate Ending]: ...`;
  } else if (action === 'continue') {
    prompt = `Continue this story by writing the next compelling chapter (2-3 paragraphs) following the narrative:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the continuation starting with [Chapter Continuation]: ...`;
  } else if (action === 'translate') {
    prompt = `Translate and culturally adapt this story narrative into ${targetLanguage || 'Gujarati or Hindi'}:\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the translated narrative with poetic fluency.`;
  } else {
    prompt = `Apply this instruction to the story:\nInstruction: "${customPrompt || 'Enhance the dialogue and natural details'}"\nStory Title: "${storyTitle}"\nNarrative:\n${narrative}\n\nReturn the updated or additional text.`;
  }

  const ai = await callGeminiApi({ prompt, system: systemInstruction, temperature: 0.6 });

  if (ai.text) {
    return res.json({ success: true, result: ai.text.trim(), action });
  }

  res.status(503).json({ success: false, ai_available: false, error: 'The story assistant is temporarily unavailable. Please try again shortly.' });
};

module.exports = { getStories, createStory, deleteStory, generateAIStory, assistAIStory };
