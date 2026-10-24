// Calendário litúrgico: tempos, cores, festas móveis e precedência,
// segundo as Normas Universais do Ano Litúrgico e o próprio do Brasil.
import { FIXAS, MOVEIS } from './data/santos.js';
import { LEITURAS } from './data/leituras.js';

const MS = 86400000;
// Os dias são contados como números inteiros (dias desde 1970, em UTC) para evitar problemas de fuso e horário de verão.
export const num = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / MS);
export const data = (n) => { const t = new Date(n * MS); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), w: t.getUTCDay() }; };
export const hojeNum = () => { const t = new Date(); return num(t.getFullYear(), t.getMonth() + 1, t.getDate()); };
export const iso = (n) => { const x = data(n); return `${x.y}-${String(x.m).padStart(2, '0')}-${String(x.d).padStart(2, '0')}`; };
export const deIso = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? num(+m[1], +m[2], +m[3]) : null; };

const dow = (n) => data(n).w;
const domingoEmOuApos = (n) => n + ((7 - dow(n)) % 7);
const domingoEmOuAntes = (n) => n - dow(n);
const chave = (n) => { const x = data(n); return `${String(x.m).padStart(2, '0')}-${String(x.d).padStart(2, '0')}`; };

export const GRAUS = { S: 'Solenidade', F: 'Festa', M: 'Memória', m: 'Memória facultativa', c: 'Comemoração' };
export const CORES = { w: 'branco', r: 'vermelho', v: 'roxo', g: 'verde', p: 'rosa' };
const SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// Domingo de Páscoa (algoritmo gregoriano anônimo)
function pascoa(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return num(y, mes, dia);
}

const cacheAno = {};
function ano(y) {
  if (cacheAno[y]) return cacheAno[y];
  const E = pascoa(y);
  const epifania = domingoEmOuApos(num(y, 1, 2)); // no Brasil, domingo entre 2 e 8 de janeiro
  const batismo = data(epifania).d >= 7 ? epifania + 1 : epifania + 7;
  const natal = num(y, 12, 25);
  const advento = domingoEmOuApos(num(y, 11, 27));
  let sagradaFamilia = domingoEmOuApos(num(y, 12, 26));
  if (sagradaFamilia > num(y, 12, 31)) sagradaFamilia = num(y, 12, 30);
  const A = {
    E, epifania, batismo, natal, advento, sagradaFamilia,
    cinzas: E - 46, ramos: E - 7, quinta: E - 3, sexta: E - 2, sabado: E - 1,
    ascensao: E + 42, pentecostes: E + 49, maeIgreja: E + 50, sacerdote: E + 53,
    trindade: E + 56, corpus: E + 60, sagradoCoracao: E + 68, imaculadoCoracao: E + 69,
    cristoRei: advento - 7,
  };
  // Celebrações móveis por dia
  A.moveis = {
    [epifania]: 'epifania', [batismo]: 'batismo', [sagradaFamilia]: 'sagradaFamilia',
    [A.cinzas]: 'cinzas', [A.ramos]: 'ramos', [A.quinta]: 'quintaSanta', [A.sexta]: 'sextaSanta', [A.sabado]: 'sabadoSanto',
    [E]: 'pascoa', [E + 7]: 'misericordia', [A.ascensao]: 'ascensao', [A.pentecostes]: 'pentecostes',
    [A.maeIgreja]: 'maeIgreja', [A.sacerdote]: 'sacerdote', [A.trindade]: 'trindade', [A.corpus]: 'corpusChristi',
    [A.sagradoCoracao]: 'sagradoCoracao', [A.imaculadoCoracao]: 'imaculadoCoracao', [A.cristoRei]: 'cristoRei',
  };
  for (let k = 1; k <= 6; k++) A.moveis[E + k] = 'oitavaPascoa';
  A.transferidas = transferencias(y, A);
  cacheAno[y] = A;
  return A;
}

