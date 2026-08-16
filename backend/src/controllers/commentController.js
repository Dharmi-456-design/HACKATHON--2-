const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const asyncHandler = require('../utils/asyncHandler');

const addComment = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((e) => e.msg).join(', '));
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Issue not found');
  }
  const issue = await Issue.findOne({ _id: req.params.id, isDeleted: false });
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const comment = await Comment.create({
    issue: req.params.id,
    user: req.user._id,
    text: req.body.text,
  });

  const populated = await comment.populate('user', 'name points role');
  res.status(201).json({ comment: populated });
});

const getComments = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Issue not found');
  }
  const issue = await Issue.findOne({ _id: req.params.id, isDeleted: false });
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const comments = await Comment.find({ issue: req.params.id })
    .sort({ createdAt: 1 })
    .populate('user', 'name points role');

  res.json({ comments, total: comments.length });
});

module.exports = { addComment, getComments };
