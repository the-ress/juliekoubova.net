(function(
  win, doc, addEventListener, appendChild, offset, querySelector, clientHeight,
  LineHeight) {

  !win._phantom && doc[addEventListener] && doc[addEventListener](
    'DOMContentLoaded',
    function() {
      var original = doc[querySelector]('header');
      var originalH1 = original[querySelector]('h1');
      var container = doc.createElement('div');
      var headroom;
          
      container[appendChild](original.cloneNode(true));
      doc.body[appendChild](container);

      headroom = new Headroom(container, {
        tolerance: {
          up: 30,
          down: 5
        }
      });

      function onWindowResize() {
        headroom[offset] = originalH1[offset + 'Top'];
        var figures = doc[querySelector + 'All']('.hero img, figure img'),
            i = figures.length,
            img; 
        
        while (i--) {
          img = figures[i];
          img.parentElement.style.paddingBottom =
            LineHeight * (Math.ceil(img[clientHeight] / LineHeight)) -
            img[clientHeight] + 'px';
        }  
      }

      onWindowResize();
      headroom.init();

      setTimeout(onWindowResize, 300);
      win[addEventListener]('resize', onWindowResize);
      doc[addEventListener]('load', onWindowResize);
    }
  );
})(
  this,
  document,
  'addEventListener',
  'appendChild',
  'offset',
  'querySelector',
  'clientHeight',
  28
);