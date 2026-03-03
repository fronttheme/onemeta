/**
 * Image Upload Handler
 * Uses WordPress wp.media API (requires jQuery)
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {delegate} from '@/js/shared/utils/events';
import {openImageSelector} from '@/js/shared/utils/wordpress-media';

export class ImageUpload {
  constructor() {
    this.init();
  }

  /**
   * Initialize image upload handlers
   */
  init() {
    this.bindUploadButton();
    this.bindRemoveButton();
  }

  /**
   * Bind upload button click
   * Uses jQuery because wp.media requires it
   */
  bindUploadButton() {
    // ⚠️ wp.media requires jQuery
    jQuery(document).on('click', '.onemeta-upload-image', (e) => {
      e.preventDefault();
      this.handleUpload(e.currentTarget);
    });
  }

  /**
   * Handle image upload
   * @param {HTMLElement} button - Upload button
   */
  handleUpload(button) {
    const $button = jQuery(button);
    const $wrapper = $button.closest('.onemeta-image-field');
    const $input = $wrapper.find('input[type="hidden"]');
    const $preview = $wrapper.find('.onemeta-image-preview');
    const $removeBtn = $wrapper.find('.onemeta-remove-image');

    // Open WordPress media selector
    openImageSelector((attachment) => {
      // Update hidden input with image ID
      $input.val(attachment.id);

      // Update preview
      $preview.html(`<img src="${attachment.url}" alt="" />`).show();

      // Show remove button
      $removeBtn.show();
    }, {
      title: 'Select Image',
      buttonText: 'Use Image',
      multiple: false
    });
  }

  /**
   * Bind remove button click
   * Pure JS for removal
   */
  bindRemoveButton() {
    delegate('.onemeta-remove-image', 'click', function (e) {
      e.preventDefault();

      const wrapper = DOM.closest(this, '.onemeta-image-field');
      if (!wrapper) return;

      const input = DOM.find('input[type="hidden"]', wrapper);
      const preview = DOM.find('.onemeta-image-preview', wrapper);

      // Clear input value
      if (input) input.value = '';

      // Hide preview
      if (preview) {
        preview.innerHTML = '';
        DOM.hide(preview);
      }

      // Hide remove button
      DOM.hide(this);
    });
  }
}

export default ImageUpload;