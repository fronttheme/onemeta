/**
 * Save Handler - Form Submission & AJAX
 * Handles saving field groups to database
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {alert} from '@/js/shared/components/modal';

export class SaveHandler {
  constructor(builderCore) {
    this.builder = builderCore;
    this.init();
  }

  /**
   * Initialize save handler
   */
  init() {
    this.bindFormSubmit();
  }

  /**
   * Bind form submit event
   */
  bindFormSubmit() {
    const form = DOM.find('#onemeta-builder-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });
  }

  /**
   * Handle save
   */
  async handleSave() {
    const submitBtn = DOM.find('#onemeta-builder-form button[type="submit"]');
    if (!submitBtn) return;

    const originalText = submitBtn.innerHTML;

    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Saving...';

      // Prepare data
      const fields = this.builder.getFieldsForSave();
      const builderData = this.builder.getBuilderData();

      const submitData = {
        group_key: DOM.find('#group_key')?.value,
        group_title: DOM.find('#group_title')?.value,
        group_type: DOM.find('#group_type')?.value,
        post_type: DOM.find('#post_type')?.value,
        position: DOM.find('#position')?.value,
        fields: fields
      };

      // Save via AJAX
      const response = await this.saveToDatabase(submitData);

      // Success
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      await alert(builderData.i18n.saveSuccess);

      // Redirect to dashboard
      if (builderData.dashboardUrl) {
        window.location.href = builderData.dashboardUrl;
      }

    } catch (error) {
      // Error
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      console.error('Save error:', error);
      await alert(`Error: ${error.message}`);
    }
  }

  /**
   * Save to database via AJAX
   * @param {Object} data - Data to save
   * @returns {Promise}
   */
  async saveToDatabase(data) {
    // Get nonce from form
    const nonceInput = DOM.find('input[name="onemeta_builder_nonce"]');
    const nonce = nonceInput?.value;

    if (!nonce) {
      throw new Error('Security token not found');
    }

    // Use jQuery AJAX for WordPress compatibility
    return new Promise((resolve, reject) => {
      jQuery.ajax({
        url: window.ajaxurl,
        type: 'POST',
        data: {
          action: 'onemeta_save_field_group',
          onemeta_builder_nonce: nonce,
          ...data
        },
        success: (response) => {
          if (response.success) {
            resolve(response.data);
          } else {
            const errorMsg = response.data?.message || 'Unknown error';
            reject(new Error(errorMsg));
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX Error:', status, error);
          reject(new Error('Failed to save field group. Check console for details.'));
        }
      });
    });
  }
}

export default SaveHandler;