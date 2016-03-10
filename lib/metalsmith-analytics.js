'use strict';

module.exports = function metalsmithAnalytics(property, options) {
  const AnalyticsCode =
    "<script>" + 
    "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" +
    "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o)," +
    "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)" +
    "})(window,document,'script','//www.google-analytics.com/analytics.js','ga');" +
    "ga('create','" + property + "','auto');" +
    "ga('send','pageview');" +
    "</script></body>";
  
  const BodyRegExp = /<\/body>/;
  
  return function metalsmithAnalytics(files, metalsmith, done){
    var excludeRegExp = null;
    
    if (options && options.exclude) {
      excludeRegExp = new RegExp(options.exclude);
    }
    
    for (var name in files) {
      if (excludeRegExp && excludeRegExp.test(name)) {
        continue;
      }
      
      if (/\.html$/i.test(name)) {
        var file = files[name];
        var contents = file.contents.toString();
		    file.contents = new Buffer(contents.replace(BodyRegExp, AnalyticsCode));
      }
    }
    
    done();
  };
};