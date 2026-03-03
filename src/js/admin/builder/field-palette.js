/**
 * Field Palette - Field Type Selector
 * Handles adding new fields to the builder
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {delegate} from '@/js/shared/utils/events';

export class FieldPalette {
  constructor(builderCore) {
    this.builder = builderCore;
    this.init();
  }

  /**
   * Initialize field palette
   */
  init() {
    this.bindAddFieldButtons();
    this.checkEmptyState();
  }

  /**
   * Bind add field button clicks
   */
  bindAddFieldButtons() {
    // Handle both top and bottom add buttons
    delegate('#add-field-btn, #add-field-btn-bottom, .onemeta-empty-field__add-icon', 'click', () => {
      this.addField('text', true); // Pass true to indicate manual creation
    });
  }

  /**
   * Add new field
   * @param {string} fieldType - Field type (default: 'text')
   * @param {boolean} focusLabel - Whether to focus the label input (manual creation)
   */
  addField(fieldType = 'text', focusLabel = false) {
    const fieldCounter = this.builder.incrementFieldCounter();
    const fieldKey = `field_${fieldCounter}`;

    // Get template
    const templateEl = DOM.find('#field-template');
    if (!templateEl) {
      console.error('Field template not found');
      return;
    }

    // Clone and replace placeholders
    let template = templateEl.innerHTML;
    template = template.replace(/FIELDINDEX/g, fieldCounter);
    template = template.replace(/FIELDKEY/g, fieldKey);

    // Create element
    const fieldElement = DOM.create(template);

    // Get container
    const container = DOM.find('#onemeta-fields-container');
    if (!container) {
      console.error('Fields container not found');
      return;
    }

    // Hide empty state if it exists
    const emptyState = DOM.find('.onemeta-fields-empty-state', container);
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Append to container
    container.appendChild(fieldElement);

    // Set field type if specified
    if (fieldType !== 'text') {
      const typeSelect = DOM.find('.onemeta-field-type', fieldElement);
      if (typeSelect) {
        typeSelect.value = fieldType;
      }
    }

    // Render settings for the field type
    this.renderFieldSettings(fieldElement, fieldType);

    // Focus and scroll to label input if manually created
    if (focusLabel) {
      setTimeout(() => {
        const labelInput = DOM.find('.onemeta-field-label', fieldElement);
        if (labelInput) {
          // Scroll to field smoothly
          fieldElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Focus and select the label input
          labelInput.focus();
          labelInput.select();
        }
      }, 100);
    }

    // Update field count badge
    this.updateFieldCount();

    // Emit event
    this.builder.emit('field-added', {
      fieldKey,
      fieldType,
      element: fieldElement
    });

    return fieldElement;
  }

  /**
   * Update field count badge
   */
  updateFieldCount() {
    const container = DOM.find('#onemeta-fields-container');
    if (!container) return;

    const fields = DOM.findAll('.onemeta-field__item', container);
    const countBadge = DOM.find('.onemeta-field-count');

    if (countBadge) {
      countBadge.textContent = String(fields.length);
    }
  }

  /**
   * Check and show empty state if no fields exist
   */
  checkEmptyState() {
    const container = DOM.find('#onemeta-fields-container');
    if (!container) return;

    const fields = DOM.findAll('.onemeta-field__item', container);
    const emptyState = DOM.find('.onemeta-fields-empty-state', container);

    if (!emptyState) return;

    if (fields.length === 0) {
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';
    }

    this.updateFieldCount();
  }

  /**
   * Render field settings
   * @param {HTMLElement} fieldElement - Field element
   * @param {string} fieldType - Field type
   */
  renderFieldSettings(fieldElement, fieldType) {
    const settingsContainer = DOM.find('.onemeta-field-advanced-settings', fieldElement);

    if (!settingsContainer) return;

    // Use the settings renderer (jQuery-based for now)
    if (window.OnemetaFieldSettings) {
      const $container = jQuery(settingsContainer);
      window.OnemetaFieldSettings.render(fieldType, $container, {});
    }
  }
}

export default FieldPalette;