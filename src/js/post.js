(function(win, doc, addEventListener, appendChild, offset, querySelector, clientHeight) {

  require('./classList.js');
  
  if (Promise === undefined) {
    Promise = require('./es6-promise.js').Promise;
  }
    
  var Headroom = require('./headroom.js');
  var Footsies = require('./footsies.js');

  function ready() {
    var original = doc[querySelector]('header');
    var container = doc.createElement('div');
    var body = doc.body;
    var headroom;
        
    container[appendChild](original.cloneNode(true));
    body[appendChild](container);

    headroom = new Headroom(container, {
      tolerance: {
        up: 30,
        down: 5
      }
    });
    
    new Footsies();

    function onWindowResize() {
      headroom[offset] = original[offset + 'Top'];
      
      var lineHeight = parseInt(
        win.getComputedStyle(body).lineHeight.replace(/px$/, ''),
        10
      );
      
      var figures = doc[querySelector + 'All']('figure img'),
          i = figures.length,
          img; 
      
      while (i--) {
        img = figures[i];
        img.parentElement.style.paddingBottom =
          lineHeight * (Math.ceil(img[clientHeight] / lineHeight)) -
          img[clientHeight] + 'px';
      }
    }

    onWindowResize();
    headroom.init();

    setTimeout(onWindowResize, 300);
    win[addEventListener]('resize', onWindowResize);
    doc[addEventListener]('load', onWindowResize);
  }

  if (win._phantom || !doc[addEventListener])
    return;
  
  if (/^(c|i)/.test(doc.readyState)) {
    ready();
  } else {
    doc[addEventListener]('DOMContentLoaded', ready);
  }
})(
  window,
  document,
  'addEventListener',
  'appendChild',
  'offset',
  'querySelector',
  'clientHeight'
);