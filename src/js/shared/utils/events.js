/**
 * Event Utilities
 * Efficient event delegation and handling
 *
 * @package OneMeta
 */

/**
 * Event delegation helper
 * Attaches a single listener to document and delegates to matching elements
 *
 * @param {string} selector - CSS selector for target elements
 * @param {string} eventType - Event type (click, change, etc.)
 * @param {Function} handler - Event handler function
 * @param {HTMLElement|Document} context - Context to attach listener (default: document)
 * @returns {Function} Cleanup function to remove listener
 *
 * @example
 * // Basic usage
 * delegate('.button', 'click', function(e) {
 *   console.log(this); // The matched element
 * });
 *
 * // With cleanup
 * const cleanup = delegate('.button', 'click', handler);
 * cleanup(); // Remove listener later
 */
export const delegate = (selector, eventType, handler, context = document) => {
  const delegateHandler = (e) => {
    const target = e.target.closest(selector);
    if (target && context.contains(target)) {
      handler.call(target, e);
    }
  };

  context.addEventListener(eventType, delegateHandler);

  // Return cleanup function
  return () => {
    context.removeEventListener(eventType, delegateHandler);
  };
};

/**
 * Attach event listener to element
 * @param {HTMLElement} element - Target element
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler
 * @returns {Function} Cleanup function
 */
export const on = (element, eventType, handler) => {
  if (!element) return () => {
  };

  element.addEventListener(eventType, handler);

  return () => {
    element.removeEventListener(eventType, handler);
  };
};

/**
 * Attach event listener that fires only once
 * @param {HTMLElement} element - Target element
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler
 */
export const once = (element, eventType, handler) => {
  if (!element) return;

  element.addEventListener(eventType, handler, {once: true});
};

/**
 * Trigger custom event on element
 * @param {HTMLElement} element - Target element
 * @param {string} eventName - Event name
 * @param {Object} detail - Event detail data
 */
export const trigger = (element, eventName, detail = {}) => {
  if (!element) return;

  const event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
    detail
  });

  element.dispatchEvent(event);
};

/**
 * Debounce function - limits function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 *
 * @example
 * const search = debounce((query) => {
 *   console.log('Searching:', query);
 * }, 300);
 *
 * input.addEventListener('input', (e) => search(e.target.value));
 */
export const debounce = (func, wait = 300) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - limits function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 *
 * @example
 * const onScroll = throttle(() => {
 *   console.log('Scrolling...');
 * }, 100);
 *
 * window.addEventListener('scroll', onScroll);
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Wait for element to exist in DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<HTMLElement>}
 *
 * @example
 * const element = await waitForElement('.dynamic-content');
 */
export const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    // Check if already exists
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    // Setup observer
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Setup timeout
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

/**
 * Prevent default and stop propagation
 * @param {Event} event - Event object
 */
export const prevent = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

/**
 * Check if event target matches selector
 * @param {Event} event - Event object
 * @param {string} selector - CSS selector
 * @returns {boolean}
 */
export const matches = (event, selector) => {
  return event.target.matches(selector);
};

/**
 * Get event target that matches selector (bubbles up)
 * @param {Event} event - Event object
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null}
 */
export const getEventTarget = (event, selector) => {
  return event.target.closest(selector);
};

/**
 * Check if element is visible
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export const isVisible = (element) => {
  if (!element) return false;
  return element.offsetParent !== null;
};

/**
 * Wait for condition to be true
 * @param {Function} condition - Function that returns boolean
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} interval - Check interval in milliseconds
 * @returns {Promise<void>}
 */
export const waitFor = (condition, timeout = 5000, interval = 100) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = () => {
      if (condition()) {
        resolve();
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for condition'));
        return;
      }

      setTimeout(checkCondition, interval);
    };

    checkCondition();
  });
};

export default {
  delegate,
  on,
  once,
  trigger,
  debounce,
  throttle,
  waitForElement,
  waitFor,
  prevent,
  matches,
  getEventTarget,
  isVisible
};