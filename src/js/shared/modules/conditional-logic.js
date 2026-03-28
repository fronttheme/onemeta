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
      const conditional = JSON.parse(fieldWrap.dataset.conditional);
      const rules = conditional.rules;
      const relation = conditional.relation || 'AND';

      // Collect all source fields
      const sourceFields = [];
      rules.forEach(rule => {
        const sourceField = document.querySelector(`[name*="[${rule.field}]"]`);
        if (sourceField) sourceFields.push({field: sourceField, rule});
        else console.warn(`Source field not found: ${rule.field}`);
      });

      if (sourceFields.length === 0) return;

      const updateVisibility = () => {
        const results = sourceFields.map(({field, rule}) => {
          const sourceValue = this.getFieldValue(field);
          const condValue = String(rule.value ?? '');

          switch (rule.operator) {
            case '==':
              return sourceValue === condValue;
            case '!=':
              return sourceValue !== condValue;
            case 'contains':
              return sourceValue.toLowerCase().includes(condValue.toLowerCase());
            case '!contains':
              return !sourceValue.toLowerCase().includes(condValue.toLowerCase());
            default:
              console.warn(`Unknown operator: ${rule.operator}`);
              return false;
          }
        });

        const show = relation === 'OR'
          ? results.some(Boolean)
          : results.every(Boolean);

        fieldWrap.style.display = show ? 'grid' : 'none';
      };

      sourceFields.forEach(({field}) => this.bindEvents(field, updateVisibility));
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

    // Checkbox group - return comma-separated checked values
    // Toggle - return '1' or '0'
    if (type === 'checkbox') {
      const name = field.getAttribute('name');
      // Checkbox groups use name="...[field][]" (ends with [])
      if (name && name.endsWith('[]')) {
        const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checked).map(cb => cb.value).join(',');
      }
      // Single toggle checkbox
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
      const name = sourceField.getAttribute('name');
      document.querySelectorAll(`input[name="${name}"]`)
        .forEach(r => r.addEventListener('change', callback));

    } else if (type === 'checkbox') {
      const name = sourceField.getAttribute('name');
      // Bind to ALL checkboxes in the group
      document.querySelectorAll(`input[name="${name}"]`)
        .forEach(cb => cb.addEventListener('change', callback));

    } else if (tagName === 'SELECT') {
      sourceField.addEventListener('change', callback);

    } else {
      ['input', 'change', 'blur']
        .forEach(e => sourceField.addEventListener(e, callback));
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