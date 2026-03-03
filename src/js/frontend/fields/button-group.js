/**
 * Button Group Field Handler
 * Manages button group selections (radio buttons styled as buttons)
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {delegate, trigger} from '@/js/shared/utils/events';

export class ButtonGroup {
  constructor() {
    this.init();
  }

  /**
   * Initialize button group handlers
   */
  init() {
    this.bindButtonClick();
    this.initializeExisting();
  }

  /**
   * Bind button click events
   */
  bindButtonClick() {
    delegate('.onemeta-button-option', 'click', function () {
      const option = this;
      const group = DOM.closest(option, '.onemeta-button-group-type');

      if (!group) return;

      // Remove active class from all options in group
      const allOptions = DOM.findAll('.onemeta-button-option', group);
      allOptions.forEach(opt => {
        DOM.removeClass(opt, 'active');
      });

      // Add active class to clicked option
      DOM.addClass(option, 'active');

      // Check the radio input and trigger change
      const radio = DOM.find('input[type="radio"]', option);
      if (radio) {
        radio.checked = true;
        trigger(radio, 'change');
      }
    });
  }

  /**
   * Initialize existing button states on page load
   */
  initializeExisting() {
    const checkedRadios = DOM.findAll('.onemeta-button-group-type input[type="radio"]:checked');

    checkedRadios.forEach(radio => {
      const option = DOM.closest(radio, '.onemeta-button-option');
      if (option) {
        DOM.addClass(option, 'active');
      }
    });
  }
}

export default ButtonGroup;