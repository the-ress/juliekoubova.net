(function (
  window, doc, script, gaUrl, tkUrl, gaFuncName, createElement,
  async, src, insertBefore, a, m, mp, gaFunc, rs, tkLoaded, tkConfig) {
    
  window['GoogleAnalyticsObject'] = gaFuncName;
  window[gaFuncName] = gaFunc = function() {
    gaFunc.q.push(arguments)
  };
  gaFunc.l = 1 * new Date();
  gaFunc.q = [
    ['create', '{{googleAnalyticsProperty}}', 'auto'],
    ['send', 'pageview']
  ];
  
  m = doc.getElementsByTagName(script)[0];
  mp = m.parentNode;
  
  a = doc[createElement](script);
  a[async] = 1;
  a[src] = gaUrl;
  mp[insertBefore](a, m);

  a = doc[createElement](script),
  a[async] = 1;
  a[src] = tkUrl;
  a.onload = a.onreadystatechange = function () {
    rs = this.readyState;
    
    if(tkLoaded || rs && rs != "complete" && rs != "loaded")
      return;
      
    tkLoaded=1;
    tkConfig={};
    tkConfig[async]=1;
    
    try { 
      Typekit.load(tkConfig)
    } catch(e) {      
    }
  };
  mp[insertBefore](a, m);
  
})(
  window,
  document,
  'script',
  '//www.google-analytics.com/analytics.js',
  '//use.typekit.net/{{ typekitId }}.js',
  'ga',
  'createElement', 
  'async',
  'src',
  'insertBefore'
);

