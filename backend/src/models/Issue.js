const mongoose = require('mongoose');

const CATEGORIES = [
  'litter',
  'pollution',
  'illegal_dumping',
  'deforestation',
  'water_contamination',
  'other',
];

const STATUSES = ['reported', 'acknowledged', 'in_progress', 'resolved'];

const PRIORITIES = ['low', 'medium', 'high'];

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 4,
        message: 'An issue can have at most 4 images',
      },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
        validate: {
          validator: (coords) =>
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          message: 'Coordinates must be [longitude, latitude] within valid ranges',
        },
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'reported',
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'medium',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A reporter is required'],
    },
    upvotedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: STATUSES, required: true },
          changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          changedAt: { type: Date, default: Date.now },
          note: { type: String, trim: true, maxlength: [300, 'Note cannot exceed 300 characters'] },
        },
      ],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

issueSchema.index({ location: '2dsphere' });
issueSchema.index({ category: 1, status: 1 });

issueSchema.virtual('upvoteCount').get(function () {
  return this.upvotedBy ? this.upvotedBy.length : 0;
});

issueSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.isDeleted;
    return ret;
  },
});

module.exports = mongoose.model('Issue', issueSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