// Solenidades fixas que mudam de dia quando caem num dia que tem precedência.
function transferencias(y, A) {
  const t = {}; // dia de origem -> dia em que é celebrada
  const mover = (k, de, para) => { if (para !== de) t[k] = para; };

  const sj = num(y, 3, 19);
  if (sj >= A.ramos && sj <= A.E + 7) mover('03-19', sj, A.ramos - 1);
  else if (dow(sj) === 0) mover('03-19', sj, sj + 1);

  const an = num(y, 3, 25);
  if (an >= A.ramos && an <= A.E + 7) mover('03-25', an, A.E + 8);
  else if (dow(an) === 0) mover('03-25', an, an + 1);

  const ic = num(y, 12, 8);
  if (dow(ic) === 0) mover('12-08', ic, ic + 1);

  const jb = num(y, 6, 24);
  if (jb === A.corpus || jb === A.sagradoCoracao) mover('06-24', jb, jb - 1);

  // No Brasil, Pedro e Paulo, Assunção e Todos os Santos passam para o domingo seguinte,
  // a não ser que esse domingo já tenha outra solenidade.
  ['06-29', '08-15', '11-01'].forEach((k) => {
    const [m, d] = k.split('-').map(Number);
    const de = num(y, m, d);
    const dom = domingoEmOuApos(de);
    const ocupado = (FIXAS[chave(dom)] || []).some((c) => c.g === 'S') || (A.moveis[dom] && MOVEIS[A.moveis[dom]].g === 'S');
    if (!ocupado) mover(k, de, dom);
  });
  return t;
}

// Tempo litúrgico, nome do dia e cor do tempo
function tempo(n) {
  const x = data(n);
  const A = ano(x.y);
  const w = x.w;
  const dom = w === 0;
  const ord = (k, f) => `${k}${f ? 'ª' : 'º'}`;

  if (n >= A.advento && n < A.natal) {
    const k = Math.floor((n - A.advento) / 7) + 1;
    return {
      fase: 'adv', k,
      tempo: 'Advento', cor: dom && k === 3 ? 'p' : 'v',
      titulo: dom ? `${ord(k)} Domingo do Advento` : `${SEMANA[w]} da ${ord(k, 1)} semana do Advento`,
      prec: dom ? 1 : x.d >= 17 ? 9 : 13,
    };
  }
  if (n >= A.natal || n <= A.batismo) {
    const oitava = (x.m === 12 && x.d >= 25) || (x.m === 1 && x.d === 1);
    return {
      fase: 'nat',
      tempo: 'Tempo do Natal', cor: 'w',
      titulo: oitava ? 'Oitava do Natal' : dom ? 'Domingo do Tempo do Natal' : `${SEMANA[w]} do Tempo do Natal`,
      prec: dom ? 6 : oitava ? 9 : 13,
    };
  }
  if (n < A.cinzas) {
    const ref = dow(A.batismo) === 0 ? A.batismo : A.epifania;
    const k = Math.floor((n - ref) / 7) + 1;
    return {
      fase: 'tc', k,
      tempo: 'Tempo Comum', cor: 'g',
      titulo: dom ? `${ord(k)} Domingo do Tempo Comum` : `${SEMANA[w]} da ${ord(k, 1)} semana do Tempo Comum`,
      prec: dom ? 6 : 13,
    };
  }
  if (n < A.quinta) {
    const k = Math.floor((n - (A.cinzas + 4)) / 7) + 1;
    let titulo;
    if (n === A.cinzas) titulo = 'Quarta-feira de Cinzas';
    else if (n < A.cinzas + 4) titulo = `${SEMANA[w]} depois das Cinzas`;
    else if (n === A.ramos) titulo = 'Domingo de Ramos';
    else if (n > A.ramos) titulo = `${SEMANA[w]} Santa`;
    else titulo = dom ? `${ord(k)} Domingo da Quaresma` : `${SEMANA[w]} da ${ord(k, 1)} semana da Quaresma`;
    return { fase: n > A.ramos ? 'santa' : 'qua', k, tempo: 'Quaresma', cor: dom && k === 4 ? 'p' : 'v', titulo, prec: dom || n === A.cinzas || n > A.ramos ? 1 : 9 };
  }
  if (n < A.E) return { fase: 'tri', tempo: 'Tríduo Pascal', cor: n === A.quinta ? 'w' : n === A.sexta ? 'r' : 'v', titulo: w === 6 ? 'Sábado Santo' : `${SEMANA[w]} Santa`, prec: 1 };
  if (n <= A.pentecostes) {
    const k = Math.floor((n - A.E) / 7) + 1;
    const oitava = n <= A.E + 7;
    return {
      fase: 'pas', k,
      tempo: 'Tempo Pascal', cor: n === A.pentecostes ? 'r' : 'w',
      titulo: n === A.E ? 'Domingo da Páscoa' : n === A.pentecostes ? 'Domingo de Pentecostes' : oitava && !dom ? `${SEMANA[w]} da Oitava da Páscoa` : dom ? `${ord(k)} Domingo da Páscoa` : `${SEMANA[w]} da ${ord(k, 1)} semana da Páscoa`,
      prec: dom || oitava ? 1 : 13,
    };
  }
  const k = 34 - Math.round((A.cristoRei - domingoEmOuAntes(n)) / 7);
  return {
    fase: 'tc', k,
    tempo: 'Tempo Comum', cor: 'g',
    titulo: dom ? `${ord(k)} Domingo do Tempo Comum` : `${SEMANA[w]} da ${ord(k, 1)} semana do Tempo Comum`,
    prec: dom ? 6 : 13,
  };
}

