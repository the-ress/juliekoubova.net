(function(doc, addEventListener, className, replace, script, gaUrl, tkUrl, createElement, async,
  src, appendChild, style, width, tkConfig, gaElement, tkElement, element) {

  function triggerTypekitAnimation(delay) {
    element[className] = element[className][replace](/\bno-typekit\b/, '');
  }

  setTimeout(triggerTypekitAnimation, '{{typekitTimeout}}');

  GoogleAnalyticsObject = 'ga';
  ga = {
    l: +new Date,
    q: [
      ['create', '{{googleAnalyticsProperty}}', 'auto'],
      ['send', 'pageview']
    ]
  };

  gaElement = doc[createElement](script);
  gaElement[src] = gaUrl;

  tkElement = doc[createElement](script);
  tkElement[src] = tkUrl;

  gaElement[async] = tkElement[async] = tkConfig[async] = 1;

  tkElement.onload = tkElement.onreadystatechange = function() {
    try {
      tkConfig.active = triggerTypekitAnimation;
      /^(c|l.*d$)/.test(tkElement.readyState || 'c') && Typekit.load(tkConfig);
    } catch (e) { }
  };

  element = doc.head;
  element[appendChild](gaElement);
  element[appendChild](tkElement);

  element = doc.documentElement;
  element[className] = element[className][replace](/\bno-js\b/, 'js');

  !this._phantom && doc[addEventListener] && doc[addEventListener](
    'DOMContentLoaded',
    function(el) {
      el = doc.querySelector('.cookie-law s');
      el[style][width] = el.offsetWidth + 'px';
      el[addEventListener]('animationend', function() {
        el[addEventListener]('transitionend', function() {
          el.remove();
        });
        el[style][width] = 0;
      });
      el[className] = 'animated falling-eurocrat';
    }
  );

})(
  document,
  'addEventListener',
  'className',
  'replace',
  'script',
  '//google-analytics.com/analytics.js',
  'https://use.typekit.net/{{ typekitId }}.js',
  'createElement',
  'async',
  'src',
  'appendChild',
  'style',
  'width',
  {}
);

