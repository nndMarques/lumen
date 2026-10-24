// Lumen: envia o lembrete do terço (Web Push).
// Roda a cada minuto, chamada pelo agendador do banco (ver supabase/LEIA-ME.md).
// Para cada aparelho inscrito, vê se agora é a hora do lembrete no fuso da pessoa e se ela ainda não rezou hoje.
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
webpush.setVapidDetails(Deno.env.get('VAPID_ASSUNTO')!, Deno.env.get('VAPID_PUBLICA')!, Deno.env.get('VAPID_PRIVADA')!);

// hora (HH:MM) e dia no fuso da pessoa. O dia usa o mesmo formato do app: ano-mês-dia sem zero à esquerda (ex.: 2026-10-4).
function agoraNoFuso(fuso: string, quando = new Date()) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: fuso, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  const p = Object.fromEntries(f.formatToParts(quando).map((x) => [x.type, x.value]));
  const hh = p.hour === '24' ? '00' : p.hour;
  return { hora: `${hh}:${p.minute}`, dia: `${p.year}-${Number(p.month)}-${Number(p.day)}` };
}

function diasSeguidos(diario: Record<string, number>, fuso: string) {
  let n = 0;
  const d = new Date(Date.now() - 86400000); // começa por ontem: é a ofensiva que está em risco
  for (let i = 0; i < 400; i++) {
    const { dia } = agoraNoFuso(fuso, new Date(d.getTime() - i * 86400000));
    if (diario[dia] > 0) n++; else break;
  }
  return n;
}

Deno.serve(async (req) => {
  if (req.headers.get('x-lumen-segredo') !== Deno.env.get('LEMBRETE_SEGREDO')) return new Response('negado', { status: 401 });

  const { data: subs, error } = await sb.from('push_inscricoes').select('*').not('hora_terco', 'is', null);
  if (error) return new Response(error.message, { status: 500 });

  // só os que estão na hora agora
  const daHora = (subs ?? []).filter((s) => agoraNoFuso(s.fuso).hora === s.hora_terco);
  if (!daHora.length) return new Response(JSON.stringify({ enviados: 0 }), { headers: { 'content-type': 'application/json' } });

  const ids = [...new Set(daHora.map((s) => s.user_id))];
  const { data: perfis } = await sb.from('perfil').select('user_id, dados').in('user_id', ids);
  const dadosDe = new Map((perfis ?? []).map((p) => [p.user_id, p.dados ?? {}]));

  let enviados = 0;
  for (const s of daHora) {
    const dados = dadosDe.get(s.user_id) ?? {};
    const diario = (dados.tercoDiario ?? {}) as Record<string, number>;
    const { dia } = agoraNoFuso(s.fuso);
    if (diario[dia] > 0) continue; // já rezou hoje

    const seq = diasSeguidos(diario, s.fuso);
    const corpo = seq > 0
      ? `Sua ofensiva de ${seq} ${seq === 1 ? 'dia' : 'dias'} está em jogo. Reze o terço hoje.`
      : 'Um momento de oração com o Lumen.';
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ titulo: 'Hora do terço', corpo, url: './#/terco' }),
      );
      enviados++;
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await sb.from('push_inscricoes').delete().eq('id', s.id); // aparelho não existe mais
    }
  }
  return new Response(JSON.stringify({ enviados }), { headers: { 'content-type': 'application/json' } });
});