const FESTAS_DO_SENHOR = ['02-02', '08-06', '09-14', '11-09'];

function precedencia(c) {
  if (c.privilegiado) return 1;
  if (c.g === 'S') return 3;
  if (c.g === 'F') return c.senhor ? 5 : 7;
  if (c.g === 'M') return 10;
  return 12;
}

// Tudo o que a Igreja celebra num dia.
export function dia(n) {
  const x = data(n);
  const A = ano(x.y);
  const T = tempo(n);
  const ciclo = n >= A.advento ? x.y + 1 : x.y;
  const cands = [];
  const lembrados = [];

  if (A.moveis[n]) {
    const c = { ...MOVEIS[A.moveis[n]], senhor: true, mk: A.moveis[n] };
    if (A.moveis[n] === 'oitavaPascoa') c.n = T.titulo;
    cands.push(c);
  }

  const k = chave(n);
  (FIXAS[k] || []).forEach((c) => {
    const para = A.transferidas[k];
    if (para !== undefined) {
      const dd = data(para);
      lembrados.push({ ...c, nota: `Neste ano, celebrada no ${dow(para) === 0 ? 'domingo' : 'dia'} ${dd.d}/${String(dd.m).padStart(2, '0')}${c.domingo ? ', como é costume no Brasil' : ''}.` });
    } else cands.push({ ...c, senhor: FESTAS_DO_SENHOR.includes(k), fk: k });
  });
  Object.entries(A.transferidas).forEach(([kk, para]) => {
    if (para === n) FIXAS[kk].forEach((c) => cands.push({ ...c, fk: kk, nota: `Transferida de ${kk.split('-').reverse().join('/')}.` }));
  });

  // Duas memórias obrigatórias no mesmo dia: ambas ficam facultativas.
  if (cands.filter((c) => c.g === 'M').length > 1) cands.forEach((c) => { if (c.g === 'M') c.g = 'm'; });

  cands.forEach((c) => (c.prec = precedencia(c)));
  cands.sort((a, b) => a.prec - b.prec);

  let principal = null;
  const outros = [];
  cands.forEach((c) => {
    if (!principal && c.prec <= 10 && (c.privilegiado || c.prec < T.prec)) principal = c;
    else if (c.prec >= 10 && T.prec === 9 && !principal) outros.push({ ...c, g: 'c' }); // Quaresma, 17-24/12, oitava do Natal
    else outros.push({ ...c, impedida: c.prec >= T.prec || !!principal });
  });

  // Nos dias de semana sem celebração própria, as memórias facultativas aparecem como opção do dia.
  const opcoes = !principal ? outros.filter((c) => c.g === 'm' && !c.impedida) : [];
  const forte = principal && 'SFM'.includes(principal.g);

  return {
    n, ...x, ...T,
    cor: forte ? principal.c : T.cor,
    ano: ['C', 'A', 'B'][ciclo % 3],
    anoPar: ciclo % 2 === 0,
    principal,
    destaque: principal || opcoes[0] || outros.find((c) => c.g === 'c') || null,
    outros: [...outros, ...lembrados],
  };
}

