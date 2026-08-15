import React from 'react';
  
  const IssueService = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default IssueService;
  const Issue = require('../models/Issue');

const buildIssueQuery = ({ category, status, search, near, maxDistance }) => {
  const query = { isDeleted: false };

  if (category) query.category = category;
  if (status) query.status = status;

  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ title: regex }, { description: regex }, { address: regex }];
  }

  if (near) {
    const coords = near.split(',').map(Number);
    if (coords.length === 2 && coords.every((n) => !Number.isNaN(n))) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: Number(maxDistance) || 10000,
        },
      };
    }
  }

  return query;
};

const buildSort = (sort) => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'most_upvoted':
      return { upvotedBy: -1 };
    case 'recent':
    default:
      return { createdAt: -1 };
  }
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listIssues = async ({ category, status, search, sort, page = 1, limit = 10, near, maxDistance }) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const query = buildIssueQuery({ category, status, search, near, maxDistance });
  const sortObj = buildSort(sort);

  const [issues, total] = await Promise.all([
    Issue.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('reportedBy', 'name points role'),
    Issue.countDocuments(query),
  ]);

  return {
    issues,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    limit: limitNum,
  };
};

module.exports = { listIssues, buildIssueQuery, buildSort };
