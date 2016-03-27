window['Hypher'] = module.exports;

window['Hypher']['languages'] = {};

document.addEventListener && document.addEventListener(
  'DOMContentLoaded',
  function() {
    var els = document.querySelectorAll('p, em, strong, li, figcaption');
    var i = els.length;
    
    while (i--) {
      var j = els[i].childNodes.length;
      while (j--) {
          if (els[i].childNodes[j].nodeType === 3) {
              els[i].childNodes[j].nodeValue = window['Hypher']['languages']['cs'].hyphenateText(els[i].childNodes[j].nodeValue);
          }
      }
    }
  }
);
}());