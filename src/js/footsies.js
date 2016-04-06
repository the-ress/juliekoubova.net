(function(doc, forEach) {

  var DefaultSelector = '.footnote-ref, abbr[title], span[title]';

  /* From Modernizr */
  var TransitionEndEvent = (function whichTransitionEvent() {
    var t;
    var el = doc.createElement('div');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    }

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  })();

  function getScrollY() {
    return (window.pageYOffset !== undefined)
      ? window.pageYOffset
      : (window.scrollTop !== undefined)
        ? window.scrollTop
        : (document.documentElement || document.body.parentNode || document.body).scrollTop;
  }

  if (!doc.querySelector) {
    module.exports = function FootsiesNotSupported() {
      if (!(this instanceof FootsiesNotSupported))
        return new FootsiesNotSupported();
    };
    return;
  }

  module.exports = function Footsies(options) {
    if (!(this instanceof Footsies))
      return new Footsies(options);

    options = options || {};

    if (typeof options === 'string') {
      options = { selector: options };
    }

    options.selector = options.selector || DefaultSelector;

    var footnotes = document.querySelector('.footnotes');
    
    var openFootsie;
    var openFootsieButton;

    function removeBottomFootsieWhenFootnotesVisible() {
      var rect = footnotes.getBoundingClientRect();
      var viewportHeight = window.innerHeight - openFootsie.offsetHeight;
           
      if (rect.top < viewportHeight) {
        removeOpenFootsie();
      }
    }

    function removeOpenFootsie() {
      if (openFootsieButton) {
        openFootsieButton.classList.remove('footsie-button--is-open');
        openFootsieButton = null;
      }

      if (openFootsie) {
        if (TransitionEndEvent) {
          openFootsie.addEventListener(
            TransitionEndEvent,
            openFootsie.remove.bind(openFootsie)
          );
          openFootsie.classList.remove('footsie--visible');
        } else {
          openFootsie.remove();
        }

        openFootsie = null;
      }
      
      removeEventListener('scroll', removeBottomFootsieWhenFootnotesVisible);
    }

    function displayBottomFootsie(ref, href) {
      var footnote = doc.querySelector(href);
      if (!footnote) return;

      var footsie = doc.createElement('div');
      footsie.className = 'footsie footsie--bottom';
      footsie.innerHTML =
        '<div class="footsie__wrapper">' +
        '<div class="footsie__content" tabindex="0">' +
        footnote.innerHTML +
        '</div>' +
        '</div>';

      doc.body.appendChild(footsie);

      if (footnotes) {
        addEventListener('scroll', removeBottomFootsieWhenFootnotesVisible);
      }
      
      var content = footsie.querySelector('.footsie__content');

      content.addEventListener('keydown', function(evt) {
        if (evt.keyCode == 27) {
          removeOpenFootsie();
        }
      });

      content.addEventListener('blur', removeOpenFootsie);
      
      openFootsieButton = ref;
      openFootsie = footsie;

      setTimeout(function() {
        ref.classList.add('footsie-button--is-open');
        footsie.classList.add('footsie--visible');
        content.focus();
      }, 10);
    }

    function displayFootsie(evt) {
      evt.preventDefault();
      removeOpenFootsie();

      var href = this.getAttribute('href');
      if (href) displayBottomFootsie(this, href);

      var text = this.getAttribute('data-footsie-text')
      if (text) displayTooltipFootsie(this, text);
    }

    function convertToFootsieButton(ref) {
      var html;

      if (ref.title) {
        html =
          '<button class="footsie-button footsie-button--title" ' +
          'data-footsie-text="' + ref.title + '">' +
          '<svg viewBox="0 0 18 6">' +
          '<circle r="2" cx="3" cy="3" />' +
          '<circle r="2" cx="9" cy="3" />' +
          '<circle r="2" cx="15" cy="3" />' +
          '</svg>' +
          '</button>';
      } else {
        var link = ref.querySelector('a[href]');
        if (!link) return;

        var href = /\#fn(\d+)$/.exec(link.href);
        if (!href) return;

        html =
          '<a class="footsie-button footsie-button--fn" ' +
          '   href="' + href[0] + '" ' +
          '   id="' + link.id + '">' + 
          href[1] +
          '</a>';
          
        link.id = '';
      }

      ref.classList.add('footsie-ref--active');
      ref.insertAdjacentHTML('afterend', html);

      var button = ref.nextElementSibling;
      button.addEventListener('click', displayFootsie);
    }
    
    forEach.call(
      doc.querySelectorAll(options.selector),
      convertToFootsieButton
    );
  };
})(
  document,
  Array.prototype.forEach
  );