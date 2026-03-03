/**
 * Repeater Fields Handler
 * Add, remove, and sort repeater rows
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {delegate, trigger} from '@/js/shared/utils/events';

export class RepeaterFields {
  constructor() {
    this.rowIndex = Date.now();
    this.init();
  }

  /**
   * Initialize repeater handlers
   */
  init() {
    this.bindAddButton();
    this.bindRemoveButton();
    this.initializeSortable();
    this.initializeExistingRows();
  }

  /**
   * Bind add row button
   */
  bindAddButton() {
    delegate('.onemeta-add-repeater-row', 'click', (e) => {
      e.preventDefault();
      this.addRow(e.target);
    });
  }

  /**
   * Add new repeater row
   * @param {HTMLElement} button - Add button
   */
  addRow(button) {
    const fieldId = button.dataset.field;
    const container = button.parentElement?.querySelector('.onemeta-repeater-items');
    const templateEl = document.getElementById(`onemeta-repeater-template-${fieldId}`);

    if (!templateEl || !container) {
      console.warn('Repeater template or container not found');
      return;
    }

    // Get template HTML and replace index placeholder
    const template = templateEl.innerHTML;
    const newRow = template.replace(/\{\{INDEX\}\}/g, this.rowIndex);

    // Insert new row
    container.insertAdjacentHTML('beforeend', newRow);

    this.rowIndex++;

    // Get the newly added row
    const newRowEl = container.lastElementChild;

    // Initialize conditionals for new row
    this.initializeRowConditionals(newRowEl);

    // Trigger custom event
    trigger(container, 'onemeta:row-added', {row: newRowEl});
  }

  /**
   * Bind remove row button
   */
  bindRemoveButton() {
    delegate('.onemeta-remove-repeater-row', 'click', function (e) {
      e.preventDefault();

      if (!confirm('Are you sure you want to delete this item?')) {
        return;
      }

      const row = DOM.closest(this, '.onemeta-repeater-row');
      if (!row) return;

      // Fade out and remove
      DOM.fadeOut(row, 200).then(() => {
        DOM.remove(row);
      });
    });
  }

  /**
   * Initialize jQuery UI Sortable for repeater rows
   * ⚠️ WordPress doesn't provide vanilla alternative
   */
  initializeSortable() {
    jQuery('.onemeta-repeater-items').sortable({
      handle: '.onemeta-repeater-row-handle',
      cursor: 'move',
      placeholder: 'onemeta-repeater-placeholder',
      opacity: 0.6,
      start: function (e, ui) {
        ui.placeholder.height(ui.item.height());
      }
    });
  }

  /**
   * Initialize existing rows on page load
   */
  initializeExistingRows() {
    const rows = DOM.findAll('.onemeta-repeater-row');
    rows.forEach(row => {
      this.initializeRowConditionals(row);
    });
  }

  /**
   * Initialize conditional logic within a repeater row
   * @param {HTMLElement} row - Repeater row element
   */
  initializeRowConditionals(row) {
    const rowIndex = row.dataset.index;

    // Find all select/radio fields that trigger conditionals
    const triggers = DOM.findAll('select, input[type="radio"]', row);

    triggers.forEach(field => {
      const handler = () => {
        this.checkRowConditionals(row, field);
      };

      // Bind change event
      field.addEventListener('change', handler);

      // Trigger on init
      handler();
    });
  }

  /**
   * Check and apply conditional logic within a row
   * @param {HTMLElement} row - Repeater row
   * @param {HTMLElement} field - Trigger field
   */
  checkRowConditionals(row, field) {
    const fieldName = field.getAttribute('name');
    const fieldValue = field.value;

    // Extract field identifier from name (e.g., [field_name])
    const matches = fieldName.match(/\[([^\]]+)\]$/);
    if (!matches) return;

    const fieldId = matches[1];

    // Find all conditional fields in this row
    const conditionals = DOM.findAll(`[data-condition="${fieldId}"]`, row);

    conditionals.forEach(conditional => {
      const requiredValue = String(conditional.dataset.value);
      let shouldShow = false;

      if (requiredValue.includes(',')) {
        // Multiple values (OR condition)
        const values = requiredValue.split(',');
        shouldShow = values.some(val => fieldValue.includes(val));
      } else {
        // Single value
        shouldShow = String(fieldValue) === requiredValue;
      }

      // Show/hide conditional field
      if (shouldShow) {
        DOM.addClass(conditional, 'active');
        DOM.show(conditional, 'block');
      } else {
        DOM.removeClass(conditional, 'active');
        DOM.hide(conditional);
      }
    });
  }
}

export default RepeaterFields;