const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const { STATUSES, PRIORITIES } = require('../models/Issue');
const { awardPoints, POINTS_PER_RESOLUTION } = require('../services/pointsService');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { sanitizeText } = require('../utils/sanitize');

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((e) => e.msg).join(', '));
    err.statusCode = 400;
    throw err;
  }
};

const changeStatus = asyncHandler(async (req, res, next) => {
  checkValidation(req);
  const { status, note } = req.body;

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Issue not found');
  }
  const issue = await Issue.findOne({ _id: req.params.id, isDeleted: false });
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  if (req.body.priority !== undefined && !PRIORITIES.includes(req.body.priority)) {
    const err = new Error('Priority must be one of: low, medium, high');
    err.statusCode = 400;
    throw err;
  }

  const wasResolved = issue.status === 'resolved';
  const oldStatus = issue.status;

  if (status !== oldStatus) {
    issue.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note ? sanitizeText(note, 300) : '',
    });
  }

  issue.status = status;
  if (req.body.priority !== undefined) {
    issue.priority = req.body.priority;
  }

  const updated = await issue.save();

  if (status !== oldStatus) {
    await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      message: `Your issue "${sanitizeText(issue.title, 120)}" status was updated to ${status}.`
    });
  }

  if (status === 'resolved' && !wasResolved) {
    await awardPoints(issue.reportedBy, POINTS_PER_RESOLUTION);
  }

  const populated = await updated.populate('reportedBy', 'name points role');
  res.json({ issue: populated });
});

const getStats = asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await Issue.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        resolvedThisWeek: [
          {
            $match: {
              status: 'resolved',
              $expr: {
                $gte: [
                  { $last: '$statusHistory.changedAt' },
                  weekAgo,
                ],
              },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ]);

  const facet = result[0] || {};
  const total = await Issue.countDocuments({ isDeleted: false });

  const toObject = (arr) =>
    arr.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});

  const resolvedThisWeek =
    facet.resolvedThisWeek && facet.resolvedThisWeek.length > 0
      ? facet.resolvedThisWeek[0].count
      : 0;

  res.json({
    total,
    resolvedThisWeek,
    byStatus: toObject(facet.byStatus || []),
    byCategory: toObject(facet.byCategory || []),
    byPriority: toObject(facet.byPriority || []),
  });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const leaders = await Issue.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$reportedBy',
        resolvedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        resolvedCount: 1,
        user: {
          id: '$user._id',
          name: '$user.name',
          points: '$user.points',
        },
      },
    },
    { $sort: { resolvedCount: -1, 'user.points': -1 } },
    { $limit: 10 },
  ]);

  res.json({ leaders });
});

const exportCsv = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ isDeleted: false })
    .populate('reportedBy', 'name email')
    .sort({ createdAt: -1 });

  // CSV-formula injection guard: a leading =,+,-,@ is treated by spreadsheets
  // as a formula, so we prefix it with a single quote to neutralize it.
  const csvField = (value) => {
    let s = String(value ?? '');
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };

  const fields = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Reporter', 'Reporter Email', 'Created At'];
  const csvLines = [fields.join(',')];

  issues.forEach(issue => {
    const row = [
      csvField(issue._id),
      csvField(issue.title),
      csvField(issue.category),
      csvField(issue.status),
      csvField(issue.priority),
      csvField(issue.reportedBy?.name),
      csvField(issue.reportedBy?.email),
      csvField(issue.createdAt.toISOString()),
    ];
    csvLines.push(row.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="issues_export.csv"');
  res.status(200).send(csvLines.join('\n'));
});

module.exports = { changeStatus, getStats, getLeaderboard, exportCsv };
