import type { Request, Response } from 'express';

import prisma from '../../prisma/client.ts';

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category } = req.body;

    const userId = req.user.sub;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        price,
        category,
        userId,
      },
    });

    return res.status(201).json(announcement);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Failed to create announcement',
    });
  }
};

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = 10;

    const search = String(req.query.search || '');
    const sort = String(req.query.sort || 'newest');

    const where = search
      ? {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy: {
          createdAt: sort === 'oldest' ? 'asc' : 'desc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
            },
          },
        },
      }),

      prisma.announcement.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return res.status(200).json({
      data: announcements,
      pagination: {
        total,
        page,
        totalPages,
        perPage,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Failed to get announcements',
    });
  }
};

export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!announcement) {
      return res.status(404).json({
        error: 'Announcement not found',
      });
    }

    return res.status(200).json(announcement);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Failed to get announcement',
    });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, description, price, category } = req.body;
    const userId = req.user.sub;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({
        error: 'Announcement not found',
      });
    }

    if (announcement.userId !== userId) {
      return res.status(403).json({
        error: 'You can only update your own announcements',
      });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        description,
        price,
        category,
      },
    });

    return res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Failed to update announcement',
    });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.sub;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({
        error: 'Announcement not found',
      });
    }

    if (announcement.userId !== userId) {
      return res.status(403).json({
        error: 'You can only delete your own announcements',
      });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Failed to delete announcement',
    });
  }
};
