/* Playground: live preview of font + spacing, saved to localStorage and
   shared with the test and the DyslexiaAway setup page. */
(function () {
  'use strict';
  var SAMPLE = {
    en: '<p>Many years later as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice. At that time Macondo was a village of twenty adobe houses, built on the bank of a river of clear water that ran along a bed of polished stones, which were white and enormous, like prehistoric eggs. The world was so recent that many things lacked names, and in order to indicate them it was necessary to point.</p>',
    es: '<p>Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo. Macondo era entonces una aldea de veinte casas de barro y cañabrava construidas a la orilla de un río de aguas diáfanas que se precipitaban por un lecho de piedras pulidas, blancas y enormes como huevos prehistóricos. El mundo era tan reciente, que muchas cosas carecían de nombre, y para mencionarlas había que señalarlas con el dedo.</p>'
  };

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
    $('resetText').addEventListener('click', function () { edited = false; stage.innerHTML = SAMPLE[RL.lang]; });
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

    stage.innerHTML = SAMPLE[RL.lang];
    document.addEventListener('rl:lang', function () {
      if (!edited) stage.innerHTML = SAMPLE[RL.lang];
      stage.setAttribute('aria-label', RL.t({ en: 'Sample text (editable)', es: 'Texto de ejemplo (editable)' }));
      update();
    });
    update();
  });
})();
