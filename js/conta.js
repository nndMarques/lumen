// Conta, sincronização e notificações (Supabase). Tudo isso é opcional:
// sem configuração em config.js, o app continua funcionando só no aparelho.
//
// O que vai para o servidor:
//   - "dados": ofensiva, terços rezados, línguas, lembretes e data da última confissão (legível pelo servidor,
//     porque o aviso precisa saber se a pessoa já rezou hoje);
//   - "cofre": a lista de confissão e as anotações, CIFRADAS no aparelho (AES-GCM, chave derivada de uma senha
//     que só a pessoa sabe). O servidor guarda só texto cifrado e não consegue ler.
import { CONFIG } from './config.js';

const SUPABASE_ESM = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// Chaves guardadas em "dados" (legíveis) e em "cofre" (cifradas)
export const DADOS_CHAVES = ['tercosRezados', 'tercoDiario', 'tercoHoje', 'ofensivaRecorde', 'lingua1', 'lingua2', 'lingua', 'lembreHora', 'lembreConf', 'ultimaConfissao', 'estados'];
export const COFRE_CHAVES = ['marcados', 'nota'];

let io = null;          // ponte com o armazenamento do app (injetada em ligarConta)
let aoAtualizar = () => {};
let _cli = null;
let chaveCofre = null;  // CryptoKey, só na memória (e, se a pessoa quiser, no IndexedDB, sem poder ser exportada)
let sincronizando = false;
let timer = null;
let ultimoSync = 0;

export const contaDisponivel = () => !!(_cli || (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey));
export const pushDisponivel = () => !!(CONFIG.vapidPublicKey && 'serviceWorker' in navigator && 'PushManager' in window);

async function cliente() {
  if (_cli) return _cli;
  if (!contaDisponivel()) throw new Error('A conta ainda não foi configurada.');
  const { createClient } = await import(SUPABASE_ESM);
  _cli = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'lumen.sessao' },
  });
  return _cli;
}
export function _definirCliente(c) { _cli = c; } // usado só nos testes

const temSessaoGuardada = () => { try { return !!localStorage.getItem('lumen.sessao'); } catch (e) { return false; } };

export async function usuario() {
  if (!_cli && !temSessaoGuardada()) return null;
  const c = await cliente();
  const { data } = await c.auth.getSession();
  return data && data.session ? data.session.user : null;
}

export function mensagemDeErro(e) {
  const m = String((e && (e.message || e.error_description)) || e || '');
  if (/rate limit|too many|over_email_send_rate_limit/i.test(m)) return 'Muitas tentativas. Espere um minuto e tente de novo.';
  if (/token.*(expired|invalid)|invalid.*token|otp/i.test(m)) return 'Código inválido ou vencido. Peça um novo.';
  if (/invalid.*email|email.*invalid|unable to validate email/i.test(m)) return 'Esse e-mail não parece válido.';
  if (/fetch|network|failed to/i.test(m)) return 'Sem conexão com o servidor. Tente de novo mais tarde.';
  return m || 'Algo deu errado. Tente de novo.';
}

// ---------- Login por código (sem senha) ----------
export async function enviarCodigo(email) {
  const c = await cliente();
  const { error } = await c.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function confirmarCodigo(email, codigo) {
  const c = await cliente();
  const { error } = await c.auth.verifyOtp({ email: email.trim(), token: codigo.replace(/\s+/g, ''), type: 'email' });
  if (error) throw error;
  return sincronizar();
}

export async function sair() {
  try { const c = await cliente(); await c.auth.signOut(); } catch (e) {}
  esquecerCofre();
  io && io.apagarMeta();
}

export async function apagarConta() {
  const c = await cliente();
  await desativarPush().catch(() => {});
  const { error } = await c.rpc('apagar_minha_conta');
  if (error) throw error;
  await sair();
}

// ---------- Cofre: criptografia no aparelho ----------
const b64 = (buf) => { let s = ''; new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); }); return btoa(s); };
const deb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derivar(senha, sal) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: sal, iterations: 300000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function cifrar(chave, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, chave, new TextEncoder().encode(JSON.stringify(obj)));
  const junto = new Uint8Array(12 + ct.byteLength);
  junto.set(iv, 0); junto.set(new Uint8Array(ct), 12);
  return b64(junto);
}
async function decifrar(chave, texto) {
  const junto = deb64(texto);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: junto.slice(0, 12) }, chave, junto.slice(12));
  return JSON.parse(new TextDecoder().decode(pt));
}
export const _cripto = { derivar, cifrar, decifrar };

