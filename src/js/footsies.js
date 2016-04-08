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
  
  function whichPrefix(property) {
    var prefixes = ['', 'O', 'Moz', 'Webkit'];
    for (var i in prefixes) {
      var pp = (prefixes[i] + property); 
      if (pp in document.body.style) {
        return pp;
      }
    }
  }
  
  var TransformOriginProperty = whichPrefix('transformOrigin');

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

    function getFootsieContent(ref) {
      var text = ref.getAttribute('title');
      if (text) {
        return {
          html: '<p>' + text + '</p>',
          type: 'popover' 
        };
      }
      
      var href = ref.getAttribute('href');
      if (!href) return;

      var footnote = doc.querySelector(href);
      if (!footnote) return;      
      
      return {
        html: footnote.innerHTML,
        type: 'bottom'
      };
    }

    function positionPopover(ref, footsie) {

      var className, top, transformOrigin;
      
      var left = (
        ref.offsetLeft + 
        (ref.offsetWidth / 2) - 
        (footsie.offsetWidth / 2)
      );
           
      if ((left + footsie.offsetWidth) > innerWidth) {
        left = innerWidth - footsie.offsetWidth;
      } else if (left < 0) {
        left = 0;
      }

      var tipPercent = (100 * 
        (ref.offsetLeft - left + ref.offsetWidth/2) /
        (footsie.offsetWidth) 
      ) + '%';
        
      var refRect = ref.getBoundingClientRect();
      if (refRect.top > footsie.offsetHeight) {
        className = 'footsie--popover--top';
        top = (ref.offsetTop - footsie.offsetHeight);;
        transformOrigin = tipPercent + ' 100%';
      } else { 
        className = 'footsie--popover--bottom';
        top = (ref.offsetTop + ref.offsetHeight);
        transformOrigin = tipPercent + ' 0%';
      }
      
      footsie.classList.add(className);
      footsie.style.top = top + 'px';
      footsie.style.left = left + 'px';
      
      if (TransformOriginProperty) {
        footsie.style[TransformOriginProperty] = transformOrigin;
      }
      
      var tip = footsie.querySelector('.footsie--popover__tip');
      if (tip) {
        tip.style.left = tipPercent;
      }
    }

    function displayFootsie(evt) {
      evt.preventDefault();
      removeOpenFootsie();

      var ref = this;
      var content = getFootsieContent(ref);
      if (!content) return;

      var html = [
        '<div class="footsie__wrapper">',
        '<div class="footsie__content" tabindex="0">',
        content.html,
        '</div>'
      ];

      if (content.type === 'popover') {
        html.push('<div class="footsie--popover__tip"></div>');
      }
      
      html.push('</div>');
      
      var footsie = doc.createElement('div');
      footsie.className = 'footsie footsie--' + content.type;
      footsie.innerHTML = html.join('');
      doc.body.appendChild(footsie);
      
      if (content.type === 'bottom' && footnotes) {        
        addEventListener('scroll', removeBottomFootsieWhenFootnotesVisible);
      } else if (content.type == 'popover') {
        positionPopover(ref, footsie);
      }

      var content = footsie.querySelector('.footsie__content');

      content.addEventListener('keydown', function(evt) {
        if (evt.keyCode === 27) {
          removeOpenFootsie();
        }
      });

      //content.addEventListener('blur', removeOpenFootsie);

      openFootsieButton = ref;
      openFootsie = footsie;

      setTimeout(function() {
        ref.classList.add('footsie-button--is-open');
        footsie.classList.add('footsie--visible');
        content.focus();
      }, 10);
    }

    function convertToFootsieButton(ref) {
      var trigger;

      if (ref.title) {
        trigger = ref;
      } else {
        var link = ref.querySelector('a[href]');
        if (!link) return;

        var href = /\#fn(\d+)$/.exec(link.href);
        if (!href) return;

        var html =
          '<a class="footsie-button" ' +
          '   href="' + href[0] + '" ' +
          '   id="' + link.id + '">' +
          href[1] +
          '</a>';

        ref.classList.add('footsie-ref--active');
        ref.insertAdjacentHTML('afterend', html);
        
        trigger = ref.nextElementSibling;
        link.id = '';
      }

      trigger.addEventListener('click', displayFootsie);
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