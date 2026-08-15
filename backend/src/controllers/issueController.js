import React from 'react';
  
  const IssueController = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default IssueController;
  const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { listIssues } = require('../services/issueService');
const asyncHandler = require('../utils/asyncHandler');

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((e) => e.msg).join(', '));
    err.statusCode = 400;
    throw err;
  }
};

const createIssue = asyncHandler(async (req, res, next) => {
  checkValidation(req);
  const { title, description, category, images, location, address } = req.body;

  const issue = await Issue.create({
    title,
    description,
    category,
    images: images || [],
    location,
    address: address || '',
    reportedBy: req.user._id,
    statusHistory: [
      {
        status: 'reported',
        changedBy: req.user._id,
        changedAt: new Date(),
        note: 'Issue reported',
      },
    ],
  });

  const populated = await issue.populate('reportedBy', 'name points role');
  res.status(201).json({ issue: populated });
});

const getIssues = asyncHandler(async (req, res) => {
  const result = await listIssues({
    category: req.query.category,
    status: req.query.status,
    search: req.query.search,
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
    near: req.query.near,
    maxDistance: req.query.maxDistance,
  });
  res.json(result);
});

const getMyIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ reportedBy: req.user._id, isDeleted: false })
    .sort({ createdAt: -1 })
    .populate('reportedBy', 'name points role');
  res.json({ issues, total: issues.length });
});

const getIssue = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Issue not found');
  }
  const issue = await Issue.findOne({ _id: req.params.id, isDeleted: false }).populate(
    'reportedBy',
    'name points role'
  );
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }
  res.json({ issue });
});

const updateIssue = asyncHandler(async (req, res, next) => {
  checkValidation(req);
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Issue not found');
  }
  const issue = await Issue.findOne({ _id: req.params.id, isDeleted: false });
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = issue.reportedBy.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) {
    res.status(403);
    throw new Error('You can only edit your own issues');
  }

  const allowed = ['title', 'description', 'category', 'images', 'location', 'address'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) issue[field] = req.body[field];
  });

  const updated = await issue.save();
  const populated = await updated.populate('reportedBy', 'name points role');
  res.json({ issue: populated });
});

const deleteIssue = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Issue not found');
  }
  const issue = await Issue.findOne({ _id: req.params.id, isDeleted: false });
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = issue.reportedBy.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) {
    res.status(403);
    throw new Error('You can only delete your own issues');
  }

  issue.isDeleted = true;
  await issue.save();
  res.json({ success: true });
});

const toggleUpvote = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Issue not found');
  }
  const issue = await Issue.findOne({ _id: req.params.id, isDeleted: false });
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const userId = req.user._id;
  const alreadyVoted = issue.upvotedBy.some((id) => id.toString() === userId.toString());

  if (alreadyVoted) {
    issue.upvotedBy = issue.upvotedBy.filter((id) => id.toString() !== userId.toString());
  } else {
    issue.upvotedBy.push(userId);
  }

  await issue.save();

  res.json({
    upvoteCount: issue.upvotedBy.length,
    upvoted: !alreadyVoted,
  });
});

module.exports = {
  createIssue,
  getIssues,
  getMyIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  toggleUpvote,
};
