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

  function cancelableCall(fn, delay) {
    var canceled;
    var timeout;

    var result = function() {
      if (timeout) return;
      canceled = false;

      var args = Array.prototype.slice.call(arguments);

      timeout = setTimeout(
        function() {
          if (!canceled) fn.apply(global, args);
        },
        delay
      );
    };

    result.cancel = function() {
      if (!timeout) return;
      clearTimeout(timeout);
      canceled = true;
      timeout = undefined;
    };

    return result;
  }

  function noop() { }

  var data = (function() {
    var prefix = String(+new Date()) + '_';

    return function data(el, key, value) {
      if (arguments.length === 3) {
        el[prefix + key] = value;
      }

      return el[prefix + key];
    }
  })();

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
    options.mouseEnterDelay = options.mouseEnterDelay || 400;
    options.mouseLeaveDelay = options.mouseLeaveDelay || 400;

    function Footsie(trigger) {
      this.trigger = trigger;
      this.triggerEventType = null;
      this.element = null;
      this.contentElement = null;
      this.isBeingRemoved = false;
    }

    Footsie.open = null;
    Footsie.background = (function() {

      // iPhones don't bubble clicks from elements without cursor: pointer.
      // thanks, Apple! 

      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        var el = doc.createElement('div');
        el.className = 'footsie-background';
        
        var els = el.style;
        els.cursor = 'pointer';
        els.display = 'none';
        els.position = 'fixed';
        els.top = els.right = els.bottom = els.left = 0;
        
        el.addEventListener('click', function() {
          if (Footsie.open) {
            Footsie.open.remove();
          }
        });

        doc.body.appendChild(el);

        return {
          display: function() { els.display = 'block'; },
          hide: function() { els.display = 'none'; }
        };
      } else {
        addEventListener('click', function(evt) {
          if (Footsie.open && !Footsie.open.contains(evt.target)) {
            Footsie.open.remove();
          }
        });

        return {
          display: noop,
          hide: noop
        };
      }
    })();

    Footsie.prototype = {
      additionalElements: [],
      isFocusable: false,
      createElement: function() {
        if (this.element) return;

        var html = [];

        html.push('<div class="footsie__wrapper">');
        html.push('<div class="footsie__content"');

        if (this.isFocusable) {
          html.push(' tabindex="0"');
        }

        html.push('>');
        html.push(this.html);
        html.push('</div>')

        html = html.concat(this.additionalElements);

        html.push('</div>');

        this.element = doc.createElement('div');
        this.element.className = 'footsie footsie--' + this.type;
        this.element.innerHTML = html.join('');
        doc.body.appendChild(this.element);

        this.contentElement = this.element.querySelector('.footsie__content');
      },

      contains: function(element) {
        while (element) {
          if (element === this.element || element === this.trigger) {
            return true;
          } else {
            element = element.parentElement;
          }
        }

        return false;
      },

      display: function(triggerEventType) {
        var self = this;

        if (!self.triggerEventType || triggerEventType !== 'mouseenter') {
          self.triggerEventType = triggerEventType;
        }

        if (Footsie.open === self) {
          return Promise.resolve();
        }

        var promise = Footsie.open ? Footsie.open.remove() : Promise.resolve();

        return promise.then(function() {

          function closeOnEscAndFocusTrigger(evt) {
            if (evt.keyCode === 27) {
              self.trigger.focus();
              self.remove();
            }
          }

          self.createElement();
          self.position();

          if (!self.isFocusable) {
            self.contentElement.addEventListener(
              'click',
              self.remove.bind(self)
            );
          }

          self.contentElement.addEventListener(
            'keydown', closeOnEscAndFocusTrigger
          );

          self.trigger.addEventListener(
            'keydown', closeOnEscAndFocusTrigger
          );

          Footsie.open = self;

          setTimeout(function() {
            Footsie.background.display();

            self.trigger.classList.add('footsie-button--is-open');
            self.element.classList.add('footsie--visible');

            if (self.isFocusable) {
              self.contentElement.focus();
            }
          }, 10);
        });
      },

      position: function() { },

      remove: function() {
        var self = this;
        var promise = Promise.resolve();

        if (self.isBeingRemoved) {
          return promise;
        }

        self.isBeingRemoved = true;

        Footsie.background.hide();

        if (TransitionEndEvent) {
          promise = promise.then(function() {
            return new Promise(function(resolve, reject) {
              self.element.addEventListener(
                TransitionEndEvent,
                function() { resolve(); }
              );
              self.element.classList.remove('footsie--visible');
            });
          });
        }

        promise = promise.then(function() {
          self.trigger.classList.remove('footsie-button--is-open');
          self.element.remove();
          self.element = null;
          self.contentElement = null;

          Footsie.open = null;
          data(self.trigger, 'footsie', null);
        });

        return promise;
      }
    };

    function FootsieBottom(trigger, target) {
      Footsie.call(this, trigger);
      this.html = target.innerHTML;
    }

    FootsieBottom.footnotes = document.querySelector('.footnotes');

    FootsieBottom.prototype = new Footsie(null);
    FootsieBottom.prototype.isFocusable = true;
    FootsieBottom.prototype.type = 'bottom';

    FootsieBottom.prototype.display = function() {
      if (FootsieBottom.footnotes) {
        addEventListener(
          'scroll',
          this.removeWhenFootnotesVisible.bind(this)
        );
      }
      return Footsie.prototype.display.apply(this, arguments);
    };

    FootsieBottom.prototype.remove = function() {
      removeEventListener(
        'scroll',
        this.removeWhenFootnotesVisible.bind(this)
      );
      return Footsie.prototype.remove.apply(this, arguments);
    };

    FootsieBottom.prototype.removeWhenFootnotesVisible = function() {
      if (!this.element) return;

      var rect = FootsieBottom.footnotes.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight - this.element.offsetHeight;

      if (rect.top < viewportHeight) {
        this.remove();
      }
    };

    function FootsiePopover(trigger, text) {
      Footsie.call(this, trigger);
      this.html = '<p>' + text + '</p>';
    }

    FootsiePopover.prototype = new Footsie(null);

    FootsiePopover.prototype.additionalElements = [
      '<div class="footsie--popover__tip"></div>'
    ];

    FootsiePopover.prototype.createElement = function() {
      Footsie.prototype.createElement.apply(this, arguments);
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
      var text = trigger.getAttribute('data-footsie-text');
      if (text) return new FootsiePopover(trigger, text);

      var href = trigger.getAttribute('href');
      if (!href) return null;

      var footnote = doc.querySelector(href);
      if (!footnote) return null;

      return new FootsieBottom(trigger, footnote);
    }

    function displayFootsie(evt) {
      evt.preventDefault();

      var trigger = this;
      var footsie = data(trigger, 'footsie');

      if (!footsie) {
        footsie = createFootsie(trigger);
      }

      data(trigger, 'footsie', footsie);

      if (footsie) {
        footsie.display(evt.type);
      }
    }

    function removeFootsieIfOpenedOnEventType(triggerEventType) {
      return function(evt) {
        evt.preventDefault();

        var trigger = this;
        var footsie = data(trigger, 'footsie');

        if (footsie && footsie.triggerEventType === triggerEventType) {
          footsie.remove();
        }
      };
    }

    function convertToFootsieButton(ref) {
      var trigger;

      if (ref.title) {
        trigger = ref;
        trigger.tabIndex = 0;
        trigger.setAttribute('data-footsie-text', trigger.title);
        trigger.removeAttribute('title');

        trigger.addEventListener('focus', displayFootsie);

        trigger.addEventListener(
          'blur', removeFootsieIfOpenedOnEventType('focus')
        );

        var displayFootsieDelayed = cancelableCall(
          displayFootsie.bind(trigger),
          options.mouseEnterDelay
        );

        var removeFootsieDelayed = cancelableCall(
          removeFootsieIfOpenedOnEventType('mouseenter').bind(trigger),
          options.mouseLeaveDelay
        );

        trigger.addEventListener('mouseenter', displayFootsieDelayed);
        trigger.addEventListener('mousemove', removeFootsieDelayed.cancel);
        trigger.addEventListener('mouseout', function(evt) {
          displayFootsieDelayed.cancel();
          removeFootsieDelayed.call(this, evt);
        });

      } else {

        var link = ref.querySelector('a[href]');
        if (!link) return;

        var href = /\#fn(\d+)$/.exec(link.href);
        if (!href) return;

        var html =
          '<a class="footsie-button" ' +
          'href="' + href[0] + '" ' +
          'id="' + link.id + '">' +
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