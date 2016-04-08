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

    function Footsie(trigger) {
      this.trigger = trigger;
      this.element = null;
      this.contentElement = null;
    }

    Footsie.open = null;

    Footsie.prototype = {
      additionalElements: [],
      restore: function() { },
      createElement: function() {
        if (this.element) return;

        var html = [
          '<div class="footsie__wrapper">',
          '<div class="footsie__content" tabindex="0">',
          this.html,
          '</div>'
        ];

        html = html.concat(this.additionalElements);
        html.push('</div>');

        this.element = doc.createElement('div');
        this.element.className = 'footsie footsie--' + this.type;
        this.element.innerHTML = html.join('');
        doc.body.appendChild(this.element);

        this.contentElement = this.element.querySelector('.footsie__content');
      },

      display: function() {
        var self = this;

        self.createElement();
        self.position();

        self.contentElement.addEventListener('keydown', function(evt) {
          if (evt.keyCode === 27) {
            self.remove();
          }
        });

        //self.contentElement.addEventListener('blur', function() {
        //  self.remove();
        //});

        setTimeout(function() {
          self.trigger.classList.add('footsie-button--is-open');
          self.element.classList.add('footsie--visible');
          self.contentElement.focus();
        }, 10);
      },

      position: function() { },

      remove: function() {
        var self = this;
        
        var promise = Promise.resolve();

        if (TransitionEndEvent) {
          promise = promise.then(new Promise(function (resolve, reject) {
            self.element.addEventListener(
              TransitionEndEvent,
              resolve
            );
            self.element.classList.remove('footsie--visible');  
          }));
        }

        promise = promise.then(function() {
          self.trigger.classList.remove('footsie-button--is-open');
          self.restore();
          self.element.remove();
          self.element = null;
          self.contentElement = null;

          Footsie.open = null;          
        });
        
        return promise;
      }
    };

    function FootsieBottom(trigger, target) {
      Footsie.call(this, trigger);
      this.html = target.innerHTML;
    }

    FootsieBottom.footnotes = document.querySelector('.footnotes');

    FootsieBottom.removeWhenFootnotesVisible = function() {
      if (!(Footsie.open instanceof FootsieBottom)) {
        return;
      }

      var rect = FootsieBottom.footnotes.getBoundingClientRect();
      var viewportHeight = window.innerHeight - Footsie.open.offsetHeight;

      if (rect.top < viewportHeight) {
        Footsie.open.remove();
      }
    };

    FootsieBottom.prototype = new Footsie(null);
    FootsieBottom.prototype.type = 'bottom';
    FootsieBottom.prototype.display = function() {
      if (FootsieBottom.footnotes) {
        addEventListener('scroll', FootsieBottom.removeWhenFootnotesVisible)
      }
      return Footsie.prototype.display.call(this);
    };

    FootsieBottom.prototype.remove = function() {
      removeEventListener('scroll', FootsieBottom.removeWhenFootnotesVisible);
      return Footsie.prototype.remove.call(this);
    };

    function FootsiePopover(trigger, text) {
      Footsie.call(this, trigger);

      trigger.title = '';

      this.html = '<p>' + text + '</p>';
      this.restore = function() {
        trigger.title = text;
      };
    }

    FootsiePopover.prototype = new Footsie(null);

    FootsiePopover.prototype.additionalElements = [
      '<div class="footsie--popover__tip"></div>'
    ];

    FootsiePopover.prototype.createElement = function() {
      Footsie.prototype.createElement.call(this);
      this.popoverTip = this.element.querySelector('.footsie--popover__tip');
    }

    FootsiePopover.prototype.position = function() {

      var className, top, transformOrigin;
      var docWidth = document.documentElement.offsetWidth;

      var left = (
        this.trigger.offsetLeft +
        (this.trigger.offsetWidth / 2) -
        (this.element.offsetWidth / 2)
      );

      if ((left + this.element.offsetWidth) > docWidth) {
        left = docWidth - this.element.offsetWidth;
      }

      if (left < 0) {
        left = 0;
      }

      var tipPercent = (100 *
        (this.trigger.offsetLeft - left + this.trigger.offsetWidth / 2) /
        (this.element.offsetWidth)
      ) + '%';

      var refRect = this.trigger.getBoundingClientRect();
      if (refRect.top > this.element.offsetHeight) {
        className = 'footsie--popover--top';
        top = (this.trigger.offsetTop - this.element.offsetHeight);;
        transformOrigin = tipPercent + ' 100%';
      } else {
        className = 'footsie--popover--bottom';
        top = (this.trigger.offsetTop + this.trigger.offsetHeight);
        transformOrigin = tipPercent + ' 0%';
      }

      this.element.classList.add(className);
      this.element.style.top = top + 'px';
      this.element.style.left = left + 'px';

      if (TransformOriginProperty) {
        this.element.style[TransformOriginProperty] = transformOrigin;
      }

      this.popoverTip.style.left = tipPercent;
    }

    FootsiePopover.prototype.type = 'popover';

    function createFootsie(trigger) {
      var text = trigger.getAttribute('title');
      if (text) {
        return new FootsiePopover(trigger, text);
      }

      var href = trigger.getAttribute('href');
      if (!href) return;

      var footnote = doc.querySelector(href);
      if (!footnote) return;

      return new FootsieBottom(trigger, footnote);
    }

    function displayFootsie(evt) {
      evt.preventDefault();

      var trigger = this;
      var promise = Promise.resolve();

      if (Footsie.open) {
        if (Footsie.open.trigger === trigger) {
          return;
        }

        promise = promise.then(
          function() { return Footsie.open.remove(); }
        );
      }

      promise = promise.then(
        function() {
          var footsie = createFootsie(trigger);
          if (footsie) {
            footsie.display();
            Footsie.open = footsie;
          }
        }
      );

      promise.catch(console.error);
    }

    function convertToFootsieButton(ref) {
      var trigger;

      if (ref.title) {
        trigger = ref;
        trigger.tabIndex = 0;
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
      trigger.addEventListener('focus', displayFootsie);

      trigger.addEventListener('mouseenter', function(evt) {
        setTimeout(displayFootsie.bind(this, evt), 250);
      });
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