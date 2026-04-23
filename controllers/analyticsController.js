import Todo from '../models/Todo.js';
import User from '../models/User.js';

export async function systemAnalytics(req, res, next) {
  try {
    const [usersByRole, todosByStatus, totalTodos, totalUsers] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Todo.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Todo.countDocuments(),
      User.countDocuments(),r
      
    ]);
    res.json({
      success: true,
      data: { totalUsers, totalTodos, usersByRole, todosByStatus },
    });
  } catch (e) {
    next(e);
  }
}

export async function teamAnalytics(req, res, next) {
  try {
    const byAssignee = await Todo.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    res.json({ success: true, data: { byAssignee } });
  } catch (e) {
    next(e);
  }
}

export async function exportTodos(req, res, next) {
  try {
    const todos = await Todo.find().populate('createdBy', 'email name').lean();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="todos-export.json"');
    res.json({ success: true, data: todos });
  } catch (e) {
    next(e);
  }
}
