/**
 * Enhanced Tooltip Component
 * Smooth, accessible tooltips with modern animations
 *
 * @package OneMeta
 */

class TooltipManager {
  constructor() {
    this.tooltip = null;
    this.currentTarget = null;
    this.hideTimer = null;
    this.showTimer = null;
    this.SHOW_DELAY = 400; // Delay before showing (prevents accidental triggers)
    this.HIDE_DELAY = 100; // Delay before hiding (allows smooth transitions)
    this.init();
  }

  /**
   * Initialize tooltip
   */
  init() {
    // Create tooltip element
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'onemeta-tooltip';
    this.tooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(this.tooltip);

    // Bind global events
    this.bindGlobalEvents();
  }

  /**
   * Bind global mouse events
   */
  bindGlobalEvents() {
    document.addEventListener('mouseenter', (e) => {
      if (!(e.target instanceof Element)) return;
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        this.handleMouseEnter(target);
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      if (!(e.target instanceof Element)) return;
      const target = e.target.closest('[data-tooltip]');
      if (target && target === this.currentTarget) {
        this.handleMouseLeave();
      }
    }, true);

    // Hide on scroll
    document.addEventListener('scroll', () => {
      if (this.currentTarget) {
        this.hide(true); // Immediate hide on scroll
      }
    }, true);

    // Hide on click
    document.addEventListener('click', () => {
      if (this.currentTarget) {
        this.hide(true); // Immediate hide on click
      }
    }, true);

    // Reposition on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (this.currentTarget && this.tooltip.classList.contains('onemeta-tooltip--show')) {
          const placement = this.currentTarget.dataset.tooltipPosition || 'top';
          this.position(this.currentTarget, placement);
        }
      }, 100);
    });
  }

  /**
   * Handle mouse enter
   * @param {HTMLElement} target - Target element
   */
  handleMouseEnter(target) {
    // Clear any pending hide
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    // If moving to a different element, hide current tooltip immediately
    if (this.currentTarget && this.currentTarget !== target) {
      this.hide(true);
    }

    // Clear any pending show
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }

    // Set delay before showing
    this.showTimer = setTimeout(() => {
      this.show(target);
    }, this.SHOW_DELAY);
  }

  /**
   * Handle mouse leave
   */
  handleMouseLeave() {
    // Clear show timer
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    // Delay before hiding (allows moving between elements)
    this.hide();
  }

  /**
   * Show tooltip
   * @param {HTMLElement} target - Target element
   */
  show(target) {
    this.currentTarget = target;

    // Get tooltip content
    const content = target.dataset.tooltip || target.getAttribute('aria-label') || target.getAttribute('title');
    if (!content) return;

    // Get placement
    const placement = target.dataset.tooltipPosition || 'top';

    // Set content
    this.tooltip.textContent = content;
    this.tooltip.className = `onemeta-tooltip onemeta-tooltip--${placement}`;

    // Position tooltip
    this.position(target, placement);

    // Force reflow to enable CSS transition
    this.tooltip.offsetHeight;

    // Show tooltip with animation
    requestAnimationFrame(() => {
      this.tooltip.classList.add('onemeta-tooltip--show');
    });
  }

  /**
   * Position tooltip relative to target
   * @param {HTMLElement} target - Target element
   * @param {string} placement - Tooltip placement (top, bottom, left, right)
   */
  position(target, placement) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const offset = 10; // Distance from target (increased for better spacing)

    let top, left;
    let finalPlacement = placement;

    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;

      case 'bottom':
        top = targetRect.bottom + offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;

      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - offset;
        break;

      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + offset;
        break;

      default: // top
        top = targetRect.top - tooltipRect.height - offset;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    }

    // Keep within viewport with smart flipping
    const padding = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Handle vertical overflow with flipping
    if (top < padding && placement === 'top') {
      // Flip to bottom
      top = targetRect.bottom + offset;
      finalPlacement = 'bottom';
      this.tooltip.className = `onemeta-tooltip onemeta-tooltip--bottom`;
    } else if (top + tooltipRect.height > viewportHeight - padding && placement === 'bottom') {
      // Flip to top
      top = targetRect.top - tooltipRect.height - offset;
      finalPlacement = 'top';
      this.tooltip.className = `onemeta-tooltip onemeta-tooltip--top`;
    }

    // Handle horizontal overflow with flipping
    if (left < padding && placement === 'left') {
      // Flip to right
      left = targetRect.right + offset;
      top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      finalPlacement = 'right';
      this.tooltip.className = `onemeta-tooltip onemeta-tooltip--right`;
    } else if (left + tooltipRect.width > viewportWidth - padding && placement === 'right') {
      // Flip to left
      left = targetRect.left - tooltipRect.width - offset;
      top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      finalPlacement = 'left';
      this.tooltip.className = `onemeta-tooltip onemeta-tooltip--left`;
    }

    // Constrain to viewport (for centered tooltips)
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    // Apply position
    this.tooltip.style.top = `${top + window.scrollY}px`;
    this.tooltip.style.left = `${left + window.scrollX}px`;
  }

  /**
   * Hide tooltip
   * @param {boolean} immediate - Whether to hide immediately
   */
  hide(immediate = false) {
    if (immediate) {
      this.tooltip.classList.remove('onemeta-tooltip--show');
      this.currentTarget = null;
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      return;
    }

    // Delayed hide
    this.hideTimer = setTimeout(() => {
      this.tooltip.classList.remove('onemeta-tooltip--show');
      this.currentTarget = null;
    }, this.HIDE_DELAY);
  }

  /**
   * Destroy tooltip
   */
  destroy() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    this.tooltip = null;
    this.currentTarget = null;
  }
}

// Create singleton instance
let tooltipManager = null;

/**
 * Initialize tooltips
 * Call this once on page load
 */
export function initTooltips() {
  if (!tooltipManager) {
    tooltipManager = new TooltipManager();
  }
  return tooltipManager;
}

/**
 * Add tooltip to element programmatically
 * @param {HTMLElement} element - Element to add tooltip to
 * @param {string} text - Tooltip text
 * @param {string} position - Tooltip position (top, bottom, left, right)
 */
export function addTooltip(element, text, position = 'top') {
  element.dataset.tooltip = text;
  element.dataset.tooltipPosition = position;

  // Ensure tooltip manager is initialized
  if (!tooltipManager) {
    initTooltips();
  }
}

/**
 * Remove tooltip from element
 * @param {HTMLElement} element - Element to remove tooltip from
 */
export function removeTooltip(element) {
  delete element.dataset.tooltip;
  delete element.dataset.tooltipPosition;
}

/**
 * Update tooltip text
 * @param {HTMLElement} element - Element with tooltip
 * @param {string} text - New tooltip text
 */
export function updateTooltip(element, text) {
  element.dataset.tooltip = text;
}

export default initTooltips;