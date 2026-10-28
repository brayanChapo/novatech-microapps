function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}. Revisa .env (ver .env.example).`);
  return valor;
}

export const config = {
  get supabaseUrl() {
    return requerida('SUPABASE_URL');
  },
  get supabaseServiceRoleKey() {
    return requerida('SUPABASE_SERVICE_ROLE_KEY');
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  port: Number(process.env.PORT ?? 4000),
};