// guarda a chave (que não pode ser exportada) no IndexedDB, para não pedir a senha a cada abertura
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('lumen-cofre', 1); r.onupgradeneeded = () => r.result.createObjectStore('k'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function idbGet(k) { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction('k').objectStore('k').get(k); t.onsuccess = () => res(t.result); t.onerror = () => rej(t.error); }); }
async function idbSet(k, v) { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction('k', 'readwrite').objectStore('k').put(v, k); t.onsuccess = () => res(); t.onerror = () => rej(t.error); }); }
async function idbDel(k) { const db = await idb(); return new Promise((res) => { const t = db.transaction('k', 'readwrite').objectStore('k').delete(k); t.onsuccess = () => res(); t.onerror = () => res(); }); }

export function esquecerCofre() { chaveCofre = null; usuario().then((u) => u && idbDel('cofre:' + u.id)).catch(() => {}); }

async function carregarChaveGuardada() {
  if (chaveCofre) return true;
  try { const u = await usuario(); if (!u) return false; const k = await idbGet('cofre:' + u.id); if (k) { chaveCofre = k; return true; } } catch (e) {}
  return false;
}

async function perfilRemoto() {
  const c = await cliente(); const u = await usuario();
  const { data, error } = await c.from('perfil').select('dados, atualizado_em, cofre, cofre_salt, cofre_em').eq('user_id', u.id).maybeSingle();
  if (error) throw error;
  return { u, p: data };
}

// Primeira vez: cria a senha do cofre (e guarda só o "sal", que não é segredo)
export async function criarCofre(senha, lembrar = true) {
  if (!senha || senha.length < 8) throw new Error('Use uma senha do cofre com pelo menos 8 caracteres.');
  const c = await cliente(); const u = await usuario();
  const sal = crypto.getRandomValues(new Uint8Array(16));
  chaveCofre = await derivar(senha, sal);
  const { error } = await c.from('perfil').upsert({ user_id: u.id, cofre_salt: b64(sal) }, { onConflict: 'user_id' });
  if (error) { chaveCofre = null; throw error; }
  if (lembrar) await idbSet('cofre:' + u.id, chaveCofre).catch(() => {});
  io.set('cofreModificadoEm', null);
  return sincronizar();
}

// Outro aparelho (ou depois de fechar o cofre): confere a senha tentando abrir o que já está guardado
export async function abrirCofre(senha, lembrar = true) {
  const { u, p } = await perfilRemoto();
  if (!p || !p.cofre_salt) throw new Error('Ainda não há cofre. Crie a senha primeiro.');
  const chave = await derivar(senha, deb64(p.cofre_salt));
  if (p.cofre) {
    try { await decifrar(chave, p.cofre); } catch (e) { throw new Error('Senha do cofre incorreta.'); }
  }
  chaveCofre = chave;
  if (lembrar) await idbSet('cofre:' + u.id, chave).catch(() => {});
  return sincronizar();
}

// ---------- Sincronização ----------
function lerDados() {
  const d = {};
  DADOS_CHAVES.forEach((k) => { const v = io.get(k, undefined); if (v !== undefined) d[k] = v; });
  return d;
}
function gravarDados(d) {
  DADOS_CHAVES.forEach((k) => { if (d && k in d) io.setQuieto(k, d[k]); else io.delQuieto(k); });
}

