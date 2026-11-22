/* "Find my settings" test.
   Four rounds (font, spacing, line height, size). In each round the reader
   sees one short passage per option, in random order. We time the reading,
   check one easy question, and ask how easy it felt. The winner of a round is
   carried into the next rounds, so the result is a full set of settings. */
(function () {
  'use strict';
  var T = function (en, es) { return RL.t({ en: en, es: es }); };

  var ROUNDS = [
    { id: 'font', name: { en: 'Font', es: 'Tipografía' },
      variants: [{ font: 'verdana' }, { font: 'lexend' }, { font: 'atkinson' }, { font: 'opendyslexic' }],
      label: function (v) { return RL.fonts[v.font].label; } },
    { id: 'spacing', name: { en: 'Letter & word spacing', es: 'Espaciado entre letras y palabras' },
      variants: [{ letter: 0, word: 0 }, { letter: 0.04, word: 0.16 }, { letter: 0.12, word: 0.35 }],
      label: function (v) { return v.letter === 0 ? T('Normal', 'Normal') : v.letter < 0.1 ? T('Moderate', 'Moderado') : T('Wide', 'Amplio'); } },
    { id: 'line', name: { en: 'Line height', es: 'Interlineado' },
      variants: [{ line: 1.2 }, { line: 1.5 }, { line: 1.8 }],
      label: function (v) { return RL.fmt.line(v.line); } },
    { id: 'size', name: { en: 'Text size', es: 'Tamaño de letra' },
      variants: [{ size: 16 }, { size: 18 }, { size: 22 }],
      label: function (v) { return v.size + ' px'; } }
  ];
  var BASE = { font: 'verdana', letter: 0.04, word: 0.16, line: 1.5, size: 18 };

  var st, root;

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function words(t) { return t.trim().split(/\s+/).length; }

  function reset() {
    var n = window.RL_PASSAGES.en.length;
    st = {
      screen: 'intro', round: 0, trial: 0,
      base: Object.assign({}, BASE),
      passages: shuffle(Array.from({ length: n }, function (_, i) { return i; })),
      order: ROUNDS.map(function (r) { return shuffle(r.variants.map(function (_, i) { return i; })); }),
      results: ROUNDS.map(function () { return []; }),
      winners: [], answer: null, ease: null, t0: 0, ms: 0, optOrder: null,
      share: { session: newSession() }
    };
  }

  function current() {
    var r = ROUNDS[st.round];
    var vi = st.order[st.round][st.trial];
    var pIndex = st.passages[ROUNDS.slice(0, st.round).reduce(function (a, x) { return a + x.variants.length; }, 0) + st.trial];
    return { r: r, vi: vi, v: r.variants[vi], p: window.RL_PASSAGES[RL.lang][pIndex], pIndex: pIndex };
  }

  function progressBar() {
    return '<div class="progress" aria-hidden="true">' + ROUNDS.map(function (_, i) {
      return '<span class="' + (i < st.round || st.screen === 'results' ? 'done' : i === st.round ? 'now' : '') + '"></span>';
    }).join('') + '</div>';
  }
  function heading() {
    var c = current();
    return '<p class="eyebrow">' + T('Round', 'Ronda') + ' ' + (st.round + 1) + '/' + ROUNDS.length + ' · ' + RL.t(c.r.name) +
      ' — ' + T('text', 'texto') + ' ' + (st.trial + 1) + '/' + c.r.variants.length + '</p>';
  }

  function render() {
    var h = '';
    if (st.screen === 'intro') h = intro();
    else if (st.screen === 'ready') h = progressBar() + '<div class="test-stage">' + heading() +
      '<h2 style="margin-top:.2em">' + T('Ready?', '¿Listo/a?') + '</h2>' +
      '<p>' + T('Press <strong>Start</strong>, read the text silently at your usual pace, then press <strong>I’m done</strong>. You will answer one easy question about it.',
        'Presiona <strong>Empezar</strong>, lee el texto en silencio a tu ritmo de siempre y luego presiona <strong>Terminé</strong>. Después responderás una pregunta fácil.') + '</p>' +
      '<button class="btn" data-act="start">' + T('Start', 'Empezar') + '</button></div>';
    else if (st.screen === 'reading') h = progressBar() + '<div class="test-stage">' + heading() +
      '<div class="reading" id="reading"><p>' + RL.esc(current().p.text) + '</p></div>' +
      '<div class="btn-row" style="margin-top:1.5rem"><button class="btn" data-act="done">' + T('I’m done', 'Terminé') + '</button></div></div>';
    else if (st.screen === 'question') h = question();
    else if (st.screen === 'summary') h = summary();
    else if (st.screen === 'results') h = results();
    root.innerHTML = h;
    if (st.screen === 'reading') {
      var c = current();
      RL.applyTo(document.getElementById('reading'), Object.assign({}, st.base, c.v));
    }
    if (st.screen === 'results') {
      RL.renderDA(document.getElementById('daResult'), finalSettings());
    }
    var first = root.querySelector('[data-focus], .btn');
    if (first && st.screen !== 'intro') first.focus({ preventScroll: true });
  }

  function intro() {
    return '<div class="test-stage">' +
      '<h2 style="margin-top:0">' + T('How it works', 'Cómo funciona') + '</h2>' +
      '<ol>' +
      '<li>' + T('You will read 13 short texts (about 50 words each). It takes about 5 minutes.', 'Vas a leer 13 textos cortos (unas 50 palabras cada uno). Toma unos 5 minutos.') + '</li>' +
      '<li>' + T('Each text uses a different font or spacing. We time how long you take and ask one easy question so you read normally, not skim.', 'Cada texto usa una fuente o un espaciado distinto. Medimos cuánto tardas y hacemos una pregunta fácil para que leas normal, sin saltarte partes.') + '</li>' +
      '<li>' + T('After each text you rate how easy it felt. Both your speed and your comfort count.', 'Después de cada texto indicas qué tan fácil te resultó. Cuentan tanto tu velocidad como tu comodidad.') + '</li>' +
      '<li>' + T('At the end you get your settings, ready to copy into DyslexiaAway.', 'Al final recibes tus ajustes, listos para copiar en DyslexiaAway.') + '</li>' +
      '</ol>' +
      '<p class="small muted">' + T('Use the device you normally read on, in a quiet moment. This is not a dyslexia test or a diagnosis — it only compares text styles for you. Anonymous results (options, speeds, ratings) are recorded to learn what works for people.',
        'Usa el dispositivo en que lees normalmente, en un momento tranquilo. Esto no es un test de dislexia ni un diagnóstico: solo compara estilos de texto para ti. Se registran resultados anónimos (opciones, velocidades, notas) para saber qué le funciona a la gente.') + '</p>' +
      '<button class="btn" data-act="begin">' + T('Begin the test', 'Comenzar la prueba') + '</button></div>';
  }

  function question() {
    var c = current();
    if (!st.optOrder) st.optOrder = shuffle([0, 1, 2]);
    var opts = st.optOrder.map(function (i) {
      return '<button class="btn ghost" data-act="answer" data-i="' + i + '" aria-pressed="' + (st.answer === i) + '">' + RL.esc(c.p.o[i]) + '</button>';
    }).join('');
    var ease = [1, 2, 3, 4, 5].map(function (n) {
      return '<button class="btn ghost" data-act="ease" data-n="' + n + '" aria-pressed="' + (st.ease === n) + '">' + n + '</button>';
    }).join('');
    var ready = st.answer !== null && st.ease !== null;
    return progressBar() + '<div class="test-stage">' + heading() +
      '<h2 style="margin-top:.2em" data-focus tabindex="-1">' + RL.esc(c.p.q) + '</h2>' +
      '<div class="options" role="group">' + opts + '</div>' +
      '<h3>' + T('How easy was that text to read?', '¿Qué tan fácil fue leer ese texto?') + '</h3>' +
      '<div class="ease" role="group">' + ease + '</div>' +
      '<div class="ease-ends"><span>1 · ' + T('very hard', 'muy difícil') + '</span><span>5 · ' + T('very easy', 'muy fácil') + '</span></div>' +
      '<div class="btn-row" style="margin-top:1.5rem"><button class="btn" data-act="next"' + (ready ? '' : ' disabled style="opacity:.5;cursor:not-allowed"') + '>' + T('Next', 'Siguiente') + '</button></div></div>';
  }

  // Score: 60% relative speed (penalised if the answer was wrong), 40% comfort.
  function scoreRound(i) {
    var rs = st.results[i];
    var valid = rs.filter(function (x) { return !x.skim; });
    var max = Math.max.apply(null, (valid.length ? valid : rs).map(function (x) { return x.wpm; }));
    rs.forEach(function (x) {
      var speed = x.skim ? 0.5 : x.wpm / max;
      x.score = 0.6 * speed * (x.correct ? 1 : 0.75) + 0.4 * (x.ease / 5);
    });
    return rs.slice().sort(function (a, b) { return b.score - a.score; })[0];
  }

  function bars(i) {
    var r = ROUNDS[i];
    var rs = st.results[i];
    var win = st.winners[i];
    return '<div class="bars">' + rs.slice().sort(function (a, b) { return a.vi - b.vi; }).map(function (x) {
      return '<div class="bar-row' + (x === win ? ' win' : '') + '"><span>' + r.label(r.variants[x.vi]) + (x === win ? ' ✓' : '') + '</span>' +
        '<span class="bar"><i style="width:' + Math.round(x.score * 100) + '%"></i></span>' +
        '<span class="small">' + (x.skim ? '—' : x.wpm + ' ' + T('wpm', 'ppm')) + '</span></div>';
    }).join('') + '</div>';
  }

  function summary() {
    var i = st.round;
    var r = ROUNDS[i];
    var win = st.winners[i];
    return progressBar() + '<div class="test-stage">' +
      '<p class="eyebrow">' + T('Round', 'Ronda') + ' ' + (i + 1) + '/' + ROUNDS.length + ' · ' + RL.t(r.name) + '</p>' +
      '<h2 style="margin-top:.2em" data-focus tabindex="-1">' + T('Best for you so far: ', 'Lo mejor para ti por ahora: ') + r.label(r.variants[win.vi]) + '</h2>' +
      bars(i) +
      '<p class="small muted">' + T('Bars combine speed (words per minute) and how easy it felt. ', 'Las barras combinan velocidad (palabras por minuto) y qué tan fácil te resultó. ') +
      (i < ROUNDS.length - 1 ? T('The next rounds will use this choice.', 'Las siguientes rondas usarán esta opción.') : '') + '</p>' +
      '<button class="btn" data-act="continue">' + (i < ROUNDS.length - 1 ? T('Next round', 'Siguiente ronda') : T('See my settings', 'Ver mis ajustes')) + '</button></div>';
  }

  function finalSettings() {
    var cur = RL.loadSettings();
    return Object.assign({}, cur, st.base);
  }

  function results() {
    var s = finalSettings();
    var rows = ROUNDS.map(function (r, i) {
      return '<h3>' + RL.t(r.name) + '</h3>' + bars(i);
    }).join('');
    var close = ROUNDS.some(function (r, i) {
      var sorted = st.results[i].slice().sort(function (a, b) { return b.score - a.score; });
      return sorted[1] && sorted[0].score - sorted[1].score < 0.05;
    });
    return progressBar() +
      '<h2 style="margin-top:0" data-focus tabindex="-1">' + T('Your reading settings', 'Tus ajustes de lectura') + '</h2>' +
      '<p class="lede">' + T('Saved in this browser. The <a href="index.html">playground</a> now shows them, so you can fine-tune by eye.', 'Quedaron guardados en este navegador. El <a href="index.html">probador</a> ya los muestra, así que puedes afinarlos a ojo.') + '</p>' +
      '<div class="result-grid">' +
      '<div class="card"><p class="small muted" style="margin-top:0">' + T('Preview', 'Vista previa') + '</p><div id="finalPreview" style="' + previewStyle(s) + '">' +
      RL.esc(T('Reading is a skill we can make easier with small changes to how text is laid out.', 'La lectura es una habilidad que podemos facilitar con pequeños cambios en el diseño del texto.')) + '</div></div>' +
      '<div class="card da-card" id="daResult"></div></div>' +
      (close ? '<div class="note"><p>' + T('Some options were very close. Small differences can be noise — try the close ones again in the playground, or retake the test on another day.',
        'Algunas opciones quedaron muy parejas. Diferencias pequeñas pueden ser ruido: prueba las más parejas en el probador o repite la prueba otro día.') + '</p></div>' : '') +
      '<div class="btn-row" style="margin:1.25rem 0"><a class="btn" href="index.html">' + T('Fine-tune in the playground', 'Afinar en el probador') + '</a>' +
      '<a class="btn ghost" href="extension.html#setup">' + T('Set up DyslexiaAway', 'Configurar DyslexiaAway') + '</a>' +
      '<button class="btn ghost" data-act="restart">' + T('Take the test again', 'Repetir la prueba') + '</button></div>' +
      '<details class="card"><summary><strong>' + T('Round-by-round details', 'Detalle por ronda') + '</strong></summary>' + rows +
      '<p class="small muted">' + T('Score = 60% relative reading speed (×0.75 if the question was answered wrong) + 40% your ease rating. Readings faster than 600 words per minute are treated as skimmed.',
        'Puntaje = 60 % velocidad de lectura relativa (×0,75 si la pregunta se respondió mal) + 40 % tu nota de facilidad. Lecturas de más de 600 palabras por minuto se consideran saltadas.') + '</p></details>';
  }

  /* ---------- Anonymous results ----------
     After each round, the picks so far are posted to a Google Form owned by
     the site author, so we also learn from people who stop halfway. Sent:
     options tried and picked, reading speeds, ease ratings, language, phone or
     computer and a random per-run session id. No name, email or free text.
     Choice values must match the form's options exactly. */
  var FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSdV2ugKmMYyz9_GZDT_1h1lb5E8EiCgKMLD7HH8wso2XdKClg/formResponse';
  var ENTRY = { lang: 'entry.836909325', font: 'entry.1583997910', spacing: 'entry.878805186', line: 'entry.1537700215',
    size: 'entry.29104906', dyslexia: 'entry.598039293', device: 'entry.1974565502', details: 'entry.272849477',
    version: 'entry.1217212956', session: 'entry.622483805', stage: 'entry.1430363883' };
  function newSession() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  // Canonical (English) labels, independent of the UI language.
  function canon(roundId, v) {
    if (roundId === 'font') return RL.fonts[v.font].label;
    if (roundId === 'spacing') return v.letter === 0 ? 'Normal' : v.letter < 0.1 ? 'Moderate' : 'Wide';
    if (roundId === 'line') return RL.fmt.line(v.line);
    return v.size + ' px';
  }
  function roundData(upto) {
    var d = new URLSearchParams();
    var details = { v: 2, rounds: {} };
    ROUNDS.slice(0, upto + 1).forEach(function (r, i) {
      d.append(ENTRY[r.id], canon(r.id, r.variants[st.winners[i].vi]));
      details.rounds[r.id] = st.results[i].map(function (x) {
        return { opt: canon(r.id, r.variants[x.vi]), wpm: x.wpm, ease: x.ease, correct: x.correct, skim: x.skim };
      });
    });
    d.append(ENTRY.lang, RL.lang);
    d.append(ENTRY.device, (matchMedia('(pointer: coarse)').matches || innerWidth < 760) ? 'Mobile' : 'Desktop');
    d.append(ENTRY.details, JSON.stringify(details));
    d.append(ENTRY.version, '2');
    d.append(ENTRY.session, st.share.session);
    d.append(ENTRY.stage, upto === ROUNDS.length - 1 ? 'complete' : ROUNDS[upto].id);
    return d;
  }
  function sendRound(upto) {
    fetch(FORM, { method: 'POST', mode: 'no-cors', body: roundData(upto), keepalive: true }).catch(function () {});
  }
  function previewStyle(s) {
    return 'font-family:' + RL.fonts[s.font].css.replace(/"/g, "'") + ';letter-spacing:' + s.letter + 'em;word-spacing:' + s.word + 'em;line-height:' + s.line + ';font-size:' + s.size + 'px';
  }

  function onClick(e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    var act = b.dataset.act;
    if (act === 'begin') { st.screen = 'ready'; }
    else if (act === 'start') { st.screen = 'reading'; st.t0 = performance.now(); }
    else if (act === 'done') { st.ms = performance.now() - st.t0; st.screen = 'question'; st.answer = null; st.ease = null; st.optOrder = null; }
    else if (act === 'answer') { st.answer = +b.dataset.i; }
    else if (act === 'ease') { st.ease = +b.dataset.n; }
    else if (act === 'next') {
      var c = current();
      var wpm = Math.round(words(c.p.text) / (st.ms / 60000));
      st.results[st.round].push({ vi: c.vi, wpm: wpm, skim: wpm > 600, correct: st.answer === 0, ease: st.ease });
      st.trial++;
      if (st.trial >= c.r.variants.length) {
        var win = scoreRound(st.round);
        st.winners[st.round] = win;
        Object.assign(st.base, c.r.variants[win.vi]);
        sendRound(st.round);
        st.screen = 'summary';
      } else st.screen = 'ready';
    }
    else if (act === 'continue') {
      if (st.round < ROUNDS.length - 1) { st.round++; st.trial = 0; st.screen = 'ready'; }
      else { st.screen = 'results'; RL.saveSettings(finalSettings()); }
    }
    else if (act === 'restart') { reset(); }
    render();
    var top = root.getBoundingClientRect().top + window.scrollY - 80;
    if (window.scrollY > top) window.scrollTo(0, Math.max(0, top));
  }

  document.addEventListener('DOMContentLoaded', function () {
    root = document.getElementById('test');
    reset();
    root.addEventListener('click', onClick);
    document.addEventListener('rl:lang', render);
    render();
  });
})();
