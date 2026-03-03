/**
 * Group Settings - Field Group Configuration
 * Handles group-level settings (title, type, post type, etc.)
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';

export class GroupSettings {
  constructor(builderCore) {
    this.builder = builderCore;
    this.init();
  }

  /**
   * Initialize group settings
   */
  init() {
    this.bindGroupTypeChange();
  }

  /**
   * Bind group type change
   * Shows/hides post type selector based on group type
   */
  bindGroupTypeChange() {
    const groupTypeSelect = DOM.find('#group_type');
    if (!groupTypeSelect) return;

    const handler = () => {
      const groupType = groupTypeSelect.value;
      const postTypeRows = DOM.findAll('.post-type-row');

      // Loop through each row and show/hide
      postTypeRows.forEach(row => {
        if (groupType === 'user') {
          DOM.addClass(row, 'hidden');
        } else {
          DOM.removeClass(row, 'hidden');
        }
      });
    };

    // Bind change event
    groupTypeSelect.addEventListener('change', handler);

    // Initial state
    handler();
  }
}

export default GroupSettings;