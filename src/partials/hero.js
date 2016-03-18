!this._phantom && (function(win, doc, addEventListener, px, heroes, anchor, els, i) {
  doc[addEventListener] && doc[addEventListener]('DOMContentLoaded', function() {
    heroes = doc.querySelectorAll('.hero');
    anchor = doc.querySelector('.hero-anchor');

    if (!heroes || !anchor) return;

    function onResize() {      
      i = heroes.length;
      while(i--) {
        els = heroes[i].style;        
        els.marginLeft = els.marginRight = '-' + anchor.offsetLeft + px;;        
        els.width = doc.documentElement.clientWidth + px;  
      }
    }

    win[addEventListener]('resize', onResize);

    function easeOut(t, c, d) {
      t /= d;
      return -c * t*(t-2);
    }

    var scrollDuration = 1000;
    var scrollHeight, start;
    
    requestAnimationFrame(step);

    function step(timestamp) {
      if (!scrollHeight) { 
        onResize();
        scrollHeight = heroes[0].offsetHeight * .8;
      }
      
      if (pageYOffset >= scrollHeight) {
        return;
      }
      
      start = start || timestamp;
      var y, current = timestamp - start;
      
      if (current >= scrollDuration) {
        y = scrollHeight
      } else {
        y = easeOut(current, scrollHeight, scrollDuration);
        requestAnimationFrame(step);
      } 
      
      scrollTo(0, y);
    }
  });
})(this, document, 'addEventListener', 'px');