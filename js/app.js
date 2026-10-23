import { EXAMES, ESTADOS, PASSOS, CONTRICAO } from './data/exames.js';
import { ORACOES, MISTERIOS, POR_DIA, ORDINAIS, INTENCOES_INICIAIS, montarTerco } from './data/terco.js';

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
    <hr ${rc('rule')}>
    <blockquote ${rc('quote')}>“${frase.x}”<cite>${frase.a}</cite></blockquote>
    <hr ${rc('rule')}>
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
    <p ${rc('lead')}>Conta por conta, em português ou em latim. Toque na tela para avançar.</p>
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

function telaAprender() {
  delayIdx = 0;
  const ordem = ['sinal', 'credo', 'pai', 'ave', 'gloria', 'fatima', 'salve'];
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
    <p ${r()}><span class="eyebrow">As orações · português e latim</span></p>
    ${ordem.map((k) => {
      const o = ORACOES[k];
      return `<div ${rc('prayer-block')}>
        <h3>${o.pt.t} <span class="muted" style="font-size:18px;font-style:italic">· ${o.la.t}</span></h3>
        <p class="pt">${o.pt.x}${o.pt.r ? `<br><span class="muted">℣.</span> ${o.pt.r[0]}<br><span class="muted">℟.</span> ${o.pt.r[1]}` : ''}</p>
        <p class="la">${o.la.x}${o.la.r ? `<br>℣. ${o.la.r[0]}<br>℟. ${o.la.r[1]}` : ''}</p>
      </div>`;
    }).join('')}
    <div ${r()} style="margin-top:28px"><a class="btn solid block" href="#/terco/rezar/${POR_DIA[new Date().getDay()]}">Rezar o terço de hoje</a></div>
  `);
}

function telaRezar(conjunto) {
  delayIdx = 0;
  if (!MISTERIOS[conjunto]) conjunto = POR_DIA[new Date().getDay()];
  const M = MISTERIOS[conjunto];
  const passos = montarTerco(conjunto);
  const prog = store.get('tercoProgresso', null);
  let i = prog && prog.dia === hojeKey() && prog.conjunto === conjunto ? Math.min(prog.i, passos.length - 1) : 0;

  render(`
    <div class="pray">
      <div class="pray-top rise" style="--i:0">
        <a class="back" href="#/terco" style="margin:0">${ICON_BACK} Sair</a>
        ${langToggle()}
      </div>
      <div class="progress rise" style="--i:1"><i></i></div>
      <div class="pray-stage" role="button" tabindex="0" aria-live="polite"></div>
      <div class="beads" aria-hidden="true"></div>
      <div class="pray-nav">
        <button class="btn ghost" id="voltar">Voltar</button>
        <button class="btn solid" id="avancar">Avançar</button>
      </div>
    </div>
  `);

  const $stage = $view.querySelector('.pray-stage');
  const $beads = $view.querySelector('.beads');
  const $bar = $view.querySelector('.progress i');

  function onde(p, l) {
    if (p.grupo === 'inicio') return l === 'la' ? 'Initium' : 'Início';
    if (p.grupo === 'fim') return l === 'la' ? 'Finis' : 'Conclusão';
    return l === 'la' ? `Mysterium ${ORDINAIS.la[p.grupo]}` : `${ORDINAIS.pt[p.grupo]} mistério`;
  }

  function desenhar(animar) {
    const l = lingua();
    const p = passos[i];
    let titulo, texto, alt = '', mist = '';

    if (p.grupo !== 'inicio' && p.grupo !== 'fim') {
      const it = M.itens[p.grupo];
      mist = l === 'la' ? `${it.la} · ${it.pt}` : `${it.pt}`;
    }

    if (p.o === 'anuncio') {
      const it = M.itens[p.grupo];
      titulo = l === 'la' ? it.la : it.pt;
      texto = l === 'la' ? `${M.la}. ${it.pt}.` : `Contemplamos neste mistério: ${it.pt.charAt(0).toLowerCase() + it.pt.slice(1)}.`;
      alt = it.ref;
      mist = l === 'la' ? M.la : M.pt;
    } else {
      const o = ORACOES[p.o][l];
      titulo = o.t;
      texto = esc(o.x);
      if (o.r) texto += `<br><span class="resp">℣.</span> ${o.r[0]}<br><span class="resp">℟.</span> ${o.r[1]}`;
      if (p.o === 'ave') {
        titulo += ` <span class="muted" style="font-size:24px">${p.n + 1}${p.grupo === 'inicio' ? '/3' : '/10'}</span>`;
        if (p.grupo === 'inicio') alt = INTENCOES_INICIAIS[l][p.intencao];
      }
      if (l === 'la' && !alt) alt = ORACOES[p.o].pt.x;
    }

    $stage.innerHTML = `
      <div class="where">${onde(p, l)}</div>
      ${mist ? `<div class="mystery">${mist}</div>` : ''}
      <div class="ptitle">${titulo}</div>
      <div class="ptext">${texto}</div>
      ${alt ? `<div class="alt">${esc(alt)}</div>` : ''}
    `;
    if (animar) { $stage.classList.remove('swap'); void $stage.offsetWidth; $stage.classList.add('swap'); }

    // contas do grupo atual
    const doGrupo = passos.map((x, k) => ({ ...x, k })).filter((x) => x.grupo === p.grupo && x.conta);
    $beads.innerHTML = doGrupo.map((x) => `<span class="bead ${x.conta === 'pequena' ? '' : 'big'} ${x.k < i ? 'done' : ''} ${x.k === i ? 'now' : ''}"></span>`).join('');

    $bar.style.width = `${((i + 1) / passos.length) * 100}%`;
    $view.querySelector('#voltar').disabled = i === 0;
    $view.querySelector('#avancar').textContent = i === passos.length - 1 ? 'Concluir' : 'Avançar';
    store.set('tercoProgresso', { dia: hojeKey(), conjunto, i });
  }

  function avancar() {
    if (i >= passos.length - 1) return concluir();
    i++;
    const p = passos[i];
    vibrar(p.o === 'anuncio' ? 30 : 6);
    desenhar(true);
  }
  function voltar() { if (i > 0) { i--; desenhar(true); } }

  function concluir() {
    store.del('tercoProgresso');
    const feitos = store.get('tercosRezados', 0) + 1;
    store.set('tercosRezados', feitos);
    vibrar([20, 60, 20]);
    $view.querySelector('.pray').innerHTML = `
      <div class="absolvo" style="margin:auto 0">
        <svg class="cross" viewBox="0 0 54 80"><path d="M27 2v76M6 24h42"/></svg>
        <h2 class="rise" style="--i:3;margin-top:22px">Terço <em>rezado</em>.</h2>
        <p class="lead rise" style="--i:4">${feitos === 1 ? 'O primeiro terço rezado com o Lumen.' : `${feitos} terços rezados com o Lumen.`}</p>
        <div class="rise" style="--i:5;margin-top:26px"><a class="btn block" href="#/">Voltar ao início</a></div>
      </div>`;
    document.removeEventListener('keydown', teclas);
  }

  function teclas(e) {
    if (!location.hash.startsWith('#/terco/rezar')) return document.removeEventListener('keydown', teclas);
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); avancar(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); voltar(); }
  }

  $stage.addEventListener('click', avancar);
  $view.querySelector('#avancar').addEventListener('click', avancar);
  $view.querySelector('#voltar').addEventListener('click', voltar);
  document.addEventListener('keydown', teclas);

  // deslizar para os lados no celular
  let x0 = null;
  $stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  $stage.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (dx > 60) { voltar(); e.preventDefault(); }
    x0 = null;
  });

  ligarToggle(() => desenhar(true));
  desenhar(false);
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
    <p ${rc('lead')}>Exame de consciência e terço, na palma da mão.</p>
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
      <p class="muted">Evangelho do dia, calendário dos santos e das festas da Igreja, o jogo diário do santo, e a Cela, uma pergunta de exame por noite.</p>
    </div>
    <p ${rc('muted small')} style="margin-top:24px">Os exames foram escritos com base no Catecismo da Igreja Católica. Eles ajudam a preparar a confissão, mas não substituem a orientação de um sacerdote.</p>
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
