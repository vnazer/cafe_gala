import { sql, DAY, json } from './_db.js';

// GET /api/sync?since=<rev>&days=YYYY-MM-DD,YYYY-MM-DD
// since=0 → foto completa de esos días (sin borrados) + menú.
// since>0 → cambios desde ese rev, incluidos borrados. Se reenvían también los
// tocados en los últimos 15 s por si una escritura concurrente confirmó con un rev menor.
export async function GET(request) {
  const url = new URL(request.url);
  const since = Math.max(0, parseInt(url.searchParams.get('since'), 10) || 0);
  const days = (url.searchParams.get('days') || '').split(',').filter(d => DAY.test(d)).slice(0, 7);
  try {
    const [docs, [{ rev }]] = await Promise.all([
      since > 0
        ? sql`select path, coll, day, data, deleted, rev::text as rev from docs
              where (rev > ${since} or updated_at > now() - interval '15 seconds')
                and (day is null or day = any(${days}::text[]))`
        : sql`select path, coll, day, data, deleted, rev::text as rev from docs
              where not deleted and (day is null or day = any(${days}::text[]))`,
      sql`select coalesce(max(rev), 0)::text as rev from docs`
    ]);
    return json({ rev: Number(rev), docs });
  } catch (e) {
    console.error(e);
    return json({ error: 'Error de base de datos' }, 503);
  }
}
