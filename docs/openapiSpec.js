/** OpenAPI 3 spec for Swagger UI (SQA final exam API). */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Todo API — SQA Final',
    version: '1.0.0',
    description:
      'JWT authentication, RBAC, advanced todos, analytics, and notifications.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['user', 'manager', 'admin'] },
        },
      },
      Todo: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', format: 'date-time' },
          category: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { '200': { description: 'Tokens' } },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: { '200': { description: 'New tokens' } },
      },
    },
    '/api/todos': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List todos (filters, cursor pagination, sort, full-text q)',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'assignedTo', in: 'query', schema: { type: 'string' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List' } },
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Create todo',
        requestBody: {
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Todo' } },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/todos/bulk-delete': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Bulk delete',
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { ids: { type: 'array', items: {} } } },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/todos/bulk-update': {
      patch: {
        security: [{ bearerAuth: [] }],
        summary: 'Bulk update',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/todos/{id}/assign': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Assign todo (manager/admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/analytics/system': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'System analytics (admin)',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/analytics/team': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Team analytics (manager/admin)',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/analytics/export': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Export todos JSON (admin)',
        responses: { '200': { description: 'Export' } },
      },
    },
    '/api/notifications': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'My notifications',
        responses: { '200': { description: 'List' } },
      },
    },
  },
};
