import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('API (sin base de datos)', () => {
  it('GET /salud responde sin autenticación', async () => {
    const res = await app.request('/salud');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, servicio: 'asistencia' });
  });

  it('rechaza rutas protegidas sin token con 401 y mensaje en español', async () => {
    const res = await app.request('/marcaciones', { method: 'POST', body: '{}' });
    expect(res.status).toBe(401);
    const cuerpo = (await res.json()) as { error: { codigo: string; mensaje: string } };
    expect(cuerpo.error.codigo).toBe('NO_AUTENTICADO');
    expect(cuerpo.error.mensaje).toMatch(/sesión/i);
  });

  it('el dashboard también exige sesión', async () => {
    const res = await app.request('/dashboard/resumen');
    expect(res.status).toBe(401);
  });

  it('CORS solo permite orígenes configurados', async () => {
    const ok = await app.request('/salud', { headers: { Origin: 'http://localhost:3000' } });
    expect(ok.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    const malo = await app.request('/salud', { headers: { Origin: 'https://sitio-malicioso.com' } });
    expect(malo.headers.get('access-control-allow-origin')).toBeNull();
  });
});
