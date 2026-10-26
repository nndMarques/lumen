// Configuração pública do servidor (Supabase). Deixe vazio para o app funcionar só no aparelho.
// A chave "anon" é feita para ficar no navegador: quem protege os dados são as regras do banco (RLS).
// NUNCA coloque aqui a chave "service_role".
export const CONFIG = {
  supabaseUrl: '',      // ex.: https://abcdefgh.supabase.co
  supabaseAnonKey: '',  // ex.: eyJhbGciOi...
  vapidPublicKey: '',   // chave pública das notificações (ver supabase/LEIA-ME.md)
  goatcounter: '',      // código do seu site no GoatCounter (contagem anônima de visitas)
};
