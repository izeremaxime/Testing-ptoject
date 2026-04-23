import mongoose from 'mongoose';

const assignmentHistorySchema = new mongoose.Schema(
  {
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    /** Numeric rank for sorting (low=1, medium=2, high=3) */
    priorityRank: { type: Number, default: 2 },
    dueDate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    category: { type: String, trim: true, maxlength: 64 },
    tags: [{ type: String, trim: true, maxlength: 32 }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: { type: Date },
    assignmentHistory: { type: [assignmentHistorySchema], default: [] },
    /** Kept for backward compatibility with existing clients; synced with status */
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

todoSchema.index({ title: 'text', description: 'text' });
todoSchema.index({ createdBy: 1, status: 1 });
todoSchema.index({ assignedTo: 1 });
todoSchema.index({ dueDate: 1 });
todoSchema.index({ createdAt: -1 });

function syncCompletedAndStatus(doc) {
  if (doc.isModified('status') && !doc.isModified('completed')) {
    doc.completed = doc.status === 'completed';
    if (doc.status === 'completed') {
      doc.completedAt = doc.completedAt || new Date();
    } else {
      doc.completedAt = undefined;
    }
  } else if (doc.isModified('completed') && !doc.isModified('status')) {
    doc.status = doc.completed ? 'completed' : 'pending';
    if (doc.completed) {
      doc.completedAt = doc.completedAt || new Date();
    } else {
      doc.completedAt = undefined;
    }
  } else if (doc.isModified('status')) {
    if (doc.status === 'completed') {
      doc.completed = true;
      doc.completedAt = doc.completedAt || new Date();
    } else {
      doc.completed = false;
      doc.completedAt = undefined;
    }
  }
}

const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

todoSchema.pre('save', function preSaveSync() {
  this.priorityRank = PRIORITY_RANK[this.priority] ?? 2;
  syncCompletedAndStatus(this);
});

todoSchema.pre('findOneAndUpdate', async function preFindOneAndUpdate() {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;
  if ($set.priority !== undefined) {
    $set.priorityRank = PRIORITY_RANK[$set.priority] ?? 2;
    if (update.$set) update.$set = $set;
  }
  if ($set.status !== undefined) {
    $set.completed = $set.status === 'completed';
    $set.completedAt =
      $set.status === 'completed' ? $set.completedAt || new Date() : undefined;
    if (update.$set) update.$set = $set;
  } else if ($set.completed !== undefined) {
    $set.status = $set.completed ? 'completed' : 'pending';
    $set.completedAt = $set.completed ? $set.completedAt || new Date() : undefined;
    if (update.$set) update.$set = $set;
  }
});

todoSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id;
    return ret;
  },
});

export default mongoose.model('Todo', todoSchema);
