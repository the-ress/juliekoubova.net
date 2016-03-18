!this._phantom && (function(
  win, doc, addEventListener, querySelectorAll, clientHeight, LineHeight,
  heroes, i, img
) {
  doc[addEventListener] &&
  doc[querySelectorAll] &&
  doc[addEventListener]('DOMContentLoaded', function() {
    heroes = doc[querySelectorAll]('.hero img, figure img');
    
    if (!heroes) return;

    function onResize() {      
      i = heroes.length;
      while(i--) {
        img = heroes[i];
        img.parentElement.style.paddingBottom = 
          LineHeight * (Math.ceil(img[clientHeight] / LineHeight)) - 
          img[clientHeight] + 'px';
      }
    }

    win[addEventListener]('resize', onResize);
    setTimeout(onResize, 50);
  });
})(
  this,
  document,
  'addEventListener', 
  'querySelectorAll',
  'clientHeight',
  28
);