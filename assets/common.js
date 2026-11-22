/* Reading Lab — shared helpers: language, theme, settings, header/footer,
   and the "copy these into DyslexiaAway" card. No build step, no tracking. */
(function () {
  'use strict';
  var RL = (window.RL = {});
  var KEY = { lang: 'rl.lang', theme: 'rl.theme', settings: 'rl.settings' };
  var REPO = 'https://github.com/nifalconi/dyslexia-reading-lab';
  RL.REPO = REPO;
  RL.DA = {
    chrome: 'https://chromewebstore.google.com/detail/dyslexiaaway/cdlibplbalgnomagghdgogdofiphhjce',
    firefox: 'https://addons.mozilla.org/firefox/addon/dyslexiaaway/',
    source: 'https://github.com/ernvk23/dyslexia-away'
  };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Language ---------- */
  RL.lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  RL.t = function (pair) { return pair[RL.lang] != null ? pair[RL.lang] : pair.en; };
  RL.setLang = function (lang) {
    RL.lang = lang === 'es' ? 'es' : 'en';
    document.documentElement.lang = RL.lang;
    store(KEY.lang, RL.lang);
    var title = document.documentElement.getAttribute('data-title-' + RL.lang);
    if (title) document.title = title;
    renderHeader();
    document.dispatchEvent(new CustomEvent('rl:lang', { detail: RL.lang }));
  };

  /* ---------- Theme ---------- */
  RL.setTheme = function (theme) {
    document.documentElement.dataset.theme = theme;
    store(KEY.theme, theme);
    renderHeader();
  };

  /* ---------- Fonts & settings ---------- */
  // `da` describes how to pick the same font in DyslexiaAway's "Font" menu.
  RL.fonts = {
    verdana: { label: 'Verdana', css: 'Verdana, "DejaVu Sans", "Bitstream Vera Sans", sans-serif', da: { custom: 'Verdana' } },
    arial: { label: 'Arial', css: 'Arial, "Liberation Sans", Helvetica, sans-serif', da: { custom: 'Arial' } },
    lexend: { label: 'Lexend', css: '"Lexend", sans-serif', da: { builtin: 'Lexend' } },
    atkinson: { label: 'Atkinson Hyperlegible', css: '"Atkinson Hyperlegible Next", sans-serif', da: { builtin: 'Atkinson Hyperlegible Next' } },
    andika: { label: 'Andika', css: '"Andika", sans-serif', da: { builtin: 'Andika' } },
    opendyslexic: { label: 'OpenDyslexic', css: '"OpenDyslexic", sans-serif', da: { builtin: 'OpenDyslexic' } }
  };
  // Recommended starting point (see guide.html for the reasoning and sources).
  RL.DEFAULTS = { font: 'verdana', letter: 0.04, word: 0.16, line: 1.5, size: 18, bg: 'dark' };

  RL.loadSettings = function () {
    var s = {};
    try { s = JSON.parse(store(KEY.settings) || '{}') || {}; } catch (e) { s = {}; }
    var out = Object.assign({}, RL.DEFAULTS, s);
    if (!RL.fonts[out.font]) out.font = RL.DEFAULTS.font;
    return out;
  };
  RL.saveSettings = function (s) { store(KEY.settings, JSON.stringify(s)); };

  RL.applyTo = function (el, s) {
    el.style.fontFamily = RL.fonts[s.font].css;
    el.style.letterSpacing = s.letter + 'em';
    el.style.wordSpacing = s.word + 'em';
    el.style.lineHeight = String(s.line);
    el.style.fontSize = s.size + 'px';
  };

  RL.fmt = {
    em: function (v) { return (Math.round(v * 100) / 100).toFixed(2) + ' em'; },
    px: function (em, size) { return '≈ ' + (Math.round(em * size * 10) / 10).toFixed(1) + ' px'; },
    line: function (v) { return (Math.round(v * 100) / 100).toFixed(2); }
  };

  /* ---------- DyslexiaAway card ---------- */
  // Labels match the extension's own popup text (en / es locales, v1.14).
  var DA_TXT = {
    title: { en: 'Your settings for DyslexiaAway', es: 'Tus ajustes para DyslexiaAway' },
    sub: { en: 'Open the extension and copy these values.', es: 'Abre la extensión y copia estos valores.' },
    font: { en: 'Font', es: 'Fuente' },
    letter: { en: 'Letter Spacing', es: 'Espaciado letras' },
    word: { en: 'Word Spacing', es: 'Espaciado palabras' },
    line: { en: 'Line Height', es: 'Altura línea' },
    size: { en: 'Text size', es: 'Tamaño de letra' },
    custom: { en: 'Custom → type “%s”', es: 'Personalizada → escribe “%s”' },
    sizeHint: {
      en: 'DyslexiaAway does not change text size. Set %s px as your browser’s default font size, or use zoom (Ctrl/⌘ +).',
      es: 'DyslexiaAway no cambia el tamaño de letra. Pon %s px como tamaño de fuente predeterminado del navegador, o usa el zoom (Ctrl/⌘ +).'
    },
    copy: { en: 'Copy settings', es: 'Copiar ajustes' },
    copied: { en: 'Copied ✓', es: 'Copiado ✓' },
    how: { en: 'Step-by-step setup', es: 'Configuración paso a paso' }
  };
  RL.daRows = function (s) {
    var f = RL.fonts[s.font].da;
    return [
      [RL.t(DA_TXT.font), f.custom ? RL.t(DA_TXT.custom).replace('%s', f.custom) : f.builtin],
      [RL.t(DA_TXT.letter), RL.fmt.em(s.letter)],
      [RL.t(DA_TXT.word), RL.fmt.em(s.word)],
      [RL.t(DA_TXT.line), RL.fmt.line(s.line)],
      [RL.t(DA_TXT.size), s.size + ' px *']
    ];
  };
  RL.daText = function (s) {
    return 'DyslexiaAway\n' + RL.daRows(s).map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
      '\n* ' + RL.t(DA_TXT.sizeHint).replace('%s', s.size);
  };
  RL.renderDA = function (el, s, opts) {
    opts = opts || {};
    var rows = RL.daRows(s).map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    el.innerHTML =
      '<h3>' + RL.t(DA_TXT.title) + '</h3>' +
      '<p class="muted small" style="margin:0">' + RL.t(DA_TXT.sub) + '</p>' +
      '<dl>' + rows + '</dl>' +
      '<p class="hint">* ' + esc(RL.t(DA_TXT.sizeHint).replace('%s', s.size)) + '</p>' +
      '<div class="btn-row"><button type="button" class="btn ghost" data-copy>' + RL.t(DA_TXT.copy) + '</button>' +
      (opts.hideHow ? '' : '<a class="btn ghost" href="extension.html#setup">' + RL.t(DA_TXT.how) + '</a>') + '</div>';
    var b = el.querySelector('[data-copy]');
    b.addEventListener('click', function () {
      var done = function () { b.textContent = RL.t(DA_TXT.copied); setTimeout(function () { b.textContent = RL.t(DA_TXT.copy); }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(RL.daText(s)).then(done, done); else done();
    });
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  RL.esc = esc;

  /* ---------- Header & footer ---------- */
  var NAV = [
    ['index.html', 'try', { en: 'Try it', es: 'Probar' }],
    ['test.html', 'test', { en: 'Find my settings', es: 'Encontrar mis ajustes' }],
    ['guide.html', 'guide', { en: 'Guide & research', es: 'Guía e investigación' }],
    ['extension.html', 'extension', { en: 'DyslexiaAway', es: 'DyslexiaAway' }]
  ];
  function renderHeader() {
    var h = document.getElementById('site-header');
    if (!h) return;
    var page = document.body.dataset.page;
    var dark = document.documentElement.dataset.theme === 'dark';
    h.className = 'site-header';
    h.innerHTML =
      '<div class="inner">' +
      '<a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">Aa</span>' + RL.t({ en: 'Reading Lab', es: 'Laboratorio de lectura' }) + '</a>' +
      '<nav class="nav" aria-label="' + RL.t({ en: 'Main', es: 'Principal' }) + '">' +
      NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[1] === page ? ' aria-current="page"' : '') + '>' + RL.t(n[2]) + '</a>'; }).join('') +
      '</nav>' +
      '<div class="toggles">' +
      '<button type="button" class="chip-btn" data-lang-toggle aria-label="' + RL.t({ en: 'Cambiar a español', es: 'Switch to English' }) + '">' +
      (RL.lang === 'en' ? '<b>EN</b> · ES' : 'EN · <b>ES</b>') + '</button>' +
      '<button type="button" class="chip-btn" data-theme-toggle>' + (dark ? RL.t({ en: 'Light', es: 'Claro' }) : RL.t({ en: 'Dark', es: 'Oscuro' })) + '</button>' +
      '</div></div>';
    h.querySelector('[data-lang-toggle]').onclick = function () { RL.setLang(RL.lang === 'en' ? 'es' : 'en'); };
    h.querySelector('[data-theme-toggle]').onclick = function () { RL.setTheme(dark ? 'light' : 'dark'); };
  }
  function renderFooter() {
    var f = document.getElementById('site-footer');
    if (!f) return;
    f.className = 'site-footer';
    f.innerHTML = '<div class="inner">' +
      '<span data-lang="en">A free, open-source reading aid. Not a diagnosis or treatment. The only thing recorded is anonymous test results (options, reading speeds, ratings). Fonts under the SIL Open Font License. </span>' +
      '<span data-lang="es">Una ayuda de lectura gratuita y de código abierto. No es un diagnóstico ni un tratamiento. Lo único que se registra son resultados anónimos de la prueba (opciones, velocidades, notas). Fuentes bajo la licencia SIL Open Font License. </span>' +
      '<a href="' + REPO + '">GitHub</a></div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var title = document.documentElement.getAttribute('data-title-' + RL.lang);
    if (title) document.title = title;
    renderHeader();
    renderFooter();
  });
})();
