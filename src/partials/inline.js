(function (
  window, doc, script, gaUrl, tkUrl, gaFuncName, createElement,
  async, src, head, appendChild, tkConfig, a, gaFunc) {
    
  GoogleAnalyticsObject = gaFuncName;
  window[gaFuncName] = gaFunc = function() {
    gaFunc.q.push(arguments)
  };
  gaFunc.l = +Date();
  gaFunc.q = [
    ['create', '{{googleAnalyticsProperty}}', 'auto'],
    ['send', 'pageview']
  ];
  
  a = doc[createElement](script);
  a[async] = 1;
  a[src] = gaUrl;
  doc[head][appendChild](a);

  a = doc[createElement](script),
  a[async] = tkConfig[async] = 1;
  a[src] = tkUrl;
  a.onload = a.onreadystatechange = function (e) {
    try { 
      (/^(c|l.*d$)/.test(e.readyState||'c')) && Typekit.load(tkConfig)
    } catch(e) {      
    }
  };
  doc[head][appendChild](a);
  
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
  'head',
  'appendChild', 
  {}
);

