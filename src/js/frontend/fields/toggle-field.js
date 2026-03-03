/**
 * Toggle Field Handler
 * Manages toggle switch active states
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {delegate} from '@/js/shared/utils/events';

export class ToggleField {
  constructor() {
    this.init();
  }

  /**
   * Initialize toggle field handlers
   */
  init() {
    this.bindToggleChange();
    this.initializeExisting();
  }

  /**
   * Bind toggle change events
   */
  bindToggleChange() {
    delegate('.onemeta-toggle-field input[type="checkbox"]', 'change', function () {
      const label = DOM.closest(this, '.onemeta-toggle-label');

      if (!label) return;

      if (this.checked) {
        DOM.addClass(label, 'active');
      } else {
        DOM.removeClass(label, 'active');
      }
    });
  }

  /**
   * Initialize existing toggle states on page load
   */
  initializeExisting() {
    const checkedToggles = DOM.findAll('.onemeta-toggle-field input[type="checkbox"]:checked');

    checkedToggles.forEach(checkbox => {
      const label = DOM.closest(checkbox, '.onemeta-toggle-label');
      if (label) {
        DOM.addClass(label, 'active');
      }
    });
  }
}

export default ToggleField;