import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    branchId?: string;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dear_desserts_super_secret_jwt_key_2026_qsr';

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Access Token Missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or Expired Token' });
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires role ${roles.join(' or ')}` });
    }

    next();
  };
};
