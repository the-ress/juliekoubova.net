(function (
  window, doc, script, gaUrl, tkUrl, gaFuncName, createElement,
  async, src, appendChild, tkConfig, a, gaFunc, h) {
  
  GoogleAnalyticsObject = gaFuncName;
  window[gaFuncName] = { l: +Date(), q: [
    ['create', '{{googleAnalyticsProperty}}', 'auto'],
    ['send', 'pageview']
  ] };
  
  a = doc[createElement](script);
  a[async] = 1;
  a[src] = gaUrl;
  h = doc.head;
  h[appendChild](a);

  a = doc[createElement](script),
  a[async] = tkConfig[async] = 1;
  a[src] = tkUrl;
  a.onload = a.onreadystatechange = function (ers) {
    try { 
      (/^(c|l.*d$)/.test(ers.readyState||'c')) && Typekit.load(tkConfig)
    } catch(e) {      
    }
  };
  h[appendChild](a);
  
})(
  this,
  document,
  'script',
  '//www.google-analytics.com/analytics.js',
  '//use.typekit.net/{{ typekitId }}.js',
  'ga',
  'createElement', 
  'async',
  'src',
  'appendChild', 
  {}
);

