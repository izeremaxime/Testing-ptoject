import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Todo from '../models/Todo.js';
import { AppError } from '../utils/AppError.js';
import { validatePasswordStrength } from '../utils/password.js';
import { ROLES } from '../config/constants.js';

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (e) {
    next(e);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase().trim();
    await user.save();
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (e) {
    next(e);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const ok = await user.comparePassword(currentPassword);
    if (!ok) throw AppError.unauthorized('Current password is incorrect');
    if (!validatePasswordStrength(newPassword)) {
      throw AppError.badRequest(
        'New password must meet strength requirements',
        'WEAK_PASSWORD',
      );
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, data: { message: 'Password updated' } });
  } catch (e) {
    next(e);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to delete your account' });
    }
    const userId = req.user._id;
    const user = await User.findById(userId).select('+password');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    await Todo.deleteMany({ $or: [{ createdBy: userId }, { assignedTo: userId }] });
    await User.findByIdAndDelete(userId);
    res.json({ success: true, data: {} });
  } catch (e) {
    next(e);
  }
}

export async function myStats(req, res, next) {
  try {
    const uid = req.user._id;
    const [created, assigned, byStatus] = await Promise.all([
      Todo.countDocuments({ createdBy: uid }),
      Todo.countDocuments({ assignedTo: uid }),
      Todo.aggregate([
        { $match: { $or: [{ createdBy: uid }, { assignedTo: uid }] } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      success: true,
      data: { createdCount: created, assignedCount: assigned, byStatus },
    });
  } catch (e) {
    next(e);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('name email role emailVerified createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (e) {
    next(e);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (![ROLES.USER, ROLES.MANAGER, ROLES.ADMIN].includes(role)) {
      throw AppError.badRequest('Invalid role');
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    );
    if (!user) throw AppError.notFound('User not found');
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (e) {
    next(e);
  }
}
