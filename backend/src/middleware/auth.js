import { verifyJwt, decodeBearer } from '../utils/jwt.js';
import { AdminModel } from '../models/Admin.js';

export async function requireAuth(req, res, next) {
  try {
    const token = decodeBearer(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const admin = await AdminModel.findById(decoded.sub);
    if (!admin) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}
