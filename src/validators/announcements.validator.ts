import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const announcementIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const announcementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  search: z.string().optional(),

  sort: z.enum(['newest', 'oldest']).default('newest'),
});
