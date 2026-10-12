import { sql, DAY, json } from '../lib/db.js';

const ORDER = /^orders\/[A-Za-z0-9_-]{1,64}$/;
const CLOSING = /^closings\/(\d{4}-\d{2}-\d{2})$/;
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

function target(path, body) {
  if (path === 'config/menu') return { coll: 'config', day: null };
  const c = CLOSING.exec(path);
  if (c) return { coll: 'closings', day: c[1] };
  if (ORDER.test(path)) return { coll: 'orders', day: DAY.test(body.day) ? body.day : null, needsDay: true };
  return null;
}

// POST /api/write  {op:'set'|'patch'|'delete', path, day?, data?, patch?}
export async function POST(request) {
  if (Number(request.headers.get('content-length') || 0) > 256 * 1024) return json({ error: 'Demasiado grande' }, 413);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'JSON inválido' }, 400); }
  const { op, path } = body || {};
  const t = typeof path === 'string' ? target(path, body) : null;
  if (!t) return json({ error: 'Ruta inválida' }, 400);
  try {
    if (op === 'set') {
      if (!isObj(body.data)) return json({ error: 'Faltan datos' }, 400);
      if (t.needsDay && !t.day) return json({ error: 'Falta el día' }, 400);
      const [r] = await sql`insert into docs (path, coll, day, data, deleted)
        values (${path}, ${t.coll}, ${t.day}, ${JSON.stringify(body.data)}::jsonb, false)
        on conflict (path) do update set coll = excluded.coll, day = excluded.day, data = excluded.data, deleted = false
        returning rev::text as rev`;
      return json({ rev: Number(r.rev) });
    }
    if (op === 'patch') {
      if (!isObj(body.patch)) return json({ error: 'Faltan cambios' }, 400);
      const rows = await sql`update docs set data = jsonb_deep_merge(data, ${JSON.stringify(body.patch)}::jsonb)
        where path = ${path} and not deleted returning rev::text as rev`;
      if (!rows.length) return json({ error: 'No existe', code: 'not_found' }, 404);
      return json({ rev: Number(rows[0].rev) });
    }
    if (op === 'delete') {
      const rows = await sql`update docs set deleted = true where path = ${path} returning rev::text as rev`;
      return json({ rev: rows.length ? Number(rows[0].rev) : 0 });
    }
    return json({ error: 'Operación inválida' }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: 'Error de base de datos' }, 503);
  }
}
