(function(doc, docElement, className, replace, script, gaUrl, tkUrl, createElement, async, src, appendChild,
  tkConfig, gaElement, tkElement, html, head) {

  html = doc[docElement];
  html[className] = html[className][replace](/\bno-js\b/g, 'js');

  function showTypekitFonts() {
    html[className] = html[className][replace](/\bno-typekit\b/g, '');    
  }
  
  setTimeout(showTypekitFonts, '{{typekitTimeout}}');

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

  tkElement.onload = tkElement.onreadystatechange = function(ers) {
    try {
      tkConfig.active = showTypekitFonts;
      /^(c|l.*d$)/.test(ers.readyState || 'c') && Typekit.load(tkConfig);
    } catch (e) { }
  };

  head = doc.head;
  head[appendChild](gaElement);
  head[appendChild](tkElement);
})(
  document,
  'documentElement',
  'className',
  'replace',
  'script',
  '//google-analytics.com/analytics.js',
  '//use.typekit.net/{{ typekitId }}.js',
  'createElement',
  'async',
  'src',
  'appendChild',
  {}
);

