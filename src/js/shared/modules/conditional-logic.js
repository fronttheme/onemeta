/**
 * OneMeta Conditional Logic
 */

class ConditionalLogic {
  constructor() {
    this.init();
  }

  /**
   * Initialize conditional logic for all fields
   */
  init() {
    // Find all fields with conditional logic
    const fields = document.querySelectorAll('.onemeta-field-wrap[data-conditional]');

    fields.forEach(fieldWrap => {
      this.setupField(fieldWrap);
    });
  }

  /**
   * Setup conditional logic for a single field
   * @param {HTMLElement} fieldWrap - The field wrapper element
   */
  setupField(fieldWrap) {
    try {
      // Parse conditional logic data
      const conditionalStr = fieldWrap.dataset.conditional;
      const conditional = JSON.parse(conditionalStr);

      // Find source field - try multiple patterns
      const sourceField = document.querySelector(`[name*="[${conditional.field}]"]`);

      if (!sourceField) {
        console.warn(`Source field not found for conditional: ${conditional.field}`);
        return;
      }

      // Create visibility updater function
      const updateVisibility = () => {
        const sourceValue = this.getFieldValue(sourceField);
        const condValue = String(conditional.value);
        const operator = conditional.operator;

        let show = false;

        switch (operator) {
          case '==':
            show = sourceValue === condValue;
            break;
          case '!=':
            show = sourceValue !== condValue;
            break;
          case 'contains':
            // Check if source value contains the condition value
            show = sourceValue.toLowerCase().includes(condValue.toLowerCase());
            break;
          case '!contains':
            // Check if source value does NOT contain the condition value
            show = !sourceValue.toLowerCase().includes(condValue.toLowerCase());
            break;
          default:
            console.warn(`Unknown operator: ${operator}`);
        }

        // Update display
        fieldWrap.style.display = show ? 'grid' : 'none';
      };

      // Bind events based on field type
      this.bindEvents(sourceField, updateVisibility);

      // Initial visibility check
      updateVisibility();

    } catch (error) {
      console.error('Error setting up conditional logic:', error);
    }
  }

  /**
   * Get value from field based on its type
   * @param {HTMLElement} field - The input field
   * @returns {string} The field value
   */
  getFieldValue(field) {
    const type = field.getAttribute('type');
    const tagName = field.tagName;

    // Radio button - get checked value from group
    if (type === 'radio') {
      const name = field.getAttribute('name');
      const checked = document.querySelector(`input[name="${name}"]:checked`);
      return checked ? String(checked.value) : '';
    }

    // Checkbox/Toggle - return '1' or '0'
    if (type === 'checkbox') {
      return field.checked ? '1' : '0';
    }

    // Select dropdown - get selected value
    if (tagName === 'SELECT') {
      return String(field.value || '');
    }

    // Textarea
    if (tagName === 'TEXTAREA') {
      return String(field.value || '');
    }

    // Text input, email, url, etc.
    return String(field.value || '');
  }

  /**
   * Bind appropriate events to source field
   * @param {HTMLElement} sourceField - The field to watch
   * @param {Function} callback - Function to call on change
   */
  bindEvents(sourceField, callback) {
    const type = sourceField.getAttribute('type');
    const tagName = sourceField.tagName;

    if (type === 'radio') {
      // For radio buttons, bind to all radios in the group
      const name = sourceField.getAttribute('name');
      const radios = document.querySelectorAll(`input[name="${name}"]`);

      radios.forEach(radio => {
        radio.addEventListener('change', callback);
      });
    } else if (tagName === 'SELECT') {
      // For select dropdowns
      sourceField.addEventListener('change', callback);
    } else {
      // For text inputs, textareas, etc. - listen to multiple events
      const events = ['input', 'change', 'blur'];

      events.forEach(eventType => {
        sourceField.addEventListener(eventType, callback);
      });
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ConditionalLogic();
  });
} else {
  // DOM already loaded
  new ConditionalLogic();
}

export default ConditionalLogic;