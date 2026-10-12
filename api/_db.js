import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

export const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
