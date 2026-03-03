/**
 * Date Field Handler
 * Tracks when date fields are cleared
 *
 * @package OneMeta
 */

import {delegate} from '@/js/shared/utils/events';

export class DateField {
  constructor() {
    this.init();
  }

  /**
   * Initialize date field tracking
   */
  init() {
    // Track when date field is cleared
    delegate('.onemeta-date-field', 'change', this.handleDateChange.bind(this));
  }

  /**
   * Handle date field change
   * Sets a hidden flag when date is cleared
   */
  handleDateChange(e) {
    const dateField = e.target;
    const clearedFlag = dateField.parentElement?.querySelector('.onemeta-date-cleared');

    if (!clearedFlag) return;

    // Set flag based on whether field has value
    if (!dateField.value || dateField.value.trim() === '') {
      clearedFlag.value = '1';
    } else {
      clearedFlag.value = '0';
    }
  }
}

export default DateField;