// ---------- Leituras da Missa ----------
// Devolve { l1, salmo, refrao, l2, ev, nota } com as referências do dia, ou null quando não há dados.
const NOTAS = {
  natal: 'Missa do dia. Há também as missas da vigília, da noite e da aurora.',
  pascoa: 'Missa do dia. Na Vigília Pascal, na noite de sábado, as leituras são outras.',
  vigilia: 'Vigília Pascal: até sete leituras do Antigo Testamento (aqui, a primeira), a epístola e o Evangelho.',
  'f11-02': 'Primeira opção de cada leitura. O Lecionário traz outras.',
};

export function leiturasDo(n) {
  const D = dia(n);
  const A = ano(D.y);
  const T = tempo(n);
  const c = D.ano;
  const sem = D.anoPar ? 'II' : 'I';
  const L = (k) => (LEITURAS[k] ? { k, v: LEITURAS[k] } : null);
  const p = D.principal;
  let r = null;

  if (p && 'SF'.includes(p.g)) {
    if (p.mk === 'sacerdote') return { semDados: true, nota: 'As leituras desta festa estão no próprio do Brasil, no Lecionário.' };
    if (p.mk === 'oitavaPascoa') r = L(`oit${D.w}`);
    else if (p.mk === 'misericordia') r = L(`pas2${c}`);
    else if (p.mk === 'sabadoSanto') r = { ...L(`vigilia${c}`), k: 'vigilia' };
    else if (p.mk) r = L(p.mk + c) || L(p.mk);
    else if (p.fk === '12-25') r = L('natal');
    else if (p.fk === '01-01') r = L('maeDeDeus');
    else if (p.fk) r = L(`f${p.fk}${c}`) || L(`f${p.fk}`);
  }

  if (!r) {
    const w = D.w;
    if (T.fase === 'adv') r = w === 0 ? L(`adv${T.k}${c}`) : D.m === 12 && D.d >= 17 ? L(`dez${D.d}`) : L(`adv${T.k}-${w}`);
    else if (T.fase === 'nat') r = D.m === 12 ? L(`dez${D.d}`) : n < A.epifania ? L(`jan${D.d}`) : L(`posEpi${w}`);
    else if (T.fase === 'tc') r = w === 0 ? L(`tc${T.k}${c}`) : L(`tc${T.k}-${w}${sem}`);
    else if (T.fase === 'qua') r = w === 0 ? L(`qua${T.k}${c}`) : T.k === 0 ? L(`cinzas${w}`) : L(`qua${T.k}-${w}`);
    else if (T.fase === 'santa') r = L(`santa${w}`);
    else if (T.fase === 'pas') r = w === 0 ? L(`pas${T.k}${c}`) : L(`pas${T.k}-${w}`);
  }
  if (!r || !r.v) return null;
  const [l1, salmo, refrao, l2, ev] = r.v;
  const santo = p || D.destaque;
  const memoria = santo && 'Mmc'.includes(santo.g);
  return {
    l1, salmo, refrao, l2, ev,
    nota: NOTAS[r.k] || NOTAS[p && p.fk ? `f${p.fk}` : ''] || (memoria ? 'Nas memórias, a Missa costuma usar as leituras do dia de semana.' : ''),
  };
}
