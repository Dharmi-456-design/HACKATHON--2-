const { body } = require('express-validator');
const { sanitizeText, sanitizeUrl } = require('../utils/sanitize');

const CATEGORIES = [
  'litter',
  'pollution',
  'illegal_dumping',
  'deforestation',
  'water_contamination',
  'other',
];

const sanitizeImages = (arr) =>
  Array.isArray(arr)
    ? arr.map((u) => sanitizeUrl(u)).filter(Boolean).slice(0, 4)
    : arr;

const validateCreateIssue = [
  body('title')
    .customSanitizer((v) => sanitizeText(v, 120))
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description')
    .customSanitizer((v) => sanitizeText(v, 2000))
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('location.coordinates')
    .custom((value) =>
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'
    )
    .withMessage('location.coordinates must be an array of two numbers [lng, lat]'),
  body('images')
    .optional()
    .customSanitizer(sanitizeImages)
    .isArray().withMessage('images must be an array of URLs')
    .isLength({ max: 4 }).withMessage('An issue can have at most 4 images'),
  body('address')
    .optional()
    .customSanitizer((v) => sanitizeText(v, 300))
    .trim()
    .isLength({ max: 300 }).withMessage('Address too long'),
];

const validateUpdateIssue = [
  body('title')
    .optional()
    .customSanitizer((v) => sanitizeText(v, 120))
    .trim()
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description')
    .optional()
    .customSanitizer((v) => sanitizeText(v, 2000))
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('location.coordinates')
    .optional()
    .custom((value) =>
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'
    )
    .withMessage('location.coordinates must be an array of two numbers [lng, lat]'),
  body('images')
    .optional()
    .customSanitizer(sanitizeImages)
    .isArray().withMessage('images must be an array of URLs')
    .isLength({ max: 4 }).withMessage('An issue can have at most 4 images'),
  body('address')
    .optional()
    .customSanitizer((v) => sanitizeText(v, 300))
    .trim()
    .isLength({ max: 300 }).withMessage('Address too long'),
];

const validateStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['reported', 'acknowledged', 'in_progress', 'resolved'])
    .withMessage('Status must be one of: reported, acknowledged, in_progress, resolved'),
  body('note')
    .optional()
    .customSanitizer((v) => sanitizeText(v, 300))
    .trim()
    .isLength({ max: 300 }).withMessage('Note cannot exceed 300 characters'),
];

const validateComment = [
  body('text')
    .customSanitizer((v) => sanitizeText(v, 500))
    .trim()
    .notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
];

module.exports = {
  validateCreateIssue,
  validateUpdateIssue,
  validateStatus,
  validateComment,
};
