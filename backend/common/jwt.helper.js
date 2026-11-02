const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'dexa_attendance_super_secret_jwt_key_2026_dexa_group';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class JwtHelper {
  static sign(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verify(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  static extractTokenFromHeader(req) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length === 2 && (parts[0] === 'Bearer' || parts[0] === 'bearer')) {
      return parts[1];
    }
    return null;
  }
}

module.exports = { JwtHelper };
