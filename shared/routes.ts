import { z } from 'zod';
import { insertGameResultSchema, gameResults } from './schema';

export const api = {
  results: {
    list: {
      method: 'GET' as const,
      path: '/api/results',
      responses: {
        200: z.array(z.custom<typeof gameResults.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/results',
      input: insertGameResultSchema,
      responses: {
        201: z.custom<typeof gameResults.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
};
