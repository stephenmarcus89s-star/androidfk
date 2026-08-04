import { AdminModel } from '../models/Admin.js';
import { SettingsModel } from '../models/Settings.js';
import { signJwt } from '../utils/jwt.js';
import { comparePassword } from '../utils/hash.js';
import { asyncHandler } from '../middleware/error.js';
import { schemas, validate } from '../middleware/validate.js';

export const login = [
  validate(schemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.validated;
    const admin = await AdminModel.findByEmail(email.toLowerCase());
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await comparePassword(password, admin.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signJwt({ sub: admin.id, role: admin.role });
    const safeAdmin = await AdminModel.findById(admin.id);
    res.json({
      token,
      admin: safeAdmin,
    });
  }),
];

export const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});

export const changePassword = [
  validate(schemas.changePassword),
  asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.validated;
    const full = await AdminModel.findByEmail(req.admin.email);
    const ok = await comparePassword(current_password, full.password_hash);
    if (!ok) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const { hashPassword } = await import('../utils/hash.js');
    const newHash = await hashPassword(new_password);
    await AdminModel.updatePassword(req.admin.id, newHash);
    res.json({ success: true });
  }),
];

export const updateProfile = [
  validate(schemas.updateProfile),
  asyncHandler(async (req, res) => {
    const { name, email } = req.validated;
    const updated = await AdminModel.updateProfile(req.admin.id, { name, email: email.toLowerCase() });
    res.json({ admin: updated });
  }),
];
