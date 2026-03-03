/**
 * Field Drag & Drop Handler
 * Handles dropping field types onto fields and empty states
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';

export class FieldDragDrop {
  constructor(core) {
    this.core = core;
    this.draggedType = null;
    this.init();
  }

  init() {
    this.setupDropZones();
    this.setupEmptyStateDropZones();
  }

  /**
   * Setup drop zones for fields
   */
  setupDropZones() {
    document.addEventListener('dragover', (e) => {
      this.handleDragOver(e);
    });

    document.addEventListener('dragleave', (e) => {
      this.handleDragLeave(e);
    });

    document.addEventListener('drop', (e) => {
      this.handleDrop(e);
    });

    // Store dragged type for validation
    document.addEventListener('dragstart', (e) => {
      if (e.target.closest('.onemeta-palette-item')) {
        const item = e.target.closest('.onemeta-palette-item');
        this.draggedType = {
          type: item.dataset.type,
          icon: item.dataset.icon,
          label: item.dataset.label,
          repeaterAllowed: item.dataset.repeaterAllowed === 'true'
        };
      }
    });

    document.addEventListener('dragend', () => {
      this.draggedType = null;

      // Clean up all drag feedback
      DOM.findAll('.drag-over, .drag-over-invalid').forEach(el => {
        el.classList.remove('drag-over', 'drag-over-invalid');
      });

      // Restore all empty state texts
      DOM.findAll('.onemeta-fields-empty-state, .no-sub-fields, .onemeta-sub-fields-empty-state').forEach(el => {
        this.restoreEmptyStateText(el);
      });

      DOM.findAll('.drop-invalid-message').forEach(el => el.remove());
    });
  }

  /**
   * Setup empty state drop zones
   */
  setupEmptyStateDropZones() {
    // DRAGOVER - Show visual feedback and update text
    document.addEventListener('dragover', (e) => {
      const subEmptyState = e.target.closest('.no-sub-fields, .onemeta-sub-fields-empty-state');
      if (subEmptyState && this.draggedType) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (this.draggedType.repeaterAllowed) {
          subEmptyState.classList.add('drag-over-empty');
          subEmptyState.classList.remove('drag-over-invalid');
          this.updateEmptyStateText(subEmptyState, true, true);
        } else {
          subEmptyState.classList.add('drag-over-invalid');
          subEmptyState.classList.remove('drag-over-empty');
          this.updateEmptyStateText(subEmptyState, false, true);
        }
        return false;
      }

      // Main empty state
      const emptyState = e.target.closest('.onemeta-fields-empty-state');
      if (emptyState && this.draggedType) {
        e.preventDefault();
        emptyState.classList.add('drag-over-empty');
        this.updateEmptyStateText(emptyState, true, false);
      }
    }, true);

    // DRAGLEAVE - Restore original text
    document.addEventListener('dragleave', (e) => {
      const subEmptyState = e.target.closest('.no-sub-fields, .onemeta-sub-fields-empty-state');
      if (subEmptyState && !subEmptyState.contains(e.relatedTarget)) {
        subEmptyState.classList.remove('drag-over-empty', 'drag-over-invalid');
        this.restoreEmptyStateText(subEmptyState);
      }

      const emptyState = e.target.closest('.onemeta-fields-empty-state');
      if (emptyState && !emptyState.contains(e.relatedTarget)) {
        emptyState.classList.remove('drag-over-empty');
        this.restoreEmptyStateText(emptyState);
      }
    }, true);

    // DROP - Restore text after drop
    document.addEventListener('drop', (e) => {
      // Sub-field empty state
      const subEmptyState = e.target.closest('.no-sub-fields, .onemeta-sub-fields-empty-state');
      if (subEmptyState && this.draggedType) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        subEmptyState.classList.remove('drag-over-empty', 'drag-over-invalid');
        this.restoreEmptyStateText(subEmptyState);

        if (!this.draggedType.repeaterAllowed) {
          this.showErrorToast('This field type cannot be used in repeater sub-fields');
          return false;
        }

        this.addFieldFromEmptyState(this.draggedType, true);
        return false;
      }

      // Main empty state
      const emptyState = e.target.closest('.onemeta-fields-empty-state');
      if (emptyState && this.draggedType) {
        e.preventDefault();
        e.stopPropagation();
        emptyState.classList.remove('drag-over-empty');
        this.restoreEmptyStateText(emptyState);
        this.addFieldFromEmptyState(this.draggedType, false);
      }
    }, true);
  }

  /**
   * Add field from empty state drop
   */
  addFieldFromEmptyState(data, isSubField) {
    if (isSubField) {
      // Find the add sub-field button and mark it as drag-drop triggered
      const addButton = document.querySelector('.add-sub-field');
      if (addButton) {
        // Set flag to indicate this is from drag & drop
        jQuery(addButton).data('drag-drop-trigger', true);

        addButton.click();

        // Wait for DOM update, then set the type
        setTimeout(() => {
          const lastSubField = document.querySelector('.sub-field-row:last-child');
          if (lastSubField) {
            const select = lastSubField.querySelector('.sub-field-type-select');
            if (select) {
              select.value = data.type;

              // Update the type display in header
              const typeDisplay = lastSubField.querySelector('.sub-field-type');
              if (typeDisplay) {
                typeDisplay.textContent = data.type;
              }

              // Trigger change event
              select.dispatchEvent(new Event('change', {bubbles: true}));
            }
          }
        }, 100);
      }
    } else {
      // Add main field - use the Add Field button
      const addButton = document.querySelector('#add-field-btn');
      if (addButton) {
        // Click the button to add field
        addButton.click();

        // Wait for DOM update, then set the type
        setTimeout(() => {
          const lastField = document.querySelector('.onemeta-field__item:last-child');
          if (lastField) {
            const select = lastField.querySelector('.field-type-select, .onemeta-field-type');
            if (select) {
              select.value = data.type;

              // Update visual display
              this.updateFieldType(lastField, data);
            }
          }
        }, 100);
      }
    }

    this.showSuccessFeedback(`${data.label} field added`);
  }

  /**
   * Handle drag over
   */
  handleDragOver(e) {
    if (!this.draggedType) return;

    // PRIORITY 0: Check for insertion zone (highest priority!)
    const insertionZone = e.target.closest('.onemeta-insertion-zone');
    if (insertionZone) {
      // Let insertion system handle it
      return;
    }

    // IGNORE if we're over an empty state
    if (e.target.closest('.no-sub-fields, .onemeta-sub-fields-empty-state')) {
      return;
    }

    // PRIORITY 1: Check for repeater sub-field
    const subFieldRow = e.target.closest('.sub-field-row');
    if (subFieldRow) {
      e.preventDefault();
      e.stopPropagation();

      if (!this.draggedType.repeaterAllowed) {
        subFieldRow.classList.add('drag-over-invalid');
        subFieldRow.classList.remove('drag-over');
        this.showInvalidDropMessage(subFieldRow);
      } else {
        subFieldRow.classList.add('drag-over');
        subFieldRow.classList.remove('drag-over-invalid');
        this.removeInvalidDropMessage(subFieldRow);
      }
      return;
    }

    // PRIORITY 2: Main field item
    const fieldItem = e.target.closest('.onemeta-field__item');
    if (fieldItem && !fieldItem.closest('.repeater-sub-fields-builder')) {
      e.preventDefault();
      e.stopPropagation();
      fieldItem.classList.add('drag-over');
      fieldItem.classList.remove('drag-over-invalid');
    }
  }

  /**
   * Handle drag leave
   */
  handleDragLeave(e) {
    // Check sub-field first
    const subFieldRow = e.target.closest('.sub-field-row');
    if (subFieldRow && !subFieldRow.contains(e.relatedTarget)) {
      subFieldRow.classList.remove('drag-over', 'drag-over-invalid');
      this.removeInvalidDropMessage(subFieldRow);
      return;
    }

    // Then main field
    const fieldItem = e.target.closest('.onemeta-field__item');
    if (fieldItem && !fieldItem.contains(e.relatedTarget)) {
      fieldItem.classList.remove('drag-over', 'drag-over-invalid');
    }
  }

  /**
   * Handle drop
   */
  handleDrop(e) {
    if (!this.draggedType) return;

    // PRIORITY 0: Check for insertion zone (let FieldInsertion handle it)
    const insertionZone = e.target.closest('.onemeta-insertion-zone');
    if (insertionZone) {
      // Insertion system handles this
      return;
    }

    // PRIORITY 1: Sub-field empty state
    const subEmptyState = e.target.closest('.no-sub-fields, .onemeta-sub-fields-empty-state');
    if (subEmptyState && this.draggedType) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      subEmptyState.classList.remove('drag-over-empty', 'drag-over-invalid');

      if (!this.draggedType.repeaterAllowed) {
        this.showErrorToast('This field type cannot be used in repeater sub-fields');
        return false;
      }

      this.addFieldFromEmptyState(this.draggedType, true);
      return false;
    }

    // PRIORITY 2: Main empty state
    const emptyState = e.target.closest('.onemeta-fields-empty-state');
    if (emptyState && this.draggedType) {
      e.preventDefault();
      e.stopPropagation();
      emptyState.classList.remove('drag-over-empty');
      this.addFieldFromEmptyState(this.draggedType, false);
      return;
    }

    // PRIORITY 3: Sub-field row (replace type)
    const subFieldRow = e.target.closest('.sub-field-row');
    if (subFieldRow) {
      e.preventDefault();
      e.stopPropagation();

      subFieldRow.classList.remove('drag-over', 'drag-over-invalid');
      this.removeInvalidDropMessage(subFieldRow);

      if (!this.draggedType.repeaterAllowed) {
        this.showErrorToast('This field type cannot be used in repeater sub-fields');
        return;
      }

      this.updateSubFieldType(subFieldRow, this.draggedType);

      subFieldRow.classList.add('drop-success');
      setTimeout(() => subFieldRow.classList.remove('drop-success'), 400);
      return;
    }

    // PRIORITY 4: Main field (replace type)
    const fieldItem = e.target.closest('.onemeta-field__item');
    if (fieldItem && !fieldItem.closest('.repeater-sub-fields-builder')) {
      e.preventDefault();
      e.stopPropagation();

      fieldItem.classList.remove('drag-over');

      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        this.updateFieldType(fieldItem, data);

        fieldItem.classList.add('drop-success');
        setTimeout(() => fieldItem.classList.remove('drop-success'), 400);
      } catch (error) {
        console.error('Error handling drop:', error);
      }
    }
  }

  /**
   * Update sub-field type
   */
  updateSubFieldType(subFieldRow, data) {
    const select = subFieldRow.querySelector('.sub-field-type-select');
    if (!select) {
      console.error('Could not find sub-field type select');
      return;
    }

    // Update select value
    select.value = data.type;

    // Update type display in header
    const typeDisplay = subFieldRow.querySelector('.sub-field-type');
    if (typeDisplay) {
      typeDisplay.textContent = data.type;
    }

    // Trigger change event to update settings
    select.dispatchEvent(new Event('change', {bubbles: true}));
  }

  /**
   * Update main field type
   */
  updateFieldType(fieldItem, data) {
    const select = fieldItem.querySelector('.field-type-select, .onemeta-field-type');
    if (!select) {
      console.error('Could not find field type select');
      return;
    }

    // Update select value
    select.value = data.type;

    // Create or update visual display
    this.updateVisualDisplay(fieldItem, select, data);

    // Trigger change event
    select.dispatchEvent(new Event('change', {bubbles: true}));

    // Update preview
    if (!this.core.isInitialLoad()) {
      const previewHandler = this.core.getModule('previewHandler');
      if (previewHandler) {
        previewHandler.updatePreview();
      }
    }
  }

  /**
   * Update visual display for field type
   */
  updateVisualDisplay(fieldItem, select, data) {
    let visual = fieldItem.querySelector('.field-type-visual-display');

    if (!visual) {
      visual = document.createElement('div');
      visual.className = 'field-type-visual-display';
      select.style.display = 'none';
      select.parentNode.insertBefore(visual, select);
    }

    visual.innerHTML = `
      <i class="fa-solid ${data.icon}"></i>
      <span>${data.label}</span>
      <button type="button" class="onemeta-button onemeta-button--icon onemeta-button--gradient change-type-btn" title="Change field type">
        <i class="fa-solid fa-ellipsis"></i>
      </button>
    `;

    const changeBtn = visual.querySelector('.change-type-btn');
    changeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showSelectDropdown(fieldItem, select, visual);
    });
  }

  /**
   * Show select dropdown
   */
  showSelectDropdown(fieldItem, select, visual) {
    visual.style.display = 'none';
    select.style.display = 'block';
    select.focus();

    const handleChange = () => {
      const type = select.value;
      const paletteItem = DOM.find(`.onemeta-palette-item[data-type="${type}"]`);
      const icon = paletteItem?.dataset.icon || 'fa-gear';
      const label = paletteItem?.dataset.label || type;

      this.updateVisualDisplay(fieldItem, select, {type, icon, label});
      visual.style.display = 'flex';
      select.removeEventListener('change', handleChange);
    };

    const handleBlur = () => {
      setTimeout(() => {
        select.style.display = 'none';
        visual.style.display = 'flex';
        select.removeEventListener('blur', handleBlur);
      }, 200);
    };

    select.addEventListener('change', handleChange);
    select.addEventListener('blur', handleBlur);
  }

  /**
   * Show invalid drop message
   */
  showInvalidDropMessage(element) {
    this.removeInvalidDropMessage(element);

    const message = document.createElement('div');
    message.className = 'drop-invalid-message';
    message.textContent = 'Not allowed in repeater';

    element.style.position = 'relative';
    element.appendChild(message);
  }

  /**
   * Remove invalid drop message
   */
  removeInvalidDropMessage(element) {
    const message = element.querySelector('.drop-invalid-message');
    if (message) message.remove();
  }

  /**
   * Show error toast
   */
  showErrorToast(message) {
    if (window.OnemetaToast) {
      window.OnemetaToast.error(message);
    } else {
      alert(message);
    }
  }

  /**
   * Show success feedback
   */
  showSuccessFeedback(message) {
    if (window.OnemetaToast) {
      window.OnemetaToast.success(message);
    }
  }

  /**
   * Initialize visual displays for existing fields
   */
  initExistingFields() {
    const fieldItems = DOM.findAll('.onemeta-field__item');

    fieldItems.forEach(fieldItem => {
      // Skip sub-fields
      if (fieldItem.classList.contains('sub-field-row')) return;
      if (fieldItem.closest('.repeater-sub-fields-builder')) return;

      const select = fieldItem.querySelector('.field-type-select, .onemeta-field-type');
      if (!select || select.value === '') return;

      const type = select.value;
      const paletteItem = DOM.find(`.onemeta-palette-item[data-type="${type}"]`);

      if (paletteItem) {
        this.updateVisualDisplay(fieldItem, select, {
          type: type,
          icon: paletteItem.dataset.icon,
          label: paletteItem.dataset.label
        });
      }
    });
  }

  /**
   * Update empty state text on drag over
   */
  updateEmptyStateText(element, isValid, isSubField = false) {
    const description = element.querySelector('.onemeta-fields-empty-state__description');
    if (!description) return;

    // Save original text if not already saved
    if (!description.dataset.originalText) {
      description.dataset.originalText = description.textContent;
    }

    // Update text based on validity
    if (isValid) {
      description.innerHTML = '<i class="fa-solid fa-hand-sparkles"></i> Drop here to add field';
    } else {
      description.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> This field type cannot be used in repeaters';
    }
  }

  /**
   * Restore empty state text
   */
  restoreEmptyStateText(element) {
    const description = element.querySelector('.onemeta-fields-empty-state__description');
    if (description && description.dataset.originalText) {
      description.textContent = description.dataset.originalText;
      delete description.dataset.originalText;
    }
  }

}

export default FieldDragDrop;