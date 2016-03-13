(function(doc, script, gaUrl, tkUrl, createElement, async, src, appendChild,
  tkConfig, gaElement, tkElement, head) {

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
      (/^(c|l.*d$)/.test(ers.readyState || 'c')) && Typekit.load(tkConfig)
    } catch (e) { }
  };

  head = doc.head;
  head[appendChild](gaElement);
  head[appendChild](tkElement);
})(
  document,
  'script',
  '//google-analytics.com/analytics.js',
  '//use.typekit.net/{{ typekitId }}.js',
  'createElement',
  'async',
  'src',
  'appendChild',
  {}
);

