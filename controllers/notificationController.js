import Notification from '../models/Notification.js';

export async function listNotifications(req, res, next) {
  try {
    const items = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: items.length, data: items });
  } catch (e) {
    next(e);
  }
}

export async function markRead(req, res, next) {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true },
    );
    if (!n) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.json({ success: true, data: n });
  } catch (e) {
    next(e);
  }
}
