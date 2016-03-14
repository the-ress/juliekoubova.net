(function (document, addEventListener, el) {
  document[addEventListener]('DOMContentLoaded', function () {    
    el = document.querySelector('.cookie-law s');
    el.style.width = el.offsetWidth + 'px';
    el[addEventListener]('animationend', function () {
      el[addEventListener]('transitionend', function () {
        el.remove();
      });
      el.style.width = 0;
    });  
    el.className = 'animated hinge-bottom-left';
  });
})(document, 'addEventListener');
