/* Playground: live preview of font + spacing, saved to localStorage and
   shared with the test and the DyslexiaAway setup page. */
(function () {
  'use strict';
  // Sample texts. Pick one with the "Sample text" chips under the preview;
  // the preview is also editable, so people can paste their own.
  var SAMPLES = [
    { id: 'macondo', name: { en: 'Macondo', es: 'Macondo' },
      credit: { en: 'Gabriel García Márquez, <cite>One Hundred Years of Solitude</cite> (trans. Gregory Rabassa).', es: 'Gabriel García Márquez, <cite>Cien años de soledad</cite>.' },
      en: '<p>Many years later as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice. At that time Macondo was a village of twenty adobe houses, built on the bank of a river of clear water that ran along a bed of polished stones, which were white and enormous, like prehistoric eggs. The world was so recent that many things lacked names, and in order to indicate them it was necessary to point.</p>',
      es: '<p>Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo. Macondo era entonces una aldea de veinte casas de barro y cañabrava construidas a la orilla de un río de aguas diáfanas que se precipitaban por un lecho de piedras pulidas, blancas y enormes como huevos prehistóricos. El mundo era tan reciente, que muchas cosas carecían de nombre, y para mencionarlas había que señalarlas con el dedo.</p>' },
    { id: 'ice', name: { en: 'On the ice', es: 'Sobre el hielo' },
      credit: { en: '<cite>Disco Elysium</cite> (ZA/UM, 2019).', es: '<cite>Disco Elysium</cite> (ZA/UM, 2019). Traducción propia.' },
      en: '<p>“I’m sorry you have to sit here on the ice with the drugs wearing off. At your age — or at any age — in this weather… waiting for it to get dark.”</p><p>She looks you in the eye, her pupils wide, surrounded by a ridiculous amount of make-up.</p><p>“The people who built this world intended it to be better for you, but they failed. It is easier to live in their failure with this by your side.”</p>',
      es: '<p>—Siento que tengas que estar sentada aquí sobre el hielo mientras se te pasa el efecto de las drogas. A tu edad —o a cualquier edad—, con este tiempo… esperando a que oscurezca.</p><p>Te mira a los ojos, con las pupilas dilatadas, rodeadas de una cantidad ridícula de maquillaje.</p><p>—La gente que construyó este mundo quería que fuera mejor para ti, pero fracasó. Es más fácil vivir en su fracaso con esto a tu lado.</p>' },
    { id: 'plain', name: { en: 'Everyday text', es: 'Texto cotidiano' },
      credit: { en: 'Written for this site.', es: 'Escrito para este sitio.' },
      en: '<p>Reading is a skill we can make easier with small changes to how text is laid out. Space helps us tell letters and words apart.</p><p>Try moving one slider at a time and read this paragraph again. Notice which version lets your eyes move along the line without slipping.</p>',
      es: '<p>La lectura es una habilidad que podemos facilitar con pequeños cambios en el diseño del texto. El espacio ayuda a distinguir mejor las letras y palabras.</p><p>Prueba a mover un control a la vez y vuelve a leer este párrafo. Fíjate en qué versión tus ojos avanzan por la línea sin perderse.</p>' }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var s = RL.loadSettings();
    var stage = document.getElementById('stage');
    var edited = false;
    var $ = function (id) { return document.getElementById(id); };
    var sliders = { letter: $('letter'), word: $('word'), line: $('line'), size: $('size') };

    // Font radio pills
    var fo = $('fontOptions');
    fo.innerHTML = Object.keys(RL.fonts).map(function (k) {
      return '<label style="font-family:' + RL.fonts[k].css.replace(/"/g, '&quot;') + '"><input type="radio" name="font" value="' + k + '"> ' + RL.fonts[k].label + '</label>';
    }).join('');
    fo.addEventListener('change', function (e) { s.font = e.target.value; update(); });

    Object.keys(sliders).forEach(function (k) {
      sliders[k].addEventListener('input', function () { s[k] = parseFloat(sliders[k].value); update(); });
    });

    document.querySelectorAll('.swatch').forEach(function (b) {
      b.addEventListener('click', function () { s.bg = b.dataset.bg; update(); });
    });

    $('reset').addEventListener('click', function () { s = Object.assign({}, RL.DEFAULTS, { bg: s.bg }); update(); });
    // Sample text chips (clicking the active one restores it after editing)
    var sampleId = SAMPLES[0].id;
    try { sampleId = localStorage.getItem('rl.sample') || sampleId; } catch (e) { /* ignore */ }
    if (!SAMPLES.some(function (x) { return x.id === sampleId; })) sampleId = SAMPLES[0].id;
    function showSample() {
      var x = SAMPLES.filter(function (y) { return y.id === sampleId; })[0];
      edited = false;
      stage.innerHTML = x[RL.lang];
      $('sampleCredit').innerHTML = RL.t(x.credit);
      $('samples').innerHTML = SAMPLES.map(function (y) {
        return '<button type="button" class="chip-btn" data-sample="' + y.id + '" aria-pressed="' + (y.id === sampleId) + '">' + RL.t(y.name) + '</button>';
      }).join('');
    }
    $('samples').addEventListener('click', function (e) {
      var b = e.target.closest('[data-sample]');
      if (!b) return;
      sampleId = b.dataset.sample;
      try { localStorage.setItem('rl.sample', sampleId); } catch (err) { /* ignore */ }
      showSample();
    });
    stage.addEventListener('input', function () { edited = true; });

    function update() {
      RL.applyTo(stage, s);
      stage.dataset.bg = s.bg;
      document.querySelectorAll('.swatch').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.bg === s.bg)); });
      fo.querySelectorAll('input').forEach(function (i) { i.checked = i.value === s.font; });
      Object.keys(sliders).forEach(function (k) { sliders[k].value = s[k]; });
      $('letterVal').innerHTML = RL.fmt.em(s.letter) + '<small>' + RL.fmt.px(s.letter, s.size) + '</small>';
      $('wordVal').innerHTML = RL.fmt.em(s.word) + '<small>' + RL.fmt.px(s.word, s.size) + '</small>';
      $('lineVal').textContent = RL.fmt.line(s.line);
      $('sizeVal').textContent = s.size + ' px';
      RL.renderDA($('daCard'), s);
      RL.saveSettings(s);
    }

    showSample();
    document.addEventListener('rl:lang', function () {
      if (!edited) showSample();
      stage.setAttribute('aria-label', RL.t({ en: 'Sample text (editable)', es: 'Texto de ejemplo (editable)' }));
      update();
    });
    update();
  });
})();
