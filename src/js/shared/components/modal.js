/**
 * Modal Component
 * Reusable modal dialog for alerts, confirmations, and custom content
 *
 * @package OneMeta
 */

export class Modal {
  constructor(options = {}) {
    this.options = {
      title: options.title || 'Notice',
      content: options.content || '',
      type: options.type || 'default', // default, success, warning, danger
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: options.showCancel !== undefined ? options.showCancel : false,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      onClose: options.onClose || null,
      closeOnOverlay: options.closeOnOverlay !== undefined ? options.closeOnOverlay : true,
      closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
      width: options.width || '500px'
    };

    this.modal = null;
    this.overlay = null;
    this.isOpen = false;

    this.create();
  }

  /**
   * Create modal elements
   */
  create() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'onemeta-modal-overlay';

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = `onemeta-modal onemeta-modal--${this.options.type}`;
    this.modal.style.maxWidth = this.options.width;

    // Build modal content
    let html = '';

    // Header
    html += '<div class="onemeta-modal__header">';
    html += `<h3 class="onemeta-modal__title">${this.escapeHtml(this.options.title)}</h3>`;
    html += '<button type="button" class="onemeta-modal__close" aria-label="Close">';
    html += '<i class="fa-solid fa-xmark"></i>';
    html += '</button>';
    html += '</div>';

    // Body
    html += '<div class="onemeta-modal__body">';
    html += this.options.content;
    html += '</div>';

    // Footer
    if (this.options.confirmText || this.options.showCancel) {
      html += '<div class="onemeta-modal__footer">';

      if (this.options.showCancel) {
        html += `<button type="button" class="onemeta-button onemeta-button--ghost onemeta-modal__btn onemeta-modal__btn--cancel">${this.escapeHtml(this.options.cancelText)}</button>`;
      }

      if (this.options.confirmText) {
        html += `<button type="button" class="onemeta-button onemeta-button--primary onemeta-modal__btn onemeta-modal__btn--confirm onemeta-modal__btn--${this.options.type}">${this.escapeHtml(this.options.confirmText)}</button>`;
      }

      html += '</div>';
    }

    this.modal.innerHTML = html;

    // Append to overlay
    this.overlay.appendChild(this.modal);

    // Bind events
    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Close button
    const closeBtn = this.modal.querySelector('.onemeta-modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Confirm button
    const confirmBtn = this.modal.querySelector('.onemeta-modal__btn--confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (this.options.onConfirm) {
          this.options.onConfirm();
        }
        this.close();
      });
    }

    // Cancel button
    const cancelBtn = this.modal.querySelector('.onemeta-modal__btn--cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (this.options.onCancel) {
          this.options.onCancel();
        }
        this.close();
      });
    }

    // Overlay click
    if (this.options.closeOnOverlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.options.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }
  }

  /**
   * Open modal
   */
  open() {
    if (this.isOpen) return;

    document.body.appendChild(this.overlay);

    // Trigger reflow for animation
    this.overlay.offsetHeight;

    this.overlay.classList.add('onemeta-modal-overlay--active');
    this.modal.classList.add('onemeta-modal--active');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    this.isOpen = true;

    // Focus first input or confirm button
    setTimeout(() => {
      const firstInput = this.modal.querySelector('input, textarea, select');
      const confirmBtn = this.modal.querySelector('.onemeta-modal__btn--confirm');

      if (firstInput) {
        firstInput.focus();
      } else if (confirmBtn) {
        confirmBtn.focus();
      }
    }, 100);
  }

  /**
   * Close modal
   */
  close() {
    if (!this.isOpen) return;

    this.overlay.classList.remove('onemeta-modal-overlay--active');
    this.modal.classList.remove('onemeta-modal--active');

    setTimeout(() => {
      if (this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }

      // Restore body scroll
      document.body.style.overflow = '';

      if (this.options.onClose) {
        this.options.onClose();
      }

      // Remove escape handler
      if (this.escapeHandler) {
        document.removeEventListener('keydown', this.escapeHandler);
      }

      this.isOpen = false;
    }, 300);
  }

  /**
   * Update modal content
   * @param {string} content - New content
   */
  setContent(content) {
    const body = this.modal.querySelector('.onemeta-modal__body');
    if (body) {
      body.innerHTML = content;
    }
  }

  /**
   * Update modal title
   * @param {string} title - New title
   */
  setTitle(title) {
    const titleEl = this.modal.querySelector('.onemeta-modal__title');
    if (titleEl) {
      titleEl.textContent = title;
    }
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

  /**
   * Destroy modal
   */
  destroy() {
    this.close();
    this.modal = null;
    this.overlay = null;
  }
}

/**
 * Create and open a modal
 * @param {Object} options - Modal options
 * @returns {Modal}
 */
export function modal(options) {
  const m = new Modal(options);
  m.open();
  return m;
}

/**
 * Alert modal (replaces window.alert)
 * @param {string} message - Alert message
 * @param {string} title - Alert title
 * @returns {Promise}
 */
export function alert(message, title = 'Notice') {
  return new Promise((resolve) => {
    modal({
      title: title,
      content: `<p>${message}</p>`,
      type: 'default',
      confirmText: 'OK',
      showCancel: false,
      onConfirm: resolve,
      onClose: resolve
    });
  });
}

export default Modal;