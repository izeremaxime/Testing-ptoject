import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['assignment', 'system'],
      default: 'assignment',
    },
    relatedTodoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo',
    },
  },
  { timestamps: true },
);

export default mongoose.model('Notification', notificationSchema);
