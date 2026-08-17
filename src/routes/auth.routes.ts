import { Router } from 'express';

import {
  getMe,
  login,
  logout,
  refreshToken,
  register,
} from '../controllers/auth.controller.ts';

import { authenticate } from '../middleware/authenticate.ts';
import { validateBody } from '../middleware/validate.ts';

import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from '../validators/auth.validator.ts';

const router = Router();

router.post('/register', validateBody(registerSchema), register);

router.post('/login', validateBody(loginSchema), login);

router.get('/me', authenticate, getMe);

router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);

router.post('/logout', authenticate, validateBody(refreshTokenSchema), logout);

export default router;
