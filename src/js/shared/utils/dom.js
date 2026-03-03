/**
 * DOM Utility Helpers
 * Pure vanilla JS, no dependencies
 *
 * @package OneMeta
 */

export const DOM = {
  /**
   * Find single element
   * @param {string} selector - CSS selector
   * @param {HTMLElement|Document} context - Context to search within
   * @returns {HTMLElement|null}
   */
  find(selector, context = document) {
    return context.querySelector(selector);
  },

  /**
   * Find all elements (returns Array, not NodeList)
   * @param {string} selector - CSS selector
   * @param {HTMLElement|Document} context - Context to search within
   * @returns {Array<HTMLElement>}
   */
  findAll(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  },

  /**
   * Create element from HTML string
   * @param {string} html - HTML string
   * @returns {HTMLElement}
   */
  create(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  },

  /**
   * Find closest parent matching selector
   * @param {HTMLElement} element - Starting element
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null}
   */
  closest(element, selector) {
    return element?.closest(selector);
  },

  /**
   * Hide element
   * @param {HTMLElement} element - Element to hide
   */
  hide(element) {
    if (element) element.style.display = 'none';
  },

  /**
   * Show element
   * @param {HTMLElement} element - Element to show
   * @param {string} display - Display value (default: 'block')
   */
  show(element, display = 'block') {
    if (element) element.style.display = display;
  },

  /**
   * Toggle element visibility
   * @param {HTMLElement} element - Element to toggle
   * @param {string} display - Display value when showing (default: 'block')
   */
  toggle(element, display = 'block') {
    if (!element) return;

    if (element.style.display === 'none' || !element.style.display) {
      element.style.display = display;
    } else {
      element.style.display = 'none';
    }
  },

  /**
   * Fade out element with animation
   * @param {HTMLElement} element - Element to fade out
   * @param {number} duration - Duration in milliseconds
   * @returns {Promise<void>}
   */
  fadeOut(element, duration = 200) {
    if (!element) return Promise.resolve();

    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = '0';

      setTimeout(() => {
        element.style.display = 'none';
        element.style.opacity = '';
        element.style.transition = '';
        resolve();
      }, duration);
    });
  },

  /**
   * Fade in element with animation
   * @param {HTMLElement} element - Element to fade in
   * @param {number} duration - Duration in milliseconds
   * @param {string} display - Display value (default: 'block')
   * @returns {Promise<void>}
   */
  fadeIn(element, duration = 200, display = 'block') {
    if (!element) return Promise.resolve();

    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.display = display;

      // Force reflow
      element.offsetHeight;

      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = '1';

      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  },

  /**
   * Slide up element
   * @param {HTMLElement} element - Element to slide up
   * @param {number} duration - Duration in milliseconds
   * @returns {Promise<void>}
   */
  slideUp(element, duration = 200) {
    if (!element) return Promise.resolve();

    return new Promise(resolve => {
      const height = element.offsetHeight;

      element.style.height = height + 'px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease`;

      // Force reflow
      element.offsetHeight;

      element.style.height = '0';

      setTimeout(() => {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
        resolve();
      }, duration);
    });
  },

  /**
   * Slide down element
   * @param {HTMLElement} element - Element to slide down
   * @param {number} duration - Duration in milliseconds
   * @param {string} display - Display value (default: 'block')
   * @returns {Promise<void>}
   */
  slideDown(element, duration = 200, display = 'block') {
    if (!element) return Promise.resolve();

    return new Promise(resolve => {
      element.style.display = display;
      const height = element.offsetHeight;

      element.style.height = '0';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease`;

      // Force reflow
      element.offsetHeight;

      element.style.height = height + 'px';

      setTimeout(() => {
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
        resolve();
      }, duration);
    });
  },

  /**
   * Add class to element
   * @param {HTMLElement} element - Element
   * @param {string|Array<string>} classes - Class name(s)
   */
  addClass(element, classes) {
    if (!element) return;

    const classList = Array.isArray(classes) ? classes : [classes];
    element.classList.add(...classList);
  },

  /**
   * Remove class from element
   * @param {HTMLElement} element - Element
   * @param {string|Array<string>} classes - Class name(s)
   */
  removeClass(element, classes) {
    if (!element) return;

    const classList = Array.isArray(classes) ? classes : [classes];
    element.classList.remove(...classList);
  },

  /**
   * Toggle class on element
   * @param {HTMLElement} element - Element
   * @param {string} className - Class name
   * @param {boolean} force - Force add/remove
   */
  toggleClass(element, className, force) {
    if (!element) return;

    element.classList.toggle(className, force);
  },

  /**
   * Check if element has class
   * @param {HTMLElement} element - Element
   * @param {string} className - Class name
   * @returns {boolean}
   */
  hasClass(element, className) {
    return element?.classList.contains(className) || false;
  },

  /**
   * Get element data attribute
   * @param {HTMLElement} element - Element
   * @param {string} key - Data attribute key (without 'data-' prefix)
   * @returns {string|null}
   */
  getData(element, key) {
    return element?.dataset[key] || null;
  },

  /**
   * Set element data attribute
   * @param {HTMLElement} element - Element
   * @param {string} key - Data attribute key (without 'data-' prefix)
   * @param {string} value - Value
   */
  setData(element, key, value) {
    if (element) {
      element.dataset[key] = value;
    }
  },

  /**
   * Remove element from DOM
   * @param {HTMLElement} element - Element to remove
   */
  remove(element) {
    element?.remove();
  },

  /**
   * Insert HTML at position
   * @param {HTMLElement} element - Target element
   * @param {string} position - Position ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
   * @param {string} html - HTML string
   */
  insertHTML(element, position, html) {
    if (element) {
      element.insertAdjacentHTML(position, html);
    }
  },

  /**
   * Get element value (works for inputs, selects, textareas)
   * @param {HTMLElement} element - Input element
   * @returns {string}
   */
  getValue(element) {
    if (!element) return '';

    if (element.type === 'checkbox') {
      return element.checked ? '1' : '0';
    }

    if (element.type === 'radio') {
      const checked = document.querySelector(`input[name="${element.name}"]:checked`);
      return checked ? checked.value : '';
    }

    return element.value || '';
  },

  /**
   * Set element value
   * @param {HTMLElement} element - Input element
   * @param {string|boolean} value - Value to set
   */
  setValue(element, value) {
    if (!element) return;

    if (element.type === 'checkbox') {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  }
};

export default DOM;