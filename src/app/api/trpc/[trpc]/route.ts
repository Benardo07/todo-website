import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { env } from '~/env';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

function handler(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    const res = new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    return res;
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    responseMeta: ({ ctx, type, errors }) => {
      const headers = new Headers();
      headers.append('Access-Control-Allow-Origin', '*');

      // Depending on the operation and the presence of errors, you may adjust status codes
      const status = errors ? 400 : 200;

      return {
        headers,
        status,
      };
    },
    onError: env.NODE_ENV === 'development' ? ({ path, error }) => {
      console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
    } : undefined,
  });
}

export { handler as GET, handler as POST, handler as OPTIONS };

