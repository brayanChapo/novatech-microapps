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
  get supabaseAnonKey() {
    return requerida('SUPABASE_ANON_KEY');
  },
  get metaWaToken() {
    return requerida('META_WA_TOKEN');
  },
  get metaWaPhoneId() {
    return requerida('META_WA_PHONE_ID');
  },
  get metaWaWebhookToken() {
    return requerida('META_WA_WEBHOOK_TOKEN');
  },
  get resendApiKey() {
    return requerida('RESEND_API_KEY');
  },
  get cronSecret() {
    return requerida('CRON_SECRET');
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  port: Number(process.env.PORT ?? 4001),
};