// Primeira ligação deste aparelho: junta os dois lados, sem perder nada
export function mesclar(a = {}, b = {}) {
  const r = { ...b, ...a };
  const dia = { ...(b.tercoDiario || {}) };
  Object.keys(a.tercoDiario || {}).forEach((k) => { dia[k] = Math.max(dia[k] || 0, a.tercoDiario[k]); });
  r.tercoDiario = dia;
  r.tercosRezados = Math.max(a.tercosRezados || 0, b.tercosRezados || 0);
  r.ofensivaRecorde = Math.max(a.ofensivaRecorde || 0, b.ofensivaRecorde || 0);
  const ua = a.ultimaConfissao && new Date(a.ultimaConfissao), ub = b.ultimaConfissao && new Date(b.ultimaConfissao);
  if (ua || ub) r.ultimaConfissao = ((ua || 0) > (ub || 0) ? a : b).ultimaConfissao;
  if (a.tercoHoje && b.tercoHoje && a.tercoHoje.dia === b.tercoHoje.dia) {
    r.tercoHoje = { dia: a.tercoHoje.dia, conjuntos: [...new Set([...(a.tercoHoje.conjuntos || []), ...(b.tercoHoje.conjuntos || [])])] };
  }
  return r;
}

function mesclarCofre(a = {}, b = {}) {
  const nota = a.nota && b.nota && a.nota !== b.nota ? `${b.nota}\n\n${a.nota}` : (b.nota || a.nota || '');
  return { marcados: { ...(b.marcados || {}), ...(a.marcados || {}) }, nota };
}

export async function sincronizar() {
  if (!io || sincronizando) return { estado: 'ocupado' };
  const u0 = await usuario();
  if (!u0) return { estado: 'sem-conta' };
  sincronizando = true;
  let mudou = false;
  try {
    const c = await cliente();
    const { u, p } = await perfilRemoto();
    const agora = new Date().toISOString();
    const ligado = io.get('sincronizadoEm', null);
    const locEm = io.get('modificadoEm', null) ? new Date(io.get('modificadoEm')).getTime() : 0;
    const local = lerDados();
    let final = local, enviar = false;

    if (!p || !p.atualizado_em || !Object.keys(p.dados || {}).length) enviar = Object.keys(local).length > 0 || !p;
    else if (!ligado) { final = mesclar(local, p.dados); gravarDados(final); enviar = true; mudou = true; }
    else {
      const remEm = new Date(p.atualizado_em).getTime();
      if (remEm > locEm) { final = p.dados; gravarDados(final); io.set('modificadoEm', p.atualizado_em); mudou = true; }
      else if (locEm > remEm) enviar = true;
    }
    if (enviar) {
      const { error } = await c.from('perfil').upsert({ user_id: u.id, dados: final, atualizado_em: agora }, { onConflict: 'user_id' });
      if (error) throw error;
      io.set('modificadoEm', agora);
    }

    // cofre (só se a chave estiver aberta neste aparelho)
    let cofre = 'fechado';
    if (p && p.cofre_salt) {
      if (await carregarChaveGuardada()) {
        cofre = 'aberto';
        const locCofre = { marcados: io.get('marcados', {}), nota: io.get('nota', '') };
        const locCofreEm = io.get('cofreModificadoEm', null) ? new Date(io.get('cofreModificadoEm')).getTime() : 0;
        const remCofreEm = p.cofre_em ? new Date(p.cofre_em).getTime() : 0;
        let remoto = null;
        if (p.cofre) { try { remoto = await decifrar(chaveCofre, p.cofre); } catch (e) { chaveCofre = null; throw new Error('A senha do cofre não confere mais. Abra o cofre de novo.'); } }
        let gravar = null;
        const cofreLigado = io.get('cofreLigado', false);
        if (remoto && !cofreLigado) { gravar = mesclarCofre(locCofre, remoto); io.setQuieto('marcados', gravar.marcados); io.setQuieto('nota', gravar.nota); mudou = true; }
        else if (remoto && remCofreEm > locCofreEm) { io.setQuieto('marcados', remoto.marcados || {}); io.setQuieto('nota', remoto.nota || ''); io.set('cofreModificadoEm', p.cofre_em); mudou = true; }
        else if (!remoto || locCofreEm > remCofreEm) gravar = locCofre;
        if (gravar) {
          const em = new Date().toISOString();
          const { error } = await c.from('perfil').update({ cofre: await cifrar(chaveCofre, gravar), cofre_em: em }).eq('user_id', u.id);
          if (error) throw error;
          io.set('cofreModificadoEm', em);
        }
        io.set('cofreLigado', true);
      }
    } else cofre = 'sem';

    io.set('sincronizadoEm', agora);
    ultimoSync = Date.now();
    if (mudou) aoAtualizar();
    return { estado: 'ok', cofre, quando: agora };
  } finally {
    sincronizando = false;
  }
}

