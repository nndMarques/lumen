import { EXAMES, ESTADOS, PASSOS, CONTRICAO } from './data/exames.js';
import { ORACOES, MISTERIOS, POR_DIA, INTENCOES_INICIAIS, LINGUAS, PARTES } from './data/terco.js';
import { rosarioSVG, ordem, oracoesDa, ORD } from './rosario.js';
import { dia, data, hojeNum, iso, deIso, GRAUS, CORES, leiturasDo } from './liturgia.js';

// ---------- Armazenamento local (nada sai do aparelho) ----------
const temaAtual = () => { try { return localStorage.getItem('lumen.theme') || 'auto'; } catch (e) { return 'auto'; } };

const store = {
  get(k, d) {
    try { const v = localStorage.getItem('lumen.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
  },
  set(k, v) {
    try { localStorage.setItem('lumen.' + k, JSON.stringify(v)); } catch (e) {}
  },
  del(k) {
    try { localStorage.removeItem('lumen.' + k); } catch (e) {}
  },
};

const $view = document.getElementById('view');
const $tabbar = document.querySelector('.tabbar');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const vibrar = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

const ICON_ARROW = '<svg class="arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ICON_BACK = '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const ICON_FWD = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ICON_TICK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// ---------- Utilidades de tela ----------
let delayIdx = 0;
const r = () => `class="rise" data-i="${delayIdx++}"`;
const rc = (extra) => `class="rise ${extra}" data-i="${delayIdx++}"`;

function render(html) {
  $view.innerHTML = typeof html === 'function' ? html() : html;
  $view.querySelectorAll('[data-i]').forEach((el) => el.style.setProperty('--i', el.dataset.i));
  window.scrollTo(0, 0);
}

// Trava a rolagem da página por trás de um painel aberto (só no celular).
let rolagemTravada = null;
function travarRolagem() {
  if (rolagemTravada !== null || window.matchMedia('(min-width: 900px)').matches) return;
  rolagemTravada = window.scrollY;
  Object.assign(document.body.style, { position: 'fixed', top: `-${rolagemTravada}px`, left: '0', right: '0' });
}
function liberarRolagem() {
  if (rolagemTravada === null) return;
  const y = rolagemTravada;
  rolagemTravada = null;
  Object.assign(document.body.style, { position: '', top: '', left: '', right: '' });
  window.scrollTo(0, y);
}

let toastTimer;
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function diasDesde(iso) {
  if (!iso) return null;
  const a = new Date(iso); a.setHours(0, 0, 0, 0);
  const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

function hojeKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ---------- Estado do exame ----------
const marcados = () => store.get('marcados', {});
const totalMarcados = () => Object.keys(marcados()).length;

// ---------- Telas ----------
function telaInicio() {
  delayIdx = 0;
  const d = new Date();
  const conj = POR_DIA[d.getDay()];
  const M = MISTERIOS[conj];
  const dias = diasDesde(store.get('ultimaConfissao', null));
  const n = totalMarcados();
  const L = dia(hojeNum());
  const santo = L.destaque;
  const ofen = ofensiva(diario());
  const lh = leiturasDo(hojeNum());
  const ev = lh && lh.ev;

  let conf;
  if (dias === null) {
    conf = `<p class="lead">Quando foi a sua última confissão? Marque no fim do exame e o Lumen te lembra.</p>`;
  } else {
    conf = `<div class="counter"><span class="big">${dias}</span><span class="lbl">${dias === 1 ? 'dia' : 'dias'} desde a última confissão</span></div>`;
  }

  render(`
    <p ${r()}><span class="eyebrow">Lumen <span class="dot">·</span> hoje</span></p>
    <div ${rc('hero-date')}>
      <span class="day">${d.getDate()}</span>
      <span class="meta"><span class="wd">${DIAS[d.getDay()]}</span><span class="mo">${MESES[d.getMonth()]} ${d.getFullYear()}</span></span>
    </div>
    <p ${rc('lit-line')}><span class="lc lc-${L.cor}"></span>${L.titulo}</p>
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Confissão</span></p>
    <div ${r()}>${conf}</div>
    <ul ${rc('rows')} style="margin-top:18px">
      <li><a class="row" href="#/exame"><span class="body"><span class="title">Fazer o exame de consciência</span><span class="sub">Quatro exames, por estado de vida</span></span>${ICON_ARROW}</a></li>
      ${n ? `<li><a class="row" href="#/lista"><span class="body"><span class="title">Minha lista</span><span class="sub">${n} ${n === 1 ? 'item marcado' : 'itens marcados'}, só no seu aparelho</span></span>${ICON_ARROW}</a></li>` : ''}
    </ul>
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Terço de hoje</span></p>
    <h2 ${r()}>${M.pt.replace('Mistérios ', 'Mistérios <em>')}</em></h2>
    <ol ${rc('mystery-list')}>${M.itens.map((it) => `<li>${it.pt}</li>`).join('')}</ol>
    <div ${r()} style="margin-top:18px"><a class="btn solid block" href="#/terco/rezar/${conj}">Rezar agora</a></div>
    ${rezadosHoje().length ? `<p ${rc('feito-hoje')}>${ICON_TICK} Você já rezou o terço hoje${ofen.seq > 1 ? ` · ofensiva de ${ofen.seq} dias` : ''}.</p>`
      : ofen.risco ? `<p ${rc('feito-hoje risco')}>Ofensiva de ${ofen.seq} ${ofen.seq === 1 ? 'dia' : 'dias'} · reze hoje para mantê-la.</p>` : ''}
    <hr ${rc('rule')}>
    ${santo ? `
      <p ${r()}><span class="eyebrow">Hoje a Igreja celebra <span class="dot">·</span> ${GRAUS[santo.g]}</span></p>
      <h2 ${r()}>${santo.n}</h2>
      <p ${rc('muted')} style="margin-top:10px">${santo.b}</p>` : `
      <p ${r()}><span class="eyebrow">Santos e festas</span></p>`}
    <ul ${rc('rows')} style="margin-top:14px">
      ${ev ? `<li><a class="row" href="#/santos/${iso(hojeNum())}"><span class="body"><span class="title">Evangelho · ${ev}</span><span class="sub">Ver as leituras da Missa de hoje</span></span>${ICON_ARROW}</a></li>` : ''}
      <li><a class="row" href="#/santos"><span class="body"><span class="title">Calendário dos santos</span><span class="sub">Os santos e as festas de cada dia do ano</span></span>${ICON_ARROW}</a></li>
    </ul>
  `);
}

function telaExames() {
  delayIdx = 0;
  const n = totalMarcados();
  render(`
    <p ${r()}><span class="eyebrow">Confissão</span></p>
    <h1 ${r()}>Exame de <em>consciência</em></h1>
    <p ${rc('lead')}>Escolha um exame, marque o que reconhece, e leve a lista para a confissão.</p>
    <p ${rc('muted small')} style="margin-top:12px">Tudo o que você marca fica apenas neste aparelho. Não há conta, servidor nem envio de dados.</p>
    <hr ${rc('rule')}>
    <ul ${rc('rows')}>
      ${EXAMES.map((e, i) => `
        <li><a class="row" href="#/exame/${e.id}">
          <span class="num">${i + 1}</span>
          <span class="body"><span class="title">${e.titulo}</span><span class="sub">${e.sub} · ${e.tempo}</span></span>
          ${ICON_ARROW}
        </a></li>`).join('')}
    </ul>
    <ul ${rc('rows')} style="margin-top:28px">
      <li><a class="row" href="#/lista"><span class="body"><span class="title">Minha lista</span><span class="sub">${n ? `${n} ${n === 1 ? 'item marcado' : 'itens marcados'}` : 'Vazia por enquanto'}</span></span>${ICON_ARROW}</a></li>
      <li><a class="row" href="#/como"><span class="body"><span class="title">Como se confessar</span><span class="sub">O passo a passo e o ato de contrição</span></span>${ICON_ARROW}</a></li>
    </ul>
    <p ${rc('muted small')} style="margin-top:28px">Exames de outras tradições e escolas de espiritualidade virão em breve.</p>
  `);
}

function telaExame(id) {
  delayIdx = 0;
  const ex = EXAMES.find((e) => e.id === id);
  if (!ex) return telaExames();
  const estados = store.get('estados', []);
  const m = marcados();

  const visivel = (q) => !ex.filtra || !q.para || q.para.some((p) => estados.includes(p));

  const secoes = ex.secoes.map((s, si) => {
    const qs = s.q.map((q, qi) => ({ ...q, key: `${ex.id}:${si}:${qi}` })).filter(visivel);
    if (!qs.length) return '';
    return `
      <div ${rc('section-head')}><h3>${s.titulo}</h3><span class="count" data-count="${si}"></span></div>
      ${s.nota ? `<p ${rc('section-note')}>${s.nota}</p>` : ''}
      <div ${r()} data-sec="${si}">
        ${qs.map((q) => `
          <label class="q">
            <input type="checkbox" data-key="${q.key}" data-grupo="${esc(s.titulo)}" ${m[q.key] ? 'checked' : ''}>
            <span class="box">${ICON_TICK}</span>
            <span class="text">${q.t}</span>
          </label>`).join('')}
      </div>`;
  }).join('');

  render(`
    <a class="back rise" style="--i:0" href="#/exame">${ICON_BACK} Exames</a>
    ${(delayIdx = 1, '')}
    <p ${r()}><span class="eyebrow">Exame · ${ex.tempo}</span></p>
    <h1 ${r()}>${ex.titulo}</h1>
    <p ${rc('lead')}>${ex.sub}.</p>
    ${ex.filtra ? `
      <div ${r()} style="margin-top:22px">
        <p class="eyebrow">Mostrar perguntas para</p>
        <div class="choices">
          ${ESTADOS.map((e) => `<button class="choice" data-estado="${e.id}" aria-pressed="${estados.includes(e.id)}">${e.label}</button>`).join('')}
        </div>
      </div>` : ''}
    <p ${rc('muted small')} style="margin-top:18px">Peça luz ao Espírito Santo antes de começar. Responda com calma e sinceridade.</p>
    ${secoes}
    <div class="sticky-cta"><div class="inner"><a class="btn solid block" href="#/lista"><span class="tally"></span></a></div></div>
  `);

  const atualizar = () => {
    const n = totalMarcados();
    const bar = $view.querySelector('.sticky-cta');
    bar.classList.toggle('show', n > 0);
    bar.querySelector('.tally').textContent = `Ver minha lista · ${n}`;
    $view.querySelectorAll('[data-sec]').forEach((el) => {
      const c = el.querySelectorAll('input:checked').length;
      const out = $view.querySelector(`[data-count="${el.dataset.sec}"]`);
      if (out) out.textContent = c ? `${c} marcado${c > 1 ? 's' : ''}` : '';
    });
  };
  atualizar();

  $view.querySelectorAll('input[data-key]').forEach((inp) => inp.addEventListener('change', () => {
    const mm = marcados();
    if (inp.checked) {
      mm[inp.dataset.key] = { t: inp.closest('.q').querySelector('.text').textContent, g: inp.dataset.grupo, ex: ex.titulo };
      vibrar(8);
    } else delete mm[inp.dataset.key];
    store.set('marcados', mm);
    atualizar();
  }));

  $view.querySelectorAll('[data-estado]').forEach((b) => b.addEventListener('click', () => {
    const atual = store.get('estados', []);
    const id = b.dataset.estado;
    store.set('estados', atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]);
    const y = window.scrollY;
    telaExame(ex.id);
    window.scrollTo(0, y);
  }));
}

function telaLista() {
  delayIdx = 0;
  const m = marcados();
  const itens = Object.entries(m);
  const nota = store.get('nota', '');

  render(`
    <a class="back rise" style="--i:0" href="#/exame">${ICON_BACK} Exames</a>
    ${(delayIdx = 1, '')}
    <p ${r()}><span class="eyebrow">Só neste aparelho</span></p>
    <h1 ${r()}>Minha <em>lista</em></h1>
    <div id="lista-wrap">
      ${itens.length ? `
        <p ${rc('lead')}>Leve isto para a confissão. Nos pecados graves, lembre-se de dizer quantas vezes, mais ou menos.</p>
        <ol ${rc('sin-list')} style="margin-top:24px">
          ${itens.map(([k, v]) => `<li data-key="${k}"><span>${esc(v.t)}<span class="grp">${esc(v.g)}</span></span><button class="rm" aria-label="Remover">×</button></li>`).join('')}
        </ol>` : `
        <p ${rc('lead')}>Sua lista está vazia. Faça um dos exames e marque o que reconhecer.</p>
        <div ${r()} style="margin-top:20px"><a class="btn block" href="#/exame">Escolher um exame</a></div>`}
      <div ${r()} style="margin-top:28px">
        <p class="eyebrow">Anotações</p>
        <textarea class="note-area" id="nota" placeholder="Algo que você quer lembrar de dizer, ou de perguntar ao padre…">${esc(nota)}</textarea>
      </div>
      <hr ${rc('rule')}>
      <p ${r()}><span class="eyebrow">Ato de contrição</span></p>
      <div ${r()} class="choices" role="group" aria-label="Ato de contrição" style="margin-bottom:6px">
        <button class="choice" data-contricao="breve" aria-pressed="true">Breve</button>
        <button class="choice" data-contricao="completo" aria-pressed="false">Completo</button>
      </div>
      <p ${rc('formula')} id="contricao">${CONTRICAO.breve}</p>
      <hr ${rc('rule')}>
      <p ${rc('muted small')}>Depois de se confessar, toque abaixo. A lista é apagada para sempre: “Eu, das suas iniquidades, não me lembrarei mais” (Hb 8,12).</p>
      <div ${r()} style="margin-top:14px"><button class="btn solid block" id="confessei">Confessei</button></div>
    </div>
  `);

  $view.querySelector('#nota').addEventListener('input', (e) => store.set('nota', e.target.value));

  $view.querySelectorAll('[data-contricao]').forEach((b) => b.addEventListener('click', () => {
    $view.querySelectorAll('[data-contricao]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    const $c = $view.querySelector('#contricao');
    $c.innerHTML = CONTRICAO[b.dataset.contricao];
    $c.classList.remove('swap'); void $c.offsetWidth; $c.classList.add('swap');
  }));

  $view.querySelectorAll('.rm').forEach((b) => b.addEventListener('click', () => {
    const li = b.closest('li');
    const mm = marcados(); delete mm[li.dataset.key]; store.set('marcados', mm);
    li.classList.add('burn');
    setTimeout(() => { li.remove(); if (!totalMarcados()) telaLista(); }, 600);
  }));

  $view.querySelector('#confessei').addEventListener('click', () => {
    const wrap = $view.querySelector('#lista-wrap');
    wrap.classList.add('burn');
    vibrar([20, 60, 20]);
    store.del('marcados');
    store.del('nota');
    store.set('ultimaConfissao', new Date().toISOString());
    setTimeout(() => {
      wrap.classList.remove('burn');
      wrap.innerHTML = `
        <div class="absolvo">
          <svg class="cross" viewBox="0 0 54 80"><path d="M27 2v76M6 24h42"/></svg>
          <h2 class="rise" style="--i:3;margin-top:22px">Vai em <em>paz</em>.</h2>
          <p class="lead rise" style="--i:4">Sua lista foi apagada. Agora, cumpra a penitência e dê graças a Deus.</p>
          <div class="rise" style="--i:5;margin-top:26px"><a class="btn block" href="#/">Voltar ao início</a></div>
        </div>`;
    }, 850);
  });
}

function telaComo() {
  delayIdx = 0;
  render(`
    <a class="back rise" style="--i:0" href="#/exame">${ICON_BACK} Exames</a>
    ${(delayIdx = 1, '')}
    <p ${r()}><span class="eyebrow">Sacramento da Penitência</span></p>
    <h1 ${r()}>Como se <em>confessar</em></h1>
    <ol ${rc('steps')} style="margin-top:24px">
      ${PASSOS.map((p, i) => `<li><span class="n">${i + 1}</span><span class="t">${p.t}</span><span class="d">${p.d}${p.f ? `<span class="formula" style="display:block">${p.f}</span>` : ''}</span></li>`).join('')}
    </ol>
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Ato de contrição · breve</span></p>
    <p ${rc('formula')}>${CONTRICAO.breve}</p>
    <p ${r()} style="margin-top:24px"><span class="eyebrow">Ato de contrição · completo</span></p>
    <p ${rc('formula')}>${CONTRICAO.completo}</p>
    <p ${r()} style="margin-top:24px"><span class="eyebrow">Actus contritionis · latim</span></p>
    <p ${rc('formula')}>${CONTRICAO.latim}</p>
  `);
}

// ---------- Terço ----------
// Línguas da oração: a principal e a secundária são escolhidas em Ajustes; no terço, alterna-se entre as duas.
function linguas() {
  const l1 = store.get('lingua1', 'pt');
  let l2 = store.get('lingua2', 'la');
  if (l2 === l1) l2 = l1 === 'la' ? 'pt' : 'la';
  return [l1, l2];
}
function lingua() {
  const [l1, l2] = linguas();
  const l = store.get('lingua', l1);
  return l === l1 || l === l2 ? l : l1;
}

function langToggle() {
  const l = lingua();
  return `<div class="lang-toggle" role="group" aria-label="Língua da oração">
    ${linguas().map((x) => `<button data-lang="${x}" aria-pressed="${l === x}">${LINGUAS[x].curto}</button>`).join('')}
  </div>`;
}
function ligarToggle(onChange) {
  $view.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    store.set('lingua', b.dataset.lang);
    $view.querySelectorAll('[data-lang]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    onChange();
  }));
}

// ---------- Constância no terço ----------
// Marcos de terços rezados. Cada um lembra algo da fé.
const MARCOS = [
  { n: 1, t: 'O primeiro terço' },
  { n: 7, t: 'Uma semana de terços' },
  { n: 20, t: 'Os vinte mistérios' },
  { n: 33, t: 'Os anos de Cristo' },
  { n: 54, t: 'Como a novena de 54 dias' },
  { n: 100, t: 'Cem terços' },
  { n: 150, t: 'O saltério de Maria' },
  { n: 365, t: 'Um ano de terço' },
];

const chaveDia = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Quantos terços foram rezados em cada dia: { 'aaaa-m-d': n }
function diario() {
  let d = store.get('tercoDiario', null);
  if (!d) {
    d = {};
    const hoje = rezadosHoje();
    if (hoje.length) d[hojeKey()] = hoje.length;
  }
  return d;
}

// O rosário completo (os quatro conjuntos de mistérios) vale quatro terços.
const ORDEM_ROSARIO = ['gozosos', 'luminosos', 'dolorosos', 'gloriosos'];
const valeTercos = (conjunto) => (conjunto === 'rosario' ? 4 : 1);

// Conta o terço (ou rosário) rezado e guarda quais mistérios foram rezados hoje.
function registrarTerco(conjunto) {
  const feitos = store.get('tercosRezados', 0) + valeTercos(conjunto);
  store.set('tercosRezados', feitos);
  const d = diario();
  d[hojeKey()] = (d[hojeKey()] || 0) + valeTercos(conjunto);
  store.set('tercoDiario', d);
  store.set('tercoHoje', { dia: hojeKey(), conjuntos: [...rezadosHoje(), conjunto] });
  store.set('ofensivaRecorde', ofensiva(d).recorde);
  return feitos;
}

// Desfaz uma marcação feita por engano hoje.
function desmarcarTerco(conjunto) {
  const h = rezadosHoje();
  const i = h.indexOf(conjunto);
  if (i < 0) return store.get('tercosRezados', 0);
  h.splice(i, 1);
  store.set('tercoHoje', { dia: hojeKey(), conjuntos: h });
  const feitos = Math.max(0, store.get('tercosRezados', 0) - valeTercos(conjunto));
  store.set('tercosRezados', feitos);
  const d = diario();
  d[hojeKey()] = (d[hojeKey()] || 0) - valeTercos(conjunto);
  if (d[hojeKey()] <= 0) delete d[hojeKey()];
  store.set('tercoDiario', d);
  return feitos;
}

function rezadosHoje() {
  const h = store.get('tercoHoje', null);
  return h && h.dia === hojeKey() ? h.conjuntos : [];
}

// ---------- Ofensiva: dias seguidos rezando ----------
const METAS_OFENSIVA = [3, 7, 14, 30, 60, 100, 200, 365];

const diaDaChave = (k) => { const [y, m, d] = k.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };

// seq: dias seguidos até hoje (se ainda não rezou hoje, vale a sequência até ontem);
// risco: há sequência, mas hoje ainda não foi rezado; recorde: a maior sequência já feita.
function ofensiva(d) {
  const hoje = new Date();
  const feitoHoje = !!d[chaveDia(hoje)];
  const dia = new Date(hoje);
  if (!feitoHoje) dia.setDate(dia.getDate() - 1);
  let seq = 0;
  while (d[chaveDia(dia)]) { seq++; dia.setDate(dia.getDate() - 1); }
  const dias = Object.keys(d).filter((k) => d[k] > 0).map(diaDaChave).sort((x, y) => x - y);
  let recorde = 0, corrida = 0;
  dias.forEach((n, i) => { corrida = i && n === dias[i - 1] + 1 ? corrida + 1 : 1; recorde = Math.max(recorde, corrida); });
  recorde = Math.max(recorde, store.get('ofensivaRecorde', 0), seq);
  return { seq, feitoHoje, risco: seq > 0 && !feitoHoje, recorde };
}

// O terço da ofensiva: uma dezena de contas pequenas e uma grande. Cada dia seguido acende uma conta;
// ao completar dez, acende a conta grande e a cruz brilha.
function ofensivaSVG(of, animar = true) {
  const { seq, feitoHoje, risco } = of;
  const completa = seq > 0 && seq % 10 === 0;
  const acesas = completa ? 10 : seq % 10;
  const X = (i) => 58 + i * 23;
  let contas = '';
  for (let i = 0; i < 10; i++) {
    const acesa = i < acesas;
    const hoje = acesa && feitoHoje && i === acesas - 1;
    const emRisco = risco && !completa && i === acesas;
    contas += `<circle class="b${acesa ? ' lit' : ''}${hoje ? ' pop' : ''}${emRisco ? ' risco' : ''}" style="--k:${i}" cx="${X(i)}" cy="32" r="6"/>`;
  }
  const grande = `<circle class="b grande${completa ? ' lit' : ''}${completa && feitoHoje ? ' pop' : ''}" style="--k:10" cx="296" cy="32" r="10.5"/>`;
  return `<svg class="of-svg${animar ? ' anima' : ''}" viewBox="0 0 320 64" role="img" aria-label="Terço da ofensiva: ${acesas} de 10 contas acesas${completa ? ', dezena completa' : ''}">
    <path class="fio" d="M26 32H306"/>
    <g class="cruz${completa ? ' brilha' : ''}"><path d="M14 12v40M5 24h18"/></g>
    ${contas}${grande}
  </svg>`;
}

function ofensivaHTML(of) {
  const meta = METAS_OFENSIVA.find((m) => m > of.seq);
  const dezena = Math.floor(Math.max(of.seq - 1, 0) / 10) + 1;
  let estado;
  if (of.seq === 0) estado = of.recorde > 0 ? `Comece uma nova ofensiva hoje. Seu recorde é de ${of.recorde} ${of.recorde === 1 ? 'dia' : 'dias'}.` : 'Reze o terço hoje para acender a primeira conta.';
  else if (of.risco) estado = 'Reze hoje para manter a sua ofensiva.';
  else estado = 'Ofensiva mantida hoje. Que Nossa Senhora te acompanhe.';
  return `
    <div class="ofensiva${of.risco ? ' em-risco' : ''}">
      <div class="of-top">
        <span class="of-n" data-seq>${of.seq}</span>
        <span class="of-l">${of.seq === 1 ? 'dia seguido' : 'dias seguidos'}<small>ofensiva do terço</small></span>
        ${of.recorde > 0 ? `<span class="of-rec">recorde<b>${of.recorde}</b></span>` : ''}
      </div>
      ${ofensivaSVG(of)}
      <p class="of-estado">${estado}</p>
      ${meta ? `<p class="muted small">${of.seq > 0 ? `${dezena}ª dezena · ` : ''}próxima meta: ${meta} dias${of.seq > 0 ? ` (faltam ${meta - of.seq})` : ''}</p>` : ''}
    </div>`;
}

function constanciaHTML() {
  const total = store.get('tercosRezados', 0);
  const d = diario();
  const of = ofensiva(d);
  const prox = MARCOS.find((m) => m.n > total);
  const ant = [...MARCOS].reverse().find((m) => m.n <= total);
  const semana = [];
  for (let k = 6; k >= 0; k--) {
    const dia = new Date();
    dia.setDate(dia.getDate() - k);
    semana.push({ w: dia.getDay(), feito: !!d[chaveDia(dia)], hoje: k === 0 });
  }
  const base = ant ? ant.n : 0;
  const pct = prox ? Math.round(((total - base) / (prox.n - base)) * 100) : 100;
  return `
    ${ofensivaHTML(of)}
    <ol class="semana" aria-label="Últimos sete dias">
      ${semana.map((s) => `<li class="${s.feito ? 'feito' : ''}${s.hoje ? ' hoje' : ''}"><i></i><span>${'DSTQQSS'[s.w]}</span></li>`).join('')}
    </ol>
    ${prox ? `
      <div class="proximo">
        <p class="eyebrow">Próximo marco · ${prox.n} ${prox.n === 1 ? 'terço' : 'terços'}</p>
        <p class="pm-t">${prox.t}</p>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <p class="muted small" style="margin-top:8px">${prox.n - total === 1 ? 'Falta 1 terço.' : `Faltam ${prox.n - total} terços.`}</p>
      </div>` : `<p class="pm-t" style="margin-top:20px">Todos os marcos alcançados. Que Nossa Senhora te guarde.</p>`}
    <div class="c-top c-total-linha">
      <div class="c-total"><span class="big" data-total>${total}</span><span class="lbl">${total === 1 ? 'terço rezado' : 'terços rezados'}</span></div>
    </div>
    <ul class="marcos" aria-label="Marcos">
      ${MARCOS.map((m) => `<li class="${total >= m.n ? 'ganho' : ''}" data-marco="${m.n}" title="${m.t}"><span>${m.n}</span></li>`).join('')}
    </ul>`;
}

function telaTerco() {
  delayIdx = 0;
  const hoje = POR_DIA[new Date().getDay()];
  const prog = store.get('tercoProgresso', null);
  const continuar = prog && prog.dia === hojeKey() && prog.i > 0;
  const ordem = [...ORDEM_ROSARIO, 'rosario'];
  const ROSARIO = { pt: 'Rosário completo', la: 'Rosarium integrum', dias: 'os 20 mistérios, conta como 4 terços' };

  render(`
    <p ${r()}><span class="eyebrow">Santo Terço</span></p>
    <h1 ${r()}>Rezar o <em>terço</em></h1>
    <p ${rc('lead')}>Mistério por mistério, no seu ritmo.</p>
    ${continuar ? `<div ${r()} style="margin-top:22px"><a class="btn solid block" href="#/terco/rezar/${prog.conjunto}">Continuar de onde parei</a></div>` : ''}
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Sua constância</span></p>
    <section ${rc('constancia')} aria-live="polite">${constanciaHTML()}</section>
    <hr ${rc('rule')}>
    <ul ${rc('rows')}>
      ${ordem.map((c) => {
        const M = MISTERIOS[c] || ROSARIO;
        return `<li class="misterio-op${c === 'rosario' ? ' rosario-op' : ''}" data-c="${c}">
          <button class="row" data-abrir aria-expanded="false">
            <span class="body"><span class="title">${M.pt}${c === hoje ? ' <em style="color:var(--accent);font-size:16px">· hoje</em>' : ''}</span><span class="sub">${M.la} · ${M.dias}</span></span>
            <span class="feito" aria-label="Rezado hoje">${ICON_TICK}</span>
            ${ICON_ARROW}
          </button>
          <div class="opcoes"><div class="opcoes-in">
            <a class="btn solid block" href="#/terco/rezar/${c}">${c === 'rosario' ? 'Rezar o rosário guiado' : 'Rezar o terço guiado'}</a>
            <button class="btn block" data-marcar>Já rezei · marcar como rezado</button>
            <button class="btn ghost block" data-desmarcar>Desmarcar</button>
          </div></div>
        </li>`;
      }).join('')}
    </ul>
    <ul ${rc('rows')} style="margin-top:28px">
      <li><a class="row" href="#/terco/aprender"><span class="body"><span class="title">Aprender a rezar o terço</span><span class="sub">Como funciona e todas as orações, lado a lado</span></span>${ICON_ARROW}</a></li>
    </ul>
  `);
  const $const = $view.querySelector('.constancia');

  const marcarFeitos = () => {
    const feitos = rezadosHoje();
    $view.querySelectorAll('.misterio-op').forEach((li) => li.classList.toggle('rezado', feitos.includes(li.dataset.c)));
  };
  marcarFeitos();

  // Redesenha a constância, contando o número até o novo total.
  function atualizarConstancia(de, novoMarco, deSeq) {
    $const.innerHTML = constanciaHTML();
    const contar = ($n, ini) => {
      if (!$n) return;
      const ate = +$n.textContent;
      const t0 = performance.now();
      const passo = (t) => {
        const p = Math.min(1, (t - t0) / 600);
        $n.textContent = Math.round(ini + (ate - ini) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    contar($const.querySelector('[data-total]'), de);
    contar($const.querySelector('[data-seq]'), deSeq === undefined ? +$const.querySelector('[data-seq]').textContent : deSeq);
    $const.classList.remove('pulso'); void $const.offsetWidth; $const.classList.add('pulso');
    if (novoMarco) {
      const m = $const.querySelector(`[data-marco="${novoMarco.n}"]`);
      if (m) m.classList.add('novo');
    }
  }

  const fecharOpcoes = (li) => { li.classList.remove('aberto'); li.querySelector('[data-abrir]').setAttribute('aria-expanded', 'false'); };

  $view.querySelectorAll('.misterio-op').forEach((li) => {
    const botao = li.querySelector('[data-abrir]');
    botao.addEventListener('click', () => {
      const abrir = !li.classList.contains('aberto');
      $view.querySelectorAll('.misterio-op.aberto').forEach(fecharOpcoes);
      li.classList.toggle('aberto', abrir);
      botao.setAttribute('aria-expanded', abrir);
      vibrar(6);
    });
    li.querySelector('[data-marcar]').addEventListener('click', () => {
      const antes = store.get('tercosRezados', 0);
      const seqAntes = ofensiva(diario()).seq;
      const feitos = registrarTerco(li.dataset.c);
      const seqDepois = ofensiva(diario()).seq;
      const marco = [...MARCOS].reverse().find((m) => m.n > antes && m.n <= feitos);
      const meta = seqDepois > seqAntes && METAS_OFENSIVA.includes(seqDepois);
      vibrar([20, 60, 20]);
      marcarFeitos();
      atualizarConstancia(antes, marco, seqAntes);
      toast(meta ? `Ofensiva de ${seqDepois} dias` : marco ? `Novo marco: ${marco.t}` : seqDepois > seqAntes ? `Ofensiva: ${seqDepois} ${seqDepois === 1 ? 'dia' : 'dias'}` : li.dataset.c === 'rosario' ? `Rosário rezado · ${feitos} terços` : `${feitos} terços rezados`);
      setTimeout(() => fecharOpcoes(li), 700);
    });
    li.querySelector('[data-desmarcar]').addEventListener('click', () => {
      const antes = store.get('tercosRezados', 0);
      const seqAntes = ofensiva(diario()).seq;
      desmarcarTerco(li.dataset.c);
      vibrar(10);
      marcarFeitos();
      atualizarConstancia(antes, undefined, seqAntes);
      toast('Marcação desfeita');
      setTimeout(() => fecharOpcoes(li), 500);
    });
  });
}

function textoOracao(k, l) {
  const o = ORACOES[k][l];
  let x = esc(o.x);
  if (o.r) x += `<br><span class="resp">℣.</span> ${o.r[0]}<br><span class="resp">℟.</span> ${o.r[1]}`;
  return x;
}

function telaAprender() {
  delayIdx = 0;
  let conjunto = POR_DIA[new Date().getDay()];
  const sequencia = ordem();
  let atual = null;

  render(`
    <a class="back rise" style="--i:0" href="#/terco">${ICON_BACK} Terço</a>
    ${(delayIdx = 1, '')}
    <p ${r()}><span class="eyebrow">Para quem está começando</span></p>
    <h1 ${r()}>Como se reza o <em>terço</em></h1>
    <ol ${rc('steps')} style="margin-top:24px">
      <li><span class="n">1</span><span class="t">Na cruz</span><span class="d">Faça o sinal da cruz e reze o Creio.</span></li>
      <li><span class="n">2</span><span class="t">Nas primeiras contas</span><span class="d">Um Pai-nosso, três Ave-Marias (pela fé, pela esperança e pela caridade) e um Glória.</span></li>
      <li><span class="n">3</span><span class="t">Cinco dezenas</span><span class="d">Em cada uma: anuncie o mistério e medite nele, reze um Pai-nosso, dez Ave-Marias, um Glória e o “Ó meu Jesus”.</span></li>
      <li><span class="n">4</span><span class="t">No fim</span><span class="d">Reze a Salve-Rainha e faça o sinal da cruz.</span></li>
    </ol>
    <p ${rc('muted small')} style="margin-top:16px">Os mistérios mudam conforme o dia: gozosos na segunda e no sábado, dolorosos na terça e na sexta, gloriosos na quarta e no domingo, luminosos na quinta.</p>
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">As orações · conta por conta</span></p>
    <p ${rc('lead')}>Toque numa conta para ver a oração. Comece pela cruz, embaixo, e suba.</p>
    <div ${r()} style="margin-top:18px">
      <div class="choices" role="group" aria-label="Mistérios">
        ${['gozosos', 'luminosos', 'dolorosos', 'gloriosos'].map((c) => `<button class="choice" data-conj="${c}" aria-pressed="${c === conjunto}">${MISTERIOS[c].pt.replace('Mistérios ', '')}</button>`).join('')}
      </div>
    </div>
    <div class="rosario-wrap">
      <div ${r()}>${rosarioSVG()}</div>
      <div class="cp-fundo" aria-hidden="true"></div>
      <aside class="conta-painel" aria-live="polite">
        <div class="cp-top"><span class="eyebrow cp-onde">Toque numa conta</span><button class="cp-x" aria-label="Fechar">×</button></div>
        <div class="cp-corpo"><p class="muted">Cada conta do desenho mostra o que se reza nela, nas suas duas línguas de oração.</p></div>
        <div class="cp-nav"><button class="btn ghost" data-passo="-1">Anterior</button><button class="btn solid" data-passo="1">Próxima</button></div>
      </aside>
    </div>
    <div ${r()} style="margin-top:28px"><a class="btn solid block" href="#/terco/rezar/${POR_DIA[new Date().getDay()]}">Rezar o terço de hoje</a></div>
  `);

  const $painel = $view.querySelector('.conta-painel');
  const $svg = $view.querySelector('.rosario');
  const $fundo = $view.querySelector('.cp-fundo');

  function mostrar(id) {
    atual = id;
    const info = oracoesDa(id, conjunto);
    const M = MISTERIOS[conjunto];
    const [l1, l2] = linguas();
    $svg.querySelectorAll('.conta').forEach((g) => g.classList.toggle('sel', g.dataset.conta === id));
    $painel.querySelector('.cp-onde').textContent = info.onde;
    $painel.querySelector('.cp-corpo').innerHTML = info.itens.map((it) => {
      if (it.misterio !== undefined) return `
        <div class="cp-mist">
          <p class="eyebrow">${ORD[it.misterio]} mistério ${M.pt.replace('Mistérios ', '').toLowerCase().replace(/s$/, '')}</p>
          <h3>${it[l1]}</h3>
          <p class="la">${it[l2]} · ${it.ref}</p>
        </div>`;
      const o = ORACOES[it.o];
      return `<div class="cp-or">
        <h3>${o[l1].t} <span class="muted">· ${o[l2].t}</span></h3>
        ${it.intencao !== undefined ? `<p class="cp-int">${INTENCOES_INICIAIS[l1][it.intencao]}</p>` : ''}
        <p class="pt">${textoOracao(it.o, l1)}</p>
        <p class="la">${textoOracao(it.o, l2)}</p>
      </div>`;
    }).join('') + (info.medita ? `<p class="cp-int">Meditando: ${info.medita[l1]}</p>` : '');
    $painel.querySelector('.cp-corpo').scrollTop = 0;
    const i = sequencia.indexOf(id);
    $painel.querySelector('[data-passo="-1"]').disabled = i === 0;
    $painel.querySelector('[data-passo="1"]').disabled = i === sequencia.length - 1;
    $painel.classList.add('open', 'tem');
    $fundo.classList.add('open');
    travarRolagem();
    $painel.classList.remove('swap'); void $painel.offsetWidth; $painel.classList.add('swap');
    vibrar(6);
  }

  $svg.addEventListener('click', (e) => { const g = e.target.closest('[data-conta]'); if (g) mostrar(g.dataset.conta); });
  $svg.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('[data-conta]');
    if (g) { e.preventDefault(); mostrar(g.dataset.conta); }
  });
  function fechar() {
    $painel.classList.remove('open');
    $fundo.classList.remove('open');
    liberarRolagem();
    $svg.querySelectorAll('.conta.sel').forEach((g) => g.classList.remove('sel'));
  }
  $painel.querySelector('.cp-x').addEventListener('click', fechar);
  $fundo.addEventListener('click', fechar);
  $painel.querySelectorAll('[data-passo]').forEach((b) => b.addEventListener('click', () => {
    const i = Math.max(0, sequencia.indexOf(atual));
    mostrar(sequencia[Math.min(sequencia.length - 1, Math.max(0, i + +b.dataset.passo))]);
  }));
  $view.querySelectorAll('[data-conj]').forEach((b) => b.addEventListener('click', () => {
    conjunto = b.dataset.conj;
    $view.querySelectorAll('[data-conj]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (atual) mostrar(atual);
  }));
}

// Rezar: uma etapa por vez (início, os mistérios, conclusão), sem precisar tocar a cada Ave-Maria.
// O rosário completo reza os quatro conjuntos em seguida: vinte mistérios.
function etapasDoTerco(conjunto) {
  const conjs = conjunto === 'rosario' ? ORDEM_ROSARIO : [conjunto];
  const e = [{ grupo: 'inicio', conj: conjs[0], itens: [{ o: 'sinal' }, { o: 'credo' }, { o: 'pai' }, { o: 'ave', vezes: 3 }, { o: 'gloria' }] }];
  conjs.forEach((c) => {
    for (let k = 0; k < 5; k++) e.push({ grupo: k, conj: c, itens: [{ misterio: k }, { o: 'pai' }, { o: 'ave', vezes: 10 }, { o: 'gloria' }, { o: 'fatima' }] });
  });
  e.push({ grupo: 'fim', conj: conjs[conjs.length - 1], itens: [{ o: 'salve' }, { o: 'sinal' }] });
  return e;
}

function telaRezar(conjunto) {
  delayIdx = 0;
  if (!MISTERIOS[conjunto] && conjunto !== 'rosario') conjunto = POR_DIA[new Date().getDay()];
  const rosario = conjunto === 'rosario';
  const etapas = etapasDoTerco(conjunto);
  const prog = store.get('tercoProgresso', null);
  let i = prog && prog.dia === hojeKey() && prog.conjunto === conjunto ? Math.min(prog.i, etapas.length - 1) : 0;
  const contagem = {};

  render(`
    <div class="rezar">
      <div class="pray-top rise" style="--i:0">
        <a class="back" href="#/terco" style="margin:0">${ICON_BACK} Sair</a>
        ${langToggle()}
      </div>
      <div class="etapas rise${rosario ? ' muitas' : ''}" style="--i:1;grid-template-columns:repeat(${etapas.length}, 1fr)" role="tablist">
        ${etapas.map((e, k) => `<button class="seg" data-etapa="${k}" aria-label="${nomeEtapa(e, 'pt')}"><i></i></button>`).join('')}
      </div>
      <div class="etapa" aria-live="polite"></div>
    </div>
    <div class="pray-nav fixa"><div class="inner">
      <button class="btn ghost" id="voltar">Voltar</button>
      <button class="btn solid" id="avancar">Avançar</button>
    </div></div>
  `);

  const $etapa = $view.querySelector('.etapa');

  function nomeEtapa(e, l) {
    if (e.grupo === 'inicio') return PARTES.inicio[l];
    if (e.grupo === 'fim') return PARTES.fim[l];
    if (l === 'pt' && rosario) return `${ORD[e.grupo]} ${MISTERIOS[e.conj].pt.replace('Mistérios ', '').toLowerCase().replace(/s$/, '')}`;
    return PARTES.misterio[l](e.grupo);
  }

  function desenhar(animar) {
    const l = lingua();
    const [l1] = linguas();
    const e = etapas[i];
    const M = MISTERIOS[e.conj];
    const sub = rosario && typeof e.grupo !== 'number' ? PARTES.rosario[l] : M[l];
    $etapa.innerHTML = `
      <p class="where">${nomeEtapa(e, l)} <span class="muted">· ${sub}</span></p>
      ${e.itens.map((it, j) => {
        if (it.misterio !== undefined) {
          const m = M.itens[it.misterio];
          return `<div class="et-mist">
            <h2>${m[l]}</h2>
            <p class="muted">${l !== l1 ? m[l1] + ' · ' : ''}${m.ref}</p>
          </div>`;
        }
        const o = ORACOES[it.o][l];
        const n = contagem[`${i}:${j}`] || 0;
        return `<div class="et-or">
          <h3>${o.t}${it.vezes ? ` <span class="vezes">× ${it.vezes}</span>` : ''}</h3>
          ${it.vezes === 3 ? `<p class="cp-int">${INTENCOES_INICIAIS[l].join(' · ')}</p>` : ''}
          <p class="ptext">${textoOracao(it.o, l)}</p>
          ${l !== l1 ? `<p class="alt">${esc(ORACOES[it.o][l1].x)}</p>` : ''}
          ${it.vezes ? `<div class="contador" data-cont="${i}:${j}">
            <div class="beads">${Array.from({ length: it.vezes }, (_, b) => `<button class="bead${b < n ? ' done' : ''}" data-b="${b}" aria-label="Ave-Maria ${b + 1}"></button>`).join('')}</div>
            <span class="cnt">${n ? `${n} de ${it.vezes}` : 'Toque nas contas para contar, se quiser'}</span>
          </div>` : ''}
        </div>`;
      }).join('')}
    `;
    if (animar) { $etapa.classList.remove('swap'); void $etapa.offsetWidth; $etapa.classList.add('swap'); }
    $view.querySelectorAll('.seg').forEach((s, k) => { s.classList.toggle('done', k < i); s.classList.toggle('now', k === i); });
    $view.querySelector('#voltar').disabled = i === 0;
    $view.querySelector('#avancar').textContent = i === etapas.length - 1 ? (rosario ? 'Terminei o rosário' : 'Terminei o terço') : `${nomeEtapa(etapas[i + 1], 'pt')} →`;
    store.set('tercoProgresso', { dia: hojeKey(), conjunto, i });
  }

  function ir(k) {
    if (k < 0 || k >= etapas.length) return;
    i = k;
    vibrar(etapas[i].grupo === 'fim' || typeof etapas[i].grupo === 'number' ? 20 : 8);
    desenhar(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function avancar() { if (i >= etapas.length - 1) concluir(); else ir(i + 1); }

  function concluir() {
    store.del('tercoProgresso');
    const seqAntes = ofensiva(diario()).seq;
    const feitos = registrarTerco(conjunto);
    const of = ofensiva(diario());
    const subiu = of.seq > seqAntes;
    const meta = subiu && METAS_OFENSIVA.includes(of.seq);
    vibrar(meta ? [30, 60, 30, 60, 60] : [20, 60, 20]);
    document.removeEventListener('keydown', teclas);
    $view.innerHTML = `
      <div class="absolvo">
        <svg class="cross" viewBox="0 0 54 80"><path d="M27 2v76M6 24h42"/></svg>
        <h2 class="rise" style="--i:3;margin-top:22px">${rosario ? 'Rosário' : 'Terço'} <em>rezado</em>.</h2>
        <p class="lead rise" style="--i:4">${feitos === 1 ? 'O primeiro terço rezado com o Lumen.' : `${feitos} terços rezados com o Lumen.`}</p>
        <div class="of-final rise" style="--i:6">
          ${ofensivaSVG(of)}
          <p class="of-final-t">${subiu ? (of.seq === 1 ? 'Primeira conta acesa. Sua ofensiva começou.' : `Ofensiva de ${of.seq} dias${meta ? ' · nova meta!' : ''}`) : `Ofensiva de ${of.seq} ${of.seq === 1 ? 'dia' : 'dias'} mantida.`}</p>
        </div>
        <div class="rise" style="--i:7;margin-top:26px"><a class="btn block" href="#/">Voltar ao início</a></div>
      </div>`;
    window.scrollTo(0, 0);
  }

  function teclas(e) {
    if (!location.hash.startsWith('#/terco/rezar')) return document.removeEventListener('keydown', teclas);
    if (e.key === 'ArrowRight') { e.preventDefault(); avancar(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(i - 1); }
  }

  $etapa.addEventListener('click', (e) => {
    const b = e.target.closest('[data-b]');
    if (!b) return;
    const box = b.closest('[data-cont]');
    const total = box.querySelectorAll('[data-b]').length;
    const atual = contagem[box.dataset.cont] || 0;
    const n = +b.dataset.b + 1 === atual ? atual - 1 : +b.dataset.b + 1;
    contagem[box.dataset.cont] = n;
    box.querySelectorAll('[data-b]').forEach((x, k) => x.classList.toggle('done', k < n));
    box.querySelector('.cnt').textContent = n ? `${n} de ${total}` : 'Toque nas contas para contar, se quiser';
    vibrar(n === total ? [10, 40, 10] : 6);
  });
  $view.querySelectorAll('[data-etapa]').forEach((s) => s.addEventListener('click', () => ir(+s.dataset.etapa)));
  $view.querySelector('#avancar').addEventListener('click', avancar);
  $view.querySelector('#voltar').addEventListener('click', () => ir(i - 1));
  document.addEventListener('keydown', teclas);

  ligarToggle(() => desenhar(true));
  desenhar(false);
}

// ---------- Leituras da Missa ----------
function leiturasHTML(n) {
  const L = leiturasDo(n);
  if (!L) return '';
  if (L.semDados) return `<p class="muted">${L.nota}</p>`;
  const linha = (rot, ref, extra = '', cls = '') => (ref ? `<li class="${cls}"><span class="rot">${rot}</span><span class="ref">${ref}${extra}</span></li>` : '');
  return `
    <ul class="leituras">
      ${linha('1ª leitura', L.l1)}
      ${linha('Salmo', L.salmo, L.refrao ? `<span class="refrao">Refrão: ${L.refrao}</span>` : '')}
      ${linha('2ª leitura', L.l2)}
      ${linha('Evangelho', L.ev, '', 'ev')}
    </ul>
    ${L.nota ? `<p class="muted small" style="margin-top:10px">${L.nota}</p>` : ''}`;
}

// ---------- Santos e festas ----------
const SEMANA_MIN = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

// Estado da aba entre o calendário e o dia aberto
const santos = { mes: null, rolagem: 0, origem: null, voltando: false, veioDoCalendario: false };

function telaSantos(param) {
  const n = deIso(param);
  if (n !== null) return telaDiaSanto(n);
  telaCalendario();
}

// Panorama: o calendário do mês e a lista das festas e memórias.
function telaCalendario() {
  delayIdx = 0;
  const hoje = hojeNum();
  let mes = santos.mes || { y: data(hoje).y, m: data(hoje).m };

  render(`
    <p ${r()}><span class="eyebrow">Santos e festas <span class="dot">·</span> calendário litúrgico</span></p>
    <h1 ${r()}>O ano da <em>Igreja</em></h1>
    <div ${rc('cal-head')}>
      <button class="cal-nav" data-mes="-1" aria-label="Mês anterior">${ICON_BACK}</button>
      <h2 class="cal-mes" aria-live="polite"></h2>
      <button class="cal-nav" data-mes="1" aria-label="Próximo mês">${ICON_FWD}</button>
    </div>
    <div ${rc('cal')}></div>
    <p ${rc('cal-legenda')}>
      <span><i class="marca t-festa"></i> festa ou solenidade</span><span><i class="marca t-santo"></i> dia de santo</span>
    </p>
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Neste mês</span></p>
    <ul ${rc('rows mes-lista')}></ul>
  `);

  const $cal = $view.querySelector('.cal');
  const $lista = $view.querySelector('.mes-lista');

  function desenharMes() {
    const primeiro = Date.UTC(mes.y, mes.m - 1, 1) / 86400000;
    const ultimo = Date.UTC(mes.y, mes.m, 0) / 86400000;
    let html = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((x) => `<span class="wd">${x}</span>`).join('');
    html += '<span class="cd vazio"></span>'.repeat(data(primeiro).w);
    const destaques = [];
    for (let n = primeiro; n <= ultimo; n++) {
      const D = dia(n);
      const c = D.destaque;
      // marca: vermelho para festa e solenidade, dourado para dia de santo, nada nos dias comuns
      const tipo = !c ? 'x' : 'SF'.includes(c.g) ? 'festa' : 'santo';
      if (D.principal) destaques.push(D);
      html += `<button class="cd t-${tipo}${n === hoje ? ' hoje' : ''}" data-n="${n}" aria-label="${D.d} de ${MESES[D.m - 1]}${c ? ': ' + esc(c.n) : ''}">
        <span class="cn">${D.d}</span><i class="marca"></i>${c ? `<span class="cs">${esc(c.n.split(',')[0])}</span>` : ''}</button>`;
    }
    $cal.innerHTML = html;
    $view.querySelector('.cal-mes').innerHTML = `${MESES[mes.m - 1]} <em>${mes.y}</em>`;
    $lista.innerHTML = destaques.length ? destaques.map((D) => `
      <li><button class="row" data-n="${D.n}">
        <span class="num">${D.d}</span>
        <span class="body"><span class="title">${D.principal.n}</span><span class="sub">${GRAUS[D.principal.g]} · ${SEMANA_MIN[D.w]}${D.principal.br ? ' · próprio do Brasil' : ''}</span></span>
        <i class="marca t-${'SF'.includes(D.principal.g) ? 'festa' : 'santo'}"></i>
      </button></li>`).join('') : '<li class="muted" style="padding:16px 0">Nenhuma festa ou memória obrigatória neste mês.</li>';
  }

  // Abrir um dia: guarda onde a pessoa estava e de onde sai o zoom.
  function abrir(n, el) {
    const r0 = el.getBoundingClientRect();
    santos.origem = { x: r0.left + r0.width / 2, y: r0.top + r0.height / 2 };
    santos.rolagem = window.scrollY;
    santos.mes = mes;
    santos.veioDoCalendario = true;
    vibrar(6);
    location.hash = `#/santos/${iso(n)}`;
  }

  const clique = (e) => {
    const alvo = e.target.closest('[data-n]');
    if (alvo) return abrir(+alvo.dataset.n, alvo);
    const nav = e.target.closest('[data-mes]');
    if (nav) {
      const k = mes.y * 12 + (mes.m - 1) + +nav.dataset.mes;
      mes = { y: Math.floor(k / 12), m: (k % 12) + 1 };
      santos.mes = mes;
      desenharMes();
      $cal.classList.remove('swap'); void $cal.offsetWidth; $cal.classList.add('swap');
    }
  };
  [$cal, $lista, $view.querySelector('.cal-head')].forEach((el) => el.addEventListener('click', clique));

  desenharMes();

  // Voltando de um dia: o calendário reaparece no mesmo ponto, "saindo" do dia que estava aberto.
  if (santos.voltando) {
    santos.voltando = false;
    $view.querySelectorAll('.rise').forEach((el) => el.classList.remove('rise'));
    window.scrollTo(0, santos.rolagem);
    const cel = santos.dia && $cal.querySelector(`[data-n="${santos.dia}"]`);
    if (cel) {
      const rv = $view.getBoundingClientRect();
      const rc0 = cel.getBoundingClientRect();
      $view.style.transformOrigin = `${rc0.left + rc0.width / 2 - rv.left}px ${rc0.top + rc0.height / 2 - rv.top}px`;
      cel.classList.add('veio');
    }
    $view.classList.remove('zoom-volta'); void $view.offsetWidth; $view.classList.add('zoom-volta');
    $view.addEventListener('animationend', () => $view.classList.remove('zoom-volta'), { once: true });
  }
}

// Um dia aberto: grau, santo, nota e (em breve) o Evangelho. Desliza para os lados.
function telaDiaSanto(n0) {
  delayIdx = 0;
  const hoje = hojeNum();
  let n = n0;

  render(`
    <div class="dia-view">
      <div class="dv-top">
        <button class="back" id="dv-voltar" style="margin:0">${ICON_BACK} Calendário</button>
        <div class="dv-nav">
          <button class="cal-nav" data-passo="-1" aria-label="Dia anterior">${ICON_BACK}</button>
          <button class="cal-nav" data-passo="1" aria-label="Próximo dia">${ICON_FWD}</button>
        </div>
      </div>
      <div class="dv-corpo" aria-live="polite"></div>
    </div>
  `);

  const $dv = $view.querySelector('.dia-view');
  const $corpo = $view.querySelector('.dv-corpo');

  function desenhar(dir) {
    const D = dia(n);
    const c = D.destaque;
    const outros = D.outros.filter((o) => o.n !== (c && c.n) || o.nota);
    const motivo = (o) => o.nota || (o.g === 'c' ? 'Pode ser lembrada na oração do dia.' : o.impedida ? (D.w === 0 ? 'Neste ano cai num domingo e não é celebrada.' : 'Neste ano não é celebrada, por coincidir com uma celebração maior.') : '');
    $corpo.innerHTML = `
      <div class="hero-date dv-data">
        <span class="day">${D.d}</span>
        <span class="meta"><span class="wd">${SEMANA_MIN[D.w]}</span><span class="mo">${MESES[D.m - 1]} ${D.y}${n === hoje ? ' · hoje' : ''}</span></span>
      </div>
      <p class="lit-line"><span class="lc lc-${D.cor}"></span>${D.w === 0 && !D.principal ? D.titulo : D.tempo}</p>
      <hr class="rule">
      ${c ? `
        <p class="eyebrow grau">${GRAUS[c.g]}${c.br ? ' · próprio do Brasil' : ''}</p>
        <h2 class="dv-nome">${c.n}</h2>
        <p class="lead">${c.b}</p>
        ${c.nota ? `<p class="muted small" style="margin-top:10px">${c.nota}</p>` : ''}` : `
        <p class="eyebrow grau">${D.w === 0 ? 'Domingo' : 'Dia de semana'}</p>
        <p class="lead">Nenhum santo é celebrado neste dia no calendário geral.</p>`}
      ${outros.length ? `
        <p class="eyebrow" style="margin-top:26px">Também neste dia</p>
        <ul class="tambem">${outros.map((o) => `<li>
          <span class="t">${o.n}</span>
          <span class="g">${GRAUS[o.g]}${o.br ? ' · próprio do Brasil' : ''}</span>
          <span class="b">${o.b}</span>
          ${motivo(o) ? `<span class="nt">${motivo(o)}</span>` : ''}
        </li>`).join('')}</ul>` : ''}
      <hr class="rule">
      <p class="eyebrow">Leituras da Missa</p>
      ${leiturasHTML(n)}
      <p class="dv-dica">Deslize para os lados para ver outros dias</p>
    `;
    if (dir) { $corpo.classList.remove('de-dir', 'de-esq'); void $corpo.offsetWidth; $corpo.classList.add(dir > 0 ? 'de-dir' : 'de-esq'); }
  }

  function passar(k) {
    n += k;
    santos.dia = n;
    santos.mes = { y: data(n).y, m: data(n).m };
    history.replaceState(null, '', `#/santos/${iso(n)}`);
    vibrar(6);
    desenhar(k);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function voltar() {
    santos.dia = n;
    santos.voltando = true;
    if (!santos.mes) santos.mes = { y: data(n).y, m: data(n).m };
    if (santos.veioDoCalendario) { santos.veioDoCalendario = false; history.back(); } else location.hash = '#/santos';
  }

  $view.querySelector('#dv-voltar').addEventListener('click', voltar);
  $view.querySelectorAll('[data-passo]').forEach((b) => b.addEventListener('click', () => passar(+b.dataset.passo)));

  // deslizar para os lados no celular
  let t0 = null;
  $dv.addEventListener('touchstart', (e) => { t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  $dv.addEventListener('touchend', (e) => {
    if (!t0) return;
    const dx = e.changedTouches[0].clientX - t0.x;
    const dy = e.changedTouches[0].clientY - t0.y;
    t0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) passar(dx < 0 ? 1 : -1);
  });

  function teclas(e) {
    if (!location.hash.startsWith('#/santos/')) return document.removeEventListener('keydown', teclas);
    if (e.key === 'ArrowRight') passar(1);
    if (e.key === 'ArrowLeft') passar(-1);
    if (e.key === 'Escape') voltar();
  }
  document.addEventListener('keydown', teclas);

  santos.dia = n;
  if (!santos.mes) santos.mes = { y: data(n).y, m: data(n).m };
  desenhar(0);

  // Zoom a partir do dia tocado no calendário
  if (santos.origem) {
    const rv = $dv.getBoundingClientRect();
    $dv.style.transformOrigin = `${santos.origem.x - rv.left}px ${santos.origem.y - rv.top}px`;
    $dv.classList.add('zoom');
    santos.origem = null;
  } else {
    $dv.classList.add('rise');
  }
}

// ---------- Mais ----------
function aplicarTema(t) {
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  const bg = getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#0d0c0a';
  document.getElementById('meta-theme').setAttribute('content', bg);
}

function telaMais() {
  delayIdx = 0;
  const tema = temaAtual();
  const tercos = store.get('tercosRezados', 0);
  render(`
    <p ${r()}><span class="eyebrow">Ajustes</span></p>
    <h1 ${r()}>Lu<em>men</em></h1>
    <p ${rc('lead')}>Exame de consciência, terço e o calendário dos santos, na palma da mão.</p>
    <hr ${rc('rule')}>
    <div ${rc('setting')}>
      <span class="lbl">Aparência</span>
      <div class="choices">
        <button class="choice" data-tema="auto" aria-pressed="${tema === 'auto'}">Automático</button>
        <button class="choice" data-tema="dark" aria-pressed="${tema === 'dark'}">Escuro</button>
        <button class="choice" data-tema="light" aria-pressed="${tema === 'light'}">Claro</button>
      </div>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Língua do aplicativo</span>
      <div class="choices">
        <button class="choice" aria-pressed="true">Português</button>
        <button class="choice" disabled>Inglês · em breve</button>
      </div>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Línguas da oração</span>
      <p class="muted small">A principal aparece primeiro. Dentro do terço, você alterna entre as duas.</p>
      <p class="eyebrow" style="margin-top:14px">Principal</p>
      <div class="choices">${Object.entries(LINGUAS).map(([k, v]) => `<button class="choice" data-l1="${k}">${v.nome}</button>`).join('')}</div>
      <p class="eyebrow" style="margin-top:16px">Secundária</p>
      <div class="choices">${Object.entries(LINGUAS).map(([k, v]) => `<button class="choice" data-l2="${k}">${v.nome}</button>`).join('')}</div>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Seus números</span>
      <p class="muted">${tercos} ${tercos === 1 ? 'terço rezado' : 'terços rezados'} neste aparelho.</p>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Privacidade</span>
      <p class="muted">O Lumen não tem conta, servidor nem rastreamento. Tudo o que você marca fica guardado só neste aparelho e pode ser apagado a qualquer momento.</p>
      <button class="btn ghost" id="apagar" style="margin-top:6px">Apagar todos os meus dados</button>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Instalar no celular</span>
      <p class="muted">No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”. No Android: menu do navegador e “Instalar app”.</p>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Em breve</span>
      <p class="muted">O jogo diário do santo e a Cela, uma pergunta de exame por noite.</p>
    </div>
    <p ${rc('muted small')} style="margin-top:24px">As referências das leituras seguem o Lecionário da Missa, a partir das tabelas do Pe. Felix Just, S.J., em <a href="https://catholic-resources.org/Lectionary/" target="_blank" rel="noopener">catholic-resources.org</a>.</p>
    <p ${rc('muted small')}>O calendário segue o Calendário Romano Geral e o próprio do Brasil, com as solenidades transferidas para o domingo como é costume aqui.</p>
    <p ${rc('muted small')}>Os exames foram escritos com base no Catecismo da Igreja Católica. Eles ajudam a preparar a confissão, mas não substituem a orientação de um sacerdote.</p>
  `);

  $view.querySelectorAll('[data-tema]').forEach((b) => b.addEventListener('click', () => {
    try { localStorage.setItem('lumen.theme', b.dataset.tema); } catch (e) {}
    aplicarTema(b.dataset.tema);
    $view.querySelectorAll('[data-tema]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  }));
  const marcarLinguas = () => {
    const [l1, l2] = linguas();
    $view.querySelectorAll('[data-l1]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.l1 === l1));
    $view.querySelectorAll('[data-l2]').forEach((b) => { b.setAttribute('aria-pressed', b.dataset.l2 === l2); b.disabled = b.dataset.l2 === l1; });
  };
  marcarLinguas();
  $view.querySelectorAll('[data-l1]').forEach((b) => b.addEventListener('click', () => {
    const [l1, l2] = linguas();
    const novo = b.dataset.l1;
    if (novo === l2) store.set('lingua2', l1); // trocar de lugar
    store.set('lingua1', novo);
    store.set('lingua', novo);
    marcarLinguas();
    toast(`Oração em ${LINGUAS[novo].nome.toLowerCase()} e ${LINGUAS[linguas()[1]].nome.toLowerCase()}`);
  }));
  $view.querySelectorAll('[data-l2]').forEach((b) => b.addEventListener('click', () => {
    store.set('lingua2', b.dataset.l2);
    marcarLinguas();
    const [l1, l2] = linguas();
    toast(`Oração em ${LINGUAS[l1].nome.toLowerCase()} e ${LINGUAS[l2].nome.toLowerCase()}`);
  }));

  $view.querySelector('#apagar').addEventListener('click', () => {
    if (!confirm('Apagar a lista, as anotações, a data da última confissão e o progresso do terço?')) return;
    ['marcados', 'nota', 'ultimaConfissao', 'tercoProgresso', 'tercosRezados', 'tercoHoje', 'tercoDiario', 'ofensivaRecorde', 'estados'].forEach(store.del);
    toast('Dados apagados');
    telaMais();
  });
}

// ---------- Rotas ----------
function moverIndicador() {
  const a = $tabbar.querySelector('a.active');
  if (!a) return;
  if (window.matchMedia('(min-width: 900px)').matches) {
    $tabbar.style.setProperty('--ind-y', a.offsetTop + 'px');
    $tabbar.style.setProperty('--ind-h', a.offsetHeight + 'px');
  } else {
    $tabbar.style.setProperty('--ind-x', a.offsetLeft + a.offsetWidth * 0.3 + 'px');
    $tabbar.style.setProperty('--ind-w', a.offsetWidth * 0.4 + 'px');
  }
}

function rota() {
  liberarRolagem();
  const partes = (location.hash.replace(/^#\/?/, '') || '').split('/');
  const [a, b, c] = partes;
  let tab = 'inicio';

  if (a === 'exame' && b) { tab = 'exame'; telaExame(b); }
  else if (a === 'exame') { tab = 'exame'; telaExames(); }
  else if (a === 'lista') { tab = 'exame'; telaLista(); }
  else if (a === 'como') { tab = 'exame'; telaComo(); }
  else if (a === 'terco' && b === 'rezar') { tab = 'terco'; telaRezar(c); }
  else if (a === 'terco' && b === 'aprender') { tab = 'terco'; telaAprender(); }
  else if (a === 'terco') { tab = 'terco'; telaTerco(); }
  else if (a === 'santos') { tab = 'santos'; telaSantos(b); }
  else if (a === 'mais') { tab = 'mais'; telaMais(); }
  else telaInicio();

  $tabbar.querySelectorAll('a').forEach((x) => x.classList.toggle('active', x.dataset.tab === tab));
  moverIndicador();
}

window.addEventListener('hashchange', rota);
window.addEventListener('resize', moverIndicador);
document.fonts && document.fonts.ready.then(moverIndicador);
aplicarTema(temaAtual());
rota();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
