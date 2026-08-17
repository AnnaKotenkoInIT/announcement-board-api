import { Router } from 'express';

import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcements.controller.ts';

import { authenticate } from '../middleware/authenticate.ts';
import upload from '../middleware/upload.ts';

import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validate.ts';

import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementIdSchema,
  announcementQuerySchema,
} from '../validators/announcements.validator.ts';

const router = Router();

router.post(
  '/',
  authenticate,
  upload.single('image'),
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);

router.get('/', validateQuery(announcementQuerySchema), getAnnouncements);

router.get('/:id', validateParams(announcementIdSchema), getAnnouncementById);

router.patch(
  '/:id',
  authenticate,
  upload.single('image'),
  validateParams(announcementIdSchema),
  validateBody(updateAnnouncementSchema),
  updateAnnouncement,
);

router.delete(
  '/:id',
  authenticate,
  validateParams(announcementIdSchema),
  deleteAnnouncement,
);

export default router;
