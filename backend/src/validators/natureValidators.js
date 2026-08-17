const { body } = require('express-validator');
const { sanitizeText, sanitizeUrl } = require('../utils/sanitize');

const validatePulseChat = [
  body('message')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 4000))
    .isLength({ max: 4000 }).withMessage('Message cannot exceed 4000 characters'),
  body('content')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 4000))
    .isLength({ max: 4000 }).withMessage('Content cannot exceed 4000 characters'),
  body('text')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 4000))
    .isLength({ max: 4000 }).withMessage('Text cannot exceed 4000 characters'),
  body('imageBase64')
    .optional()
    .isString()
    .custom((v) => {
      if (!v || typeof v !== 'string') return true;
      const byteLen = Math.ceil((v.length * 3) / 4);
      if (byteLen > 10 * 1024 * 1024) throw new Error('Image too large (max 10MB)');
      return true;
    }),
  body('language')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 20)),
  body('lang')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 20)),
  body('thread_id')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 100)),
  body('contentType')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 50)),
  body('messages')
    .optional()
    .isArray()
    .withMessage('Messages must be an array if provided'),
  body('history')
    .optional()
    .isArray()
    .withMessage('History must be an array if provided'),
];

const validateImageAnalyze = [
  body('imageBase64')
    .notEmpty().withMessage('Image data is required')
    .isString()
    .custom((v) => {
      if (!v || typeof v !== 'string') throw new Error('Invalid image data');
      const byteLen = Math.ceil((v.length * 3) / 4);
      if (byteLen > 10 * 1024 * 1024) throw new Error('Image too large (max 10MB)');
      return true;
    }),
  body('city')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 120)),
  body('note')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 500)),
];

const validateStoryGenerate = [
  body('prompt')
    .notEmpty().withMessage('Prompt is required')
    .customSanitizer((v) => sanitizeText(String(v || ''), 2000))
    .isLength({ min: 5 }).withMessage('Prompt must be at least 5 characters')
    .isLength({ max: 2000 }).withMessage('Prompt cannot exceed 2000 characters'),
  body('title')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 300))
    .isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters'),
  body('genre')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 80)),
  body('mood')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 80)),
  body('language')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 10)),
];

const validateStoryAssist = [
  body('action')
    .optional()
    .isIn(['rewrite', 'mood', 'ending', 'continue', 'translate', 'other']).withMessage('Invalid action'),
  body('storyTitle')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 300)),
  body('narrative')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 20000))
    .isLength({ max: 20000 }).withMessage('Narrative too long (max 20000 characters)'),
  body('customPrompt')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 2000))
    .isLength({ max: 2000 }).withMessage('Custom prompt too long'),
  body('targetLanguage')
    .optional()
    .customSanitizer((v) => sanitizeText(String(v || ''), 40)),
];

const validateComment = [
  body('text')
    .customSanitizer((v) => sanitizeText(String(v || ''), 500))
    .trim()
    .notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
];

module.exports = {
  validatePulseChat,
  validateImageAnalyze,
  validateStoryGenerate,
  validateStoryAssist,
  validateComment,
};