// Chamado pelo app sempre que algo é gravado: marca e agenda o envio
export function aoMudar(chave) {
  if (!io || !temSessaoGuardada()) return;
  const agora = new Date().toISOString();
  if (DADOS_CHAVES.includes(chave)) io.set('modificadoEm', agora);
  else if (COFRE_CHAVES.includes(chave)) io.set('cofreModificadoEm', agora);
  else return;
  clearTimeout(timer);
  timer = setTimeout(() => { sincronizar().catch(() => {}); }, 4000);
}

export function ligarConta(ponte, quandoAtualizar) {
  io = ponte; aoAtualizar = quandoAtualizar || (() => {});
  if (temSessaoGuardada()) sincronizar().catch(() => {});
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && temSessaoGuardada() && Date.now() - ultimoSync > 60000) sincronizar().catch(() => {});
  });
}

export async function estado() {
  const u = await usuario().catch(() => null);
  if (!u) return { logado: false };
  let cofre = 'desconhecido';
  try {
    const { p } = await perfilRemoto();
    cofre = !p || !p.cofre_salt ? 'sem' : (await carregarChaveGuardada()) ? 'aberto' : 'fechado';
  } catch (e) {}
  let push = 'inativo';
  try {
    if (pushDisponivel()) {
      const reg = await navigator.serviceWorker.ready;
      push = (await reg.pushManager.getSubscription()) ? 'ativo' : (Notification.permission === 'denied' ? 'negado' : 'inativo');
    } else push = 'indisponivel';
  } catch (e) {}
  return { logado: true, email: u.email, cofre, push, sincronizadoEm: io && io.get('sincronizadoEm', null) };
}

// ---------- Notificações (Web Push) ----------
const urlB64ParaBytes = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const b = (s + p).replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(b), (c) => c.charCodeAt(0)); };

export async function ativarPush(hora) {
  if (!pushDisponivel()) throw new Error('Este aparelho ou navegador não aceita notificações. No iPhone, instale o app na tela de início primeiro.');
  const u = await usuario();
  if (!u) throw new Error('Entre na sua conta primeiro.');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Sem permissão para enviar avisos. Libere nas configurações do aparelho.');
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ParaBytes(CONFIG.vapidPublicKey) });
  const j = sub.toJSON();
  const c = await cliente();
  await sincronizar().catch(() => {});
  const { error } = await c.from('push_inscricoes').upsert({
    user_id: u.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth,
    hora_terco: hora || null, fuso: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
  }, { onConflict: 'endpoint' });
  if (error) throw error;
}

export async function atualizarHoraPush(hora) {
  try {
    if (!pushDisponivel()) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    const c = await cliente();
    await c.from('push_inscricoes').update({ hora_terco: hora || null }).eq('endpoint', sub.endpoint);
  } catch (e) {}
}

export async function desativarPush() {
  if (!pushDisponivel()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  try { const c = await cliente(); await c.from('push_inscricoes').delete().eq('endpoint', sub.endpoint); } catch (e) {}
  await sub.unsubscribe();
}
