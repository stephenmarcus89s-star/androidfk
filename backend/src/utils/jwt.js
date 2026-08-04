import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function signJwt(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch {
    return null;
  }
}

export function decodeBearer(authHeader) {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1];
}
