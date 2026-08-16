const { body } = require('express-validator');

const CATEGORIES = [
  'litter',
  'pollution',
  'illegal_dumping',
  'deforestation',
  'water_contamination',
  'other',
];

const validateCreateIssue = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description')
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
    .isArray().withMessage('images must be an array of URLs')
    .isLength({ max: 4 }).withMessage('An issue can have at most 4 images'),
  body('address').optional().trim().isLength({ max: 300 }).withMessage('Address too long'),
];

const validateUpdateIssue = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description')
    .optional()
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
    .isArray().withMessage('images must be an array of URLs')
    .isLength({ max: 4 }).withMessage('An issue can have at most 4 images'),
  body('address').optional().trim().isLength({ max: 300 }).withMessage('Address too long'),
];

const validateStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['reported', 'acknowledged', 'in_progress', 'resolved'])
    .withMessage('Status must be one of: reported, acknowledged, in_progress, resolved'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Note cannot exceed 300 characters'),
];

const validateComment = [
  body('text')
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
