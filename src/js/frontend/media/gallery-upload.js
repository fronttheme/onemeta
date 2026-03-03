/**
 * Gallery Upload Handler
 * Multiple image upload with sorting capability
 * Uses WordPress wp.media API + jQuery UI Sortable
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {delegate} from '@/js/shared/utils/events';
import {openGallerySelector} from '@/js/shared/utils/wordpress-media';

export class GalleryUpload {
  constructor() {
    this.init();
  }

  /**
   * Initialize gallery upload handlers
   */
  init() {
    this.bindAddButton();
    this.bindRemoveButton();
    this.initializeSortable();
  }

  /**
   * Bind add images button
   */
  bindAddButton() {
    // ⚠️ wp.media requires jQuery
    jQuery(document).on('click', '.onemeta-add-gallery-images', (e) => {
      e.preventDefault();
      this.handleAddImages(e.currentTarget);
    });
  }

  /**
   * Handle adding images to gallery
   * @param {HTMLElement} button - Add button
   */
  handleAddImages(button) {
    const $button = jQuery(button);
    const $wrapper = $button.closest('.onemeta-gallery-field');
    const $input = $wrapper.find('input[type="hidden"]');
    const $preview = $wrapper.find('.onemeta-gallery-preview');

    // Open WordPress gallery selector
    openGallerySelector((attachments) => {
      const ids = [];

      // Add each image to preview
      attachments.forEach(attachment => {
        ids.push(attachment.id);

        // Create gallery item HTML
        const itemHTML = `
          <div class="onemeta-gallery-item" data-id="${attachment.id}">
            <img src="${attachment.url}" alt="" />
            <button type="button" class="onemeta-remove-gallery-item">&times;</button>
          </div>
        `;

        $preview.append(itemHTML);
      });

      // Update hidden input (append to existing IDs)
      const currentIds = $input.val() ? $input.val().split(',') : [];
      const allIds = currentIds.concat(ids);
      $input.val(allIds.join(','));
    }, {
      title: 'Select Images',
      buttonText: 'Add to Gallery',
      multiple: true
    });
  }

  /**
   * Bind remove item button
   * Pure JS for removal
   */
  bindRemoveButton() {
    delegate('.onemeta-remove-gallery-item', 'click', function (e) {
      e.preventDefault();

      const item = DOM.closest(this, '.onemeta-gallery-item');
      const wrapper = DOM.closest(item, '.onemeta-gallery-field');

      if (!item || !wrapper) return;

      const input = DOM.find('input[type="hidden"]', wrapper);
      const imageId = item.dataset.id;

      // Remove item from DOM
      DOM.remove(item);

      // Update hidden input (remove this ID)
      if (input && input.value) {
        const ids = input.value.split(',').filter(id => id != imageId);
        input.value = ids.join(',');
      }
    });
  }

  /**
   * Initialize jQuery UI Sortable for gallery items
   * ⚠️ WordPress doesn't provide vanilla alternative for sortable
   */
  initializeSortable() {
    jQuery('.onemeta-gallery-preview').sortable({
      items: '.onemeta-gallery-item',
      cursor: 'move',
      update: function () {
        const $wrapper = jQuery(this).closest('.onemeta-gallery-field');
        const $input = $wrapper.find('input[type="hidden"]');
        const ids = [];

        // Get IDs in new order
        jQuery(this).find('.onemeta-gallery-item').each(function () {
          ids.push(jQuery(this).data('id'));
        });

        // Update hidden input
        $input.val(ids.join(','));
      }
    });
  }
}

export default GalleryUpload;