(function(doc, className, replace, script, gaUrl, tkUrl, createElement, async, 
  src, appendChild, tkConfig, gaElement, tkElement, element) {

  function showTypekitFonts() {
    element[className] = element[className][replace](/\bno-typekit\b/, '');    
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

  element = doc.head;
  element[appendChild](gaElement);
  element[appendChild](tkElement);
  
  element = doc.documentElement;
  element[className] = element[className][replace](/\bno-js\b/, 'js');
})(
  document,
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

