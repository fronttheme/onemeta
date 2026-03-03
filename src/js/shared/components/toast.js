/**
 * Toast Component
 * Toast notifications for success, error, warning, info messages
 *
 * @package OneMeta
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    this.container = document.createElement('div');
    this.container.className = 'onemeta-toast-container';
    document.body.appendChild(this.container);
  }

  /**
   * Create and show toast
   * @param {Object} options - Toast options
   * @returns {Object} Toast instance
   */
  show(options) {
    const toast = {
      id: Date.now() + Math.random(),
      message: options.message || '',
      type: options.type || 'info', // success, error, warning, info
      duration: options.duration !== undefined ? options.duration : 4000,
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
      icon: options.icon !== undefined ? options.icon : true,
      onClose: options.onClose || null,
      element: null,
      timer: null
    };

    // Create toast element
    toast.element = this.createToastElement(toast);

    // Add to container
    this.container.appendChild(toast.element);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.element.classList.add('onemeta-toast--show');
    });

    // Add to active toasts
    this.toasts.push(toast);

    // Auto dismiss
    if (toast.duration > 0) {
      toast.timer = setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }

    return toast;
  }

  /**
   * Create toast element
   * @param {Object} toast - Toast data
   * @returns {HTMLElement}
   */
  createToastElement(toast) {
    const el = document.createElement('div');
    el.className = `onemeta-toast onemeta-toast--${toast.type}`;
    el.dataset.toastId = toast.id;

    let html = '';

    // Icon
    if (toast.icon) {
      html += `<div class="onemeta-toast__icon">${this.getIcon(toast.type)}</div>`;
    }

    // Message
    html += `<div class="onemeta-toast__message">${this.escapeHtml(toast.message)}</div>`;

    // Close button
    if (toast.dismissible) {
      html += '<button type="button" class="onemeta-toast__close" aria-label="Close">';
      html += '<i class="fa-solid fa-xmark"></i>';
      html += '</button>';
    }

    el.innerHTML = html;

    // Bind close button
    if (toast.dismissible) {
      const closeBtn = el.querySelector('.onemeta-toast__close');
      closeBtn.addEventListener('click', () => {
        this.dismiss(toast.id);
      });
    }

    // Click to dismiss
    el.addEventListener('click', (e) => {
      if (!e.target.closest('.onemeta-toast__close')) {
        this.dismiss(toast.id);
      }
    });

    return el;
  }

  /**
   * Dismiss toast
   * @param {number} toastId - Toast ID
   */
  dismiss(toastId) {
    const index = this.toasts.findIndex(t => t.id === toastId);
    if (index === -1) return;

    const toast = this.toasts[index];

    // Clear timer
    if (toast.timer) {
      clearTimeout(toast.timer);
    }

    // Animate out
    toast.element.classList.remove('onemeta-toast--show');
    toast.element.classList.add('onemeta-toast--hide');

    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }

      // Call onClose callback
      if (toast.onClose) {
        toast.onClose();
      }

      // Remove from active toasts
      this.toasts.splice(index, 1);
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    [...this.toasts].forEach(toast => {
      this.dismiss(toast.id);
    });
  }

  /**
   * Get icon HTML for type
   * @param {string} type - Toast type
   * @returns {string} HTML
   */
  getIcon(type) {
    const icons = {
      success: '<i class="fa-solid fa-circle-check"></i>',
      error: '<i class="fa-solid fa-bug"></i>',
      warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
      info: '<i class="fa-solid fa-circle-info"></i>'
    };

    return icons[type] || icons.info;
  }

  /**
   * Escape HTML
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create singleton instance
const toastManager = new ToastManager();

/**
 * Show toast notification
 * @param {string|Object} options - Message string or options object
 * @returns {Object} Toast instance
 */
export function toast(options) {
  // Handle string shorthand
  if (typeof options === 'string') {
    options = { message: options };
  }

  return toastManager.show(options);
}

/**
 * Show success toast
 * @param {string} message - Success message
 * @returns {Object} Toast instance
 */
export function success(message) {
  return toast({
    message: message,
    type: 'success',
    duration: 3000
  });
}

/**
 * Show error toast
 * @param {string} message - Error message
 * @returns {Object} Toast instance
 */
export function error(message) {
  return toast({
    message: message,
    type: 'error',
    duration: 5000
  });
}

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @returns {Object} Toast instance
 */
export function warning(message) {
  return toast({
    message: message,
    type: 'warning',
    duration: 4000
  });
}

/**
 * Show info toast
 * @param {string} message - Info message
 * @returns {Object} Toast instance
 */
export function info(message) {
  return toast({
    message: message,
    type: 'info',
    duration: 3000
  });
}

/**
 * Dismiss all toasts
 */
export function dismissAll() {
  toastManager.dismissAll();
}

export default toast;