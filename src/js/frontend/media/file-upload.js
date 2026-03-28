/**
 * File Upload Handler
 * Uses WordPress wp.media API with file type restrictions
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {delegate} from '@/js/shared/utils/events';
import {openFileSelector} from '@/js/shared/utils/wordpress-media';

export class FileUpload {
  constructor() {
    this.init();
  }

  /**
   * Initialize file upload handlers
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
    jQuery(document).on('click', '.onemeta-upload-file', (e) => {
      e.preventDefault();
      this.handleUpload(e.currentTarget);
    });
  }

  /**
   * Handle file upload
   * @param {HTMLElement} button - Upload button
   */
  handleUpload(button) {
    const $button = jQuery(button);
    const $wrapper = $button.closest('.onemeta-file-field');
    const $input = $wrapper.find('input[type="hidden"]');
    const $fileInfo = $wrapper.find('.onemeta-file-info');
    const $fileName = $wrapper.find('.onemeta-file-name');
    const $removeBtn = $wrapper.find('.onemeta-remove-file');

    // Get configuration from data attributes
    const title = $button.data('title') || 'Select File';
    const buttonText = $button.data('button-text') || 'Use File';
    const mimeTypes = $button.data('mime-types') || [];

    // Open WordPress file selector
    openFileSelector((attachment) => {
      // Update hidden input with file ID
      $input.val(attachment.id);
      $input[0].dispatchEvent(new Event('change', {bubbles: true}));

      // Update file name display
      $fileName.text(attachment.filename);

      // Update file extension badge
      const ext = attachment.filename.split('.').pop();
      $wrapper.find('.onemeta-file-ext').text('.' + ext.toUpperCase());

      // Show file info and remove button
      $fileInfo.show();
      $removeBtn.show();
    }, {
      title: title,
      buttonText: buttonText,
      mimeTypes: mimeTypes,
      multiple: false
    });
  }

  /**
   * Bind remove button click
   * Pure JS for removal
   */
  bindRemoveButton() {
    delegate('.onemeta-remove-file', 'click', function (e) {
      e.preventDefault();

      const wrapper = DOM.closest(this, '.onemeta-file-field');
      if (!wrapper) return;

      const input = DOM.find('input[type="hidden"]', wrapper);
      const fileInfo = DOM.find('.onemeta-file-info', wrapper);

      // Clear input value
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('change', {bubbles: true}));
      }

      // Hide file info
      DOM.hide(fileInfo);

      // Hide remove button
      DOM.hide(this);
    });
  }
}

export default FileUpload;