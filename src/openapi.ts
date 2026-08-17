import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from './validators/auth.validator.ts';

import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementIdSchema,
  announcementQuerySchema,
} from './validators/announcements.validator.ts';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

/* =========================
   AUTH
========================= */

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User successfully registered',
    },
    400: {
      description: 'Validation failed',
    },
    409: {
      description: 'User already exists',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
    },
    400: {
      description: 'Validation failed',
    },
    401: {
      description: 'Invalid credentials',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Current authenticated user',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshTokenSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Token refreshed',
    },
    400: {
      description: 'Validation failed',
    },
    401: {
      description: 'Invalid refresh token',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshTokenSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Logout successful',
    },
    400: {
      description: 'Validation failed',
    },
    401: {
      description: 'Invalid refresh token',
    },
  },
});

/* =========================
   ANNOUNCEMENTS
========================= */

registry.registerPath({
  method: 'get',
  path: '/announcements',
  tags: ['Announcements'],
  request: {
    query: announcementQuerySchema,
  },
  responses: {
    200: {
      description: 'List of announcements',
    },
    400: {
      description: 'Validation failed',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/announcements/{id}',
  tags: ['Announcements'],
  request: {
    params: announcementIdSchema,
  },
  responses: {
    200: {
      description: 'Announcement found',
    },
    400: {
      description: 'Validation failed',
    },
    404: {
      description: 'Announcement not found',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/announcements',
  tags: ['Announcements'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createAnnouncementSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Announcement created',
    },
    400: {
      description: 'Validation failed',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/announcements/{id}',
  tags: ['Announcements'],
  security: [{ bearerAuth: [] }],
  request: {
    params: announcementIdSchema,
    body: {
      content: {
        'application/json': {
          schema: updateAnnouncementSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Announcement updated',
    },
    400: {
      description: 'Validation failed',
    },
    401: {
      description: 'Unauthorized',
    },
    403: {
      description: 'Forbidden',
    },
    404: {
      description: 'Announcement not found',
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/announcements/{id}',
  tags: ['Announcements'],
  security: [{ bearerAuth: [] }],
  request: {
    params: announcementIdSchema,
  },
  responses: {
    204: {
      description: 'Announcement deleted',
    },
    400: {
      description: 'Validation failed',
    },
    401: {
      description: 'Unauthorized',
    },
    403: {
      description: 'Forbidden',
    },
    404: {
      description: 'Announcement not found',
    },
  },
});

/* =========================
   OPENAPI DOCUMENT
========================= */

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Announcement Board API',
      version: '1.0.0',
      description: 'REST API for announcement board',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  });
}
