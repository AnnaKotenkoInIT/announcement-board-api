import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Authorization header is required',
    });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Invalid authorization format',
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload !== 'object' || !payload.sub) {
      return res.status(401).json({
        error: 'Invalid token',
      });
    }

    req.user = {
      sub: Number(payload.sub),
    };

    next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }
};
