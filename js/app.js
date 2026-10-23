import { EXAMES, ESTADOS, PASSOS, CONTRICAO } from './data/exames.js';
import { ORACOES, MISTERIOS, POR_DIA, ORDINAIS, INTENCOES_INICIAIS } from './data/terco.js';
import { rosarioSVG, ordem, oracoesDa, ORD } from './rosario.js';
import { dia, data, hojeNum, iso, deIso, GRAUS, CORES } from './liturgia.js';

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

const FRASES = [
  { x: 'Fizeste-nos para ti, Senhor, e inquieto está o nosso coração enquanto não repousa em ti.', a: 'Santo Agostinho · Confissões I, 1' },
  { x: 'Fica na tua cela, e a tua cela te ensinará tudo.', a: 'Abba Moisés · Padres do Deserto' },
  { x: 'Nada te perturbe, nada te espante. Quem a Deus tem nada lhe falta. Só Deus basta.', a: 'Santa Teresa de Ávila' },
  { x: 'A glória de Deus é o homem vivo.', a: 'Santo Irineu de Lião' },
  { x: 'Tarde te amei, ó beleza tão antiga e tão nova, tarde te amei!', a: 'Santo Agostinho · Confissões X, 27' },
  { x: 'Rezem o terço todos os dias.', a: 'Nossa Senhora em Fátima · 1917' },
  { x: 'Senhor, que eu veja!', a: 'O cego de Jericó · Lc 18, 41' },
];

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
  const frase = FRASES[(d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % FRASES.length];
  const dias = diasDesde(store.get('ultimaConfissao', null));
  const n = totalMarcados();
  const L = dia(hojeNum());
  const santo = L.destaque;

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
    <blockquote ${rc('quote')}>“${frase.x}”<cite>${frase.a}</cite></blockquote>
    <hr ${rc('rule')}>
    ${santo ? `
      <p ${r()}><span class="eyebrow">Hoje a Igreja celebra <span class="dot">·</span> ${GRAUS[santo.g]}</span></p>
      <h2 ${r()}>${santo.n}</h2>
      <p ${rc('muted')} style="margin-top:10px">${santo.b}</p>
      <ul ${rc('rows')} style="margin-top:14px"><li><a class="row" href="#/santos"><span class="body"><span class="title">Calendário dos santos</span><span class="sub">Os santos e as festas de cada dia do ano</span></span>${ICON_ARROW}</a></li></ul>
      <hr ${rc('rule')}>` : ''}
    <p ${r()}><span class="eyebrow">Terço de hoje</span></p>
    <h2 ${r()}>${M.pt.replace('Mistérios ', 'Mistérios <em>')}</em></h2>
    <ol ${rc('mystery-list')}>${M.itens.map((it) => `<li>${it.pt}</li>`).join('')}</ol>
    <div ${r()} style="margin-top:18px"><a class="btn solid block" href="#/terco/rezar/${conj}">Rezar agora</a></div>
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Confissão</span></p>
    <div ${r()}>${conf}</div>
    <ul ${rc('rows')} style="margin-top:18px">
      <li><a class="row" href="#/exame"><span class="body"><span class="title">Fazer o exame de consciência</span><span class="sub">Quatro exames, por estado de vida</span></span>${ICON_ARROW}</a></li>
      ${n ? `<li><a class="row" href="#/lista"><span class="body"><span class="title">Minha lista</span><span class="sub">${n} ${n === 1 ? 'item marcado' : 'itens marcados'}, só no seu aparelho</span></span>${ICON_ARROW}</a></li>` : ''}
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
    <div style="margin-top:28px" ${r()}><a class="btn block" href="#/lista">Ver minha lista</a></div>
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
      <p ${rc('formula')}>${CONTRICAO.breve}</p>
      <p ${rc('muted small')}><a href="#/como">Ver o passo a passo e a versão completa</a></p>
      <hr ${rc('rule')}>
      <p ${rc('muted small')}>Depois de se confessar, toque abaixo. A lista é apagada para sempre: “Eu, das suas iniquidades, não me lembrarei mais” (Hb 8,12).</p>
      <div ${r()} style="margin-top:14px"><button class="btn solid block" id="confessei">Confessei</button></div>
    </div>
  `);

  $view.querySelector('#nota').addEventListener('input', (e) => store.set('nota', e.target.value));

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
const lingua = () => store.get('lingua', 'pt');

function langToggle() {
  const l = lingua();
  return `<div class="lang-toggle" role="group" aria-label="Língua">
    <button data-lang="pt" aria-pressed="${l === 'pt'}">PT</button>
    <button data-lang="la" aria-pressed="${l === 'la'}">LATIM</button>
  </div>`;
}
function ligarToggle(onChange) {
  $view.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    store.set('lingua', b.dataset.lang);
    $view.querySelectorAll('[data-lang]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    onChange();
  }));
}

function telaTerco() {
  delayIdx = 0;
  const hoje = POR_DIA[new Date().getDay()];
  const prog = store.get('tercoProgresso', null);
  const continuar = prog && prog.dia === hojeKey() && prog.i > 0;
  const ordem = ['gozosos', 'luminosos', 'dolorosos', 'gloriosos'];

  render(`
    <p ${r()}><span class="eyebrow">Santo Terço</span></p>
    <h1 ${r()}>Rezar o <em>terço</em></h1>
    <p ${rc('lead')}>Mistério por mistério, em português ou em latim, no seu ritmo.</p>
    <div ${r()} style="margin-top:20px">${langToggle()}</div>
    ${continuar ? `<div ${r()} style="margin-top:22px"><a class="btn solid block" href="#/terco/rezar/${prog.conjunto}">Continuar de onde parei</a></div>` : ''}
    <hr ${rc('rule')}>
    <ul ${rc('rows')}>
      ${ordem.map((c) => {
        const M = MISTERIOS[c];
        return `<li><a class="row" href="#/terco/rezar/${c}" ${c === hoje ? 'data-hoje' : ''}>
          <span class="body"><span class="title">${M.pt}${c === hoje ? ' <em style="color:var(--accent);font-size:16px">· hoje</em>' : ''}</span><span class="sub">${M.la} · ${M.dias}</span></span>
          ${ICON_ARROW}</a></li>`;
      }).join('')}
    </ul>
    <ul ${rc('rows')} style="margin-top:28px">
      <li><a class="row" href="#/terco/aprender"><span class="body"><span class="title">Aprender a rezar o terço</span><span class="sub">Como funciona e todas as orações, lado a lado</span></span>${ICON_ARROW}</a></li>
    </ul>
  `);
  ligarToggle(() => {});
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
      <aside class="conta-painel" aria-live="polite">
        <div class="cp-top"><span class="eyebrow cp-onde">Toque numa conta</span><button class="cp-x" aria-label="Fechar">×</button></div>
        <div class="cp-corpo"><p class="muted">Cada conta do desenho mostra o que se reza nela, em português e em latim.</p></div>
        <div class="cp-nav"><button class="btn ghost" data-passo="-1">Anterior</button><button class="btn solid" data-passo="1">Próxima</button></div>
      </aside>
    </div>
    <div ${r()} style="margin-top:28px"><a class="btn solid block" href="#/terco/rezar/${POR_DIA[new Date().getDay()]}">Rezar o terço de hoje</a></div>
  `);

  const $painel = $view.querySelector('.conta-painel');
  const $svg = $view.querySelector('.rosario');

  function mostrar(id) {
    atual = id;
    const info = oracoesDa(id, conjunto);
    const M = MISTERIOS[conjunto];
    $svg.querySelectorAll('.conta').forEach((g) => g.classList.toggle('sel', g.dataset.conta === id));
    $painel.querySelector('.cp-onde').textContent = info.onde;
    $painel.querySelector('.cp-corpo').innerHTML = info.itens.map((it) => {
      if (it.misterio !== undefined) return `
        <div class="cp-mist">
          <p class="eyebrow">${ORD[it.misterio]} mistério ${M.pt.replace('Mistérios ', '').toLowerCase().replace(/s$/, '')}</p>
          <h3>${it.pt}</h3>
          <p class="la">${it.la} · ${it.ref}</p>
        </div>`;
      const o = ORACOES[it.o];
      return `<div class="cp-or">
        <h3>${o.pt.t} <span class="muted">· ${o.la.t}</span></h3>
        ${it.intencao !== undefined ? `<p class="cp-int">${INTENCOES_INICIAIS.pt[it.intencao]}</p>` : ''}
        <p class="pt">${textoOracao(it.o, 'pt')}</p>
        <p class="la">${textoOracao(it.o, 'la')}</p>
      </div>`;
    }).join('') + (info.medita ? `<p class="cp-int">Meditando: ${info.medita.pt}</p>` : '');
    $painel.querySelector('.cp-corpo').scrollTop = 0;
    const i = sequencia.indexOf(id);
    $painel.querySelector('[data-passo="-1"]').disabled = i === 0;
    $painel.querySelector('[data-passo="1"]').disabled = i === sequencia.length - 1;
    $painel.classList.add('open', 'tem');
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
  $painel.querySelector('.cp-x').addEventListener('click', () => {
    $painel.classList.remove('open');
    liberarRolagem();
    $svg.querySelectorAll('.conta.sel').forEach((g) => g.classList.remove('sel'));
  });
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

// Rezar: uma etapa por vez (início, cinco mistérios, conclusão), sem precisar tocar a cada Ave-Maria.
function etapasDoTerco() {
  const e = [{ grupo: 'inicio', itens: [{ o: 'sinal' }, { o: 'credo' }, { o: 'pai' }, { o: 'ave', vezes: 3 }, { o: 'gloria' }] }];
  for (let k = 0; k < 5; k++) e.push({ grupo: k, itens: [{ misterio: k }, { o: 'pai' }, { o: 'ave', vezes: 10 }, { o: 'gloria' }, { o: 'fatima' }] });
  e.push({ grupo: 'fim', itens: [{ o: 'salve' }, { o: 'sinal' }] });
  return e;
}

function telaRezar(conjunto) {
  delayIdx = 0;
  if (!MISTERIOS[conjunto]) conjunto = POR_DIA[new Date().getDay()];
  const M = MISTERIOS[conjunto];
  const etapas = etapasDoTerco();
  const prog = store.get('tercoProgresso', null);
  let i = prog && prog.dia === hojeKey() && prog.conjunto === conjunto ? Math.min(prog.i, etapas.length - 1) : 0;
  const contagem = {};

  render(`
    <div class="rezar">
      <div class="pray-top rise" style="--i:0">
        <a class="back" href="#/terco" style="margin:0">${ICON_BACK} Sair</a>
        ${langToggle()}
      </div>
      <div class="etapas rise" style="--i:1" role="tablist">
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
    if (e.grupo === 'inicio') return l === 'la' ? 'Initium' : 'Início';
    if (e.grupo === 'fim') return l === 'la' ? 'Finis' : 'Conclusão';
    return l === 'la' ? `Mysterium ${ORDINAIS.la[e.grupo]}` : `${ORD[e.grupo]} mistério`;
  }

  function desenhar(animar) {
    const l = lingua();
    const e = etapas[i];
    $etapa.innerHTML = `
      <p class="where">${nomeEtapa(e, l)} <span class="muted">· ${l === 'la' ? M.la : M.pt}</span></p>
      ${e.itens.map((it, j) => {
        if (it.misterio !== undefined) {
          const m = M.itens[it.misterio];
          return `<div class="et-mist">
            <h2>${l === 'la' ? m.la : m.pt}</h2>
            <p class="muted">${l === 'la' ? m.pt + ' · ' : ''}${m.ref}</p>
          </div>`;
        }
        const o = ORACOES[it.o][l];
        const n = contagem[`${i}:${j}`] || 0;
        return `<div class="et-or">
          <h3>${o.t}${it.vezes ? ` <span class="vezes">× ${it.vezes}</span>` : ''}</h3>
          ${it.vezes === 3 ? `<p class="cp-int">${INTENCOES_INICIAIS[l].join(' · ')}</p>` : ''}
          <p class="ptext">${textoOracao(it.o, l)}</p>
          ${l === 'la' ? `<p class="alt">${esc(ORACOES[it.o].pt.x)}</p>` : ''}
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
    $view.querySelector('#avancar').textContent = i === etapas.length - 1 ? 'Terminei o terço' : `${nomeEtapa(etapas[i + 1], 'pt')} →`;
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
    const feitos = store.get('tercosRezados', 0) + 1;
    store.set('tercosRezados', feitos);
    vibrar([20, 60, 20]);
    document.removeEventListener('keydown', teclas);
    $view.innerHTML = `
      <div class="absolvo">
        <svg class="cross" viewBox="0 0 54 80"><path d="M27 2v76M6 24h42"/></svg>
        <h2 class="rise" style="--i:3;margin-top:22px">Terço <em>rezado</em>.</h2>
        <p class="lead rise" style="--i:4">${feitos === 1 ? 'O primeiro terço rezado com o Lumen.' : `${feitos} terços rezados com o Lumen.`}</p>
        <div class="rise" style="--i:5;margin-top:26px"><a class="btn block" href="#/">Voltar ao início</a></div>
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

// ---------- Santos e festas ----------
const SEMANA_MIN = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

function telaSantos(param) {
  delayIdx = 0;
  const hoje = hojeNum();
  let sel = deIso(param) ?? hoje;
  let mes = { y: data(sel).y, m: data(sel).m };

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
      <span><b class="ls">8</b> solenidade</span><span><b>8</b> festa ou memória</span><span><b class="lm">8</b> dia de semana</span>
    </p>
    <section id="dia-sel" ${rc('dia-sel')}></section>
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Neste mês</span></p>
    <ul ${rc('rows mes-lista')}></ul>
  `);

  const $cal = $view.querySelector('.cal');
  const $dia = $view.querySelector('#dia-sel');
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
      const grau = D.principal ? D.principal.g : c ? 'm' : 'x';
      if (D.principal) destaques.push(D);
      html += `<button class="cd r-${grau}${n === hoje ? ' hoje' : ''}${n === sel ? ' sel' : ''}" data-n="${n}" aria-label="${D.d} de ${MESES[D.m - 1]}${c ? ': ' + esc(c.n) : ''}">
        <span class="cn">${D.d}</span><i class="lc lc-${D.cor}"></i>${c && grau !== 'x' ? `<span class="cs">${esc(c.n.split(',')[0])}</span>` : ''}</button>`;
    }
    $cal.innerHTML = html;
    $view.querySelector('.cal-mes').innerHTML = `${MESES[mes.m - 1]} <em>${mes.y}</em>`;
    $lista.innerHTML = destaques.length ? destaques.map((D) => `
      <li><button class="row" data-n="${D.n}">
        <span class="num">${D.d}</span>
        <span class="body"><span class="title">${D.principal.n}</span><span class="sub">${GRAUS[D.principal.g]} · ${SEMANA_MIN[D.w]}${D.principal.br ? ' · próprio do Brasil' : ''}</span></span>
        <i class="lc lc-${D.principal.c}"></i>
      </button></li>`).join('') : '<li class="muted" style="padding:16px 0">Nenhuma festa ou memória obrigatória neste mês.</li>';
  }

  function desenharDia(animar) {
    const D = dia(sel);
    const c = D.destaque;
    const outros = D.outros.filter((o) => o.n !== (c && c.n) || o.nota);
    const motivo = (o) => o.nota || (o.g === 'c' ? 'Pode ser lembrada na oração do dia.' : o.impedida ? (D.w === 0 ? 'Neste ano cai num domingo e não é celebrada.' : 'Neste ano não é celebrada, por coincidir com uma celebração maior.') : '');
    const tempoMin = D.tempo.replace(/^Tempo/, 'tempo');
    $dia.innerHTML = `
      <p class="dia-data">${SEMANA_MIN[D.w]}, ${D.d} de ${MESES[D.m - 1]} de ${D.y}${sel === hoje ? ' <span class="dot">·</span> hoje' : ''}</p>
      <p class="lit-line"><span class="lc lc-${D.cor}"></span>${D.titulo}</p>
      <p class="muted small" style="margin-top:4px">${D.tempo} · cor ${CORES[D.cor]} · Ano ${D.ano}, ${D.anoPar ? 'ano par' : 'ano ímpar'}</p>
      ${c ? `
        <p class="eyebrow grau">${GRAUS[c.g]}${c.br ? ' · próprio do Brasil' : ''}</p>
        <h2>${c.n}</h2>
        <p class="lead">${c.b}</p>
        ${c.nota ? `<p class="muted small" style="margin-top:10px">${c.nota}</p>` : ''}` : `
        <p class="eyebrow grau">Dia de semana</p>
        <h2>${D.tempo}</h2>
        <p class="lead">Nenhum santo é celebrado neste dia no calendário geral. A liturgia segue o ${tempoMin}.</p>`}
      ${outros.length ? `
        <p class="eyebrow" style="margin-top:26px">Também neste dia</p>
        <ul class="tambem">${outros.map((o) => `<li>
          <span class="t">${o.n}</span>
          <span class="g">${GRAUS[o.g]}${o.br ? ' · próprio do Brasil' : ''}</span>
          <span class="b">${o.b}</span>
          ${motivo(o) ? `<span class="nt">${motivo(o)}</span>` : ''}
        </li>`).join('')}</ul>` : ''}
      ${sel !== hoje ? `<button class="btn ghost" id="ir-hoje" style="margin-top:22px">Voltar para hoje</button>` : ''}
    `;
    if (animar) { $dia.classList.remove('swap'); void $dia.offsetWidth; $dia.classList.add('swap'); }
  }

  function escolher(n) {
    sel = n;
    const x = data(n);
    mes = { y: x.y, m: x.m };
    desenharMes();
    desenharDia(true);
    history.replaceState(null, '', n === hoje ? '#/santos' : `#/santos/${iso(n)}`);
    vibrar(6);
    const topo = $dia.getBoundingClientRect().top;
    if (topo > window.innerHeight * 0.55 || topo < 0) $dia.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ouvintes nos blocos da tela (o <main> é reaproveitado entre telas)
  const clique = (e) => {
    if (e.target.closest('#ir-hoje')) return escolher(hoje);
    const alvo = e.target.closest('[data-n]');
    if (alvo) return escolher(+alvo.dataset.n);
    const nav = e.target.closest('[data-mes]');
    if (nav) {
      const k = mes.y * 12 + (mes.m - 1) + +nav.dataset.mes;
      mes = { y: Math.floor(k / 12), m: (k % 12) + 1 };
      desenharMes();
      $cal.classList.remove('swap'); void $cal.offsetWidth; $cal.classList.add('swap');
    }
  };
  [$cal, $dia, $lista, $view.querySelector('.cal-head')].forEach((el) => el.addEventListener('click', clique));

  desenharMes();
  desenharDia(false);
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
      <span class="lbl">Língua do terço</span>
      ${langToggle()}
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
      <p class="muted">Evangelho do dia, o jogo diário do santo, e a Cela, uma pergunta de exame por noite.</p>
    </div>
    <p ${rc('muted small')} style="margin-top:24px">O calendário segue o Calendário Romano Geral e o próprio do Brasil, com as solenidades transferidas para o domingo como é costume aqui.</p>
    <p ${rc('muted small')}>Os exames foram escritos com base no Catecismo da Igreja Católica. Eles ajudam a preparar a confissão, mas não substituem a orientação de um sacerdote.</p>
  `);

  $view.querySelectorAll('[data-tema]').forEach((b) => b.addEventListener('click', () => {
    try { localStorage.setItem('lumen.theme', b.dataset.tema); } catch (e) {}
    aplicarTema(b.dataset.tema);
    $view.querySelectorAll('[data-tema]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  }));
  ligarToggle(() => toast('Língua do terço alterada'));

  $view.querySelector('#apagar').addEventListener('click', () => {
    if (!confirm('Apagar a lista, as anotações, a data da última confissão e o progresso do terço?')) return;
    ['marcados', 'nota', 'ultimaConfissao', 'tercoProgresso', 'tercosRezados', 'estados'].forEach(store.del);
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
