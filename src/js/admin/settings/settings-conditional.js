/**
 * Settings Conditional - Conditional Logic
 * Handles conditional logic configuration
 *
 * @package OneMeta
 */

export class SettingsConditional {
  constructor(renderer) {
    this.renderer = renderer;
  }

  /**
   * Render conditional logic builder
   * @param {string} key - Setting key
   * @param {Object} config - Setting config
   * @param {*} value - Current value
   * @returns {string} HTML
   */
  renderConditionalLogic(key, config, value) {
    // Parse existing value
    const isEnabled = value && value.field ? true : false;
    const selectedField = value && value.field ? value.field : '';
    const selectedOperator = value && value.operator ? value.operator : '==';
    const condValue = value && value.value !== undefined ? value.value : '';

    // Determine value type
    let valueType = 'custom';
    if (condValue === '') {
      valueType = 'empty';
    } else if (condValue === '1') {
      valueType = '1';
    } else if (condValue === '0') {
      valueType = '0';
    }

    let html = `<div class="conditional-logic-builder" data-setting-key="${key}">`;

    // Enable checkbox
    html += '<label class="conditional-enable">';
    html += `<input type="checkbox" class="conditional-enable-checkbox" ${isEnabled ? 'checked' : ''}>`;
    html += ' Enable Conditional Logic';
    html += '</label>';

    // Conditions container
    html += `<div class="conditional-rules" style="${isEnabled ? '' : 'display:none;'}">`;
    html += '<p class="conditional-label">Show this field if:</p>';

    // Rule
    html += '<div class="conditional-rule">';

    // Field select (populated in initializeComponents)
    html += `<select class="conditional-field-select" data-selected="${this.renderer.escapeHtml(selectedField)}">`;
    html += '<option value="">Select field...</option>';
    html += '</select>';

    // Operator select
    html += '<select class="conditional-operator">';
    html += `<option value="==" ${selectedOperator === '==' ? 'selected' : ''}>is equal to</option>`;
    html += `<option value="!=" ${selectedOperator === '!=' ? 'selected' : ''}>is not equal to</option>`;
    html += `<option value="contains" ${selectedOperator === 'contains' ? 'selected' : ''}>contains</option>`;
    html += `<option value="!contains" ${selectedOperator === '!contains' ? 'selected' : ''}>does not contain</option>`;
    html += '</select>';

    // Value type selector
    html += '<select class="conditional-value-type">';
    html += `<option value="1" ${valueType === '1' ? 'selected' : ''}>True (1)</option>`;
    html += `<option value="0" ${valueType === '0' ? 'selected' : ''}>False (0)</option>`;
    html += `<option value="empty" ${valueType === 'empty' ? 'selected' : ''}>Empty</option>`;
    html += `<option value="custom" ${valueType === 'custom' ? 'selected' : ''}>Custom Value</option>`;
    html += '</select>';

    // Custom value input (shown only when "Custom Value" is selected)
    const showCustomInput = valueType === 'custom';
    const customValue = valueType === 'custom' ? condValue : '';
    html += `<input type="text" class="conditional-value-custom" value="${this.renderer.escapeHtml(customValue)}" placeholder="Enter value" style="display: ${showCustomInput ? 'inline-block' : 'none'};">`;

    html += '</div>'; // .conditional-rule
    html += '</div>'; // .conditional-rules
    html += '</div>'; // .conditional-logic-builder

    return html;
  }

  /**
   * Initialize conditional logic components
   * @param {jQuery} $container - Container element
   */
  initializeComponents($container) {
    const self = this;

    // Toggle visibility
    $container.find('.conditional-enable-checkbox').on('change', function () {
      const $rules = jQuery(this).closest('.conditional-logic-builder').find('.conditional-rules');
      if (jQuery(this).is(':checked')) {
        $rules.show();
      } else {
        $rules.hide();
      }
    });

    // Handle operator change - show/hide value selectors
    $container.on('change', '.conditional-operator', function () {
      const operator = jQuery(this).val();
      const $rule = jQuery(this).closest('.conditional-rule');
      const $valueType = $rule.find('.conditional-value-type');
      const $customInput = $rule.find('.conditional-value-custom');

      // If "contains" or "!contains", show only custom input
      if (operator === 'contains' || operator === '!contains') {
        $valueType.hide();
        $customInput.show().attr('placeholder', 'Enter text to match').focus();
      } else {
        // Show value type dropdown for other operators
        $valueType.show();
        // Toggle custom input based on current selection
        if ($valueType.val() === 'custom') {
          $customInput.show().attr('placeholder', 'Enter value');
        } else {
          $customInput.hide();
        }
      }
    });

    // Toggle custom input visibility when value type changes
    $container.on('change', '.conditional-value-type', function () {
      const $customInput = jQuery(this).siblings('.conditional-value-custom');
      if (jQuery(this).val() === 'custom') {
        $customInput.show().attr('placeholder', 'Enter value').focus();
      } else {
        $customInput.hide();
      }
    });

    // Initialize visibility on load
    $container.find('.conditional-operator').each(function () {
      const operator = jQuery(this).val();
      const $rule = jQuery(this).closest('.conditional-rule');
      const $valueType = $rule.find('.conditional-value-type');
      const $customInput = $rule.find('.conditional-value-custom');

      if (operator === 'contains' || operator === '!contains') {
        $valueType.hide();
        $customInput.show().attr('placeholder', 'Enter text to match');
      }
    });

    // Populate field dropdown
    $container.find('.conditional-field-select').each(function () {
      const $select = jQuery(this);
      const selectedField = $select.data('selected');
      const $currentField = $select.closest('.onemeta-field__item');
      const currentFieldKey = $currentField.find('.onemeta-field-key').val();

      // Get all other fields
      jQuery('#onemeta-fields-container .onemeta-field__item').each(function () {
        const fieldKey = jQuery(this).find('.onemeta-field-key').val();
        const fieldLabel = jQuery(this).find('.onemeta-field-label').val();

        // Don't show current field
        if (fieldKey && fieldKey !== currentFieldKey) {
          const isSelected = (fieldKey === selectedField) ? ' selected' : '';
          $select.append(`<option value="${fieldKey}"${isSelected}>${fieldLabel} (${fieldKey})</option>`);
        }
      });
    });
  }

  /**
   * Get conditional logic values
   * @param {jQuery} $container - Container element
   * @returns {Object}
   */
  getValues($container) {
    const values = {};

    $container.find('.conditional-logic-builder').each(function () {
      const $builder = jQuery(this);
      const key = $builder.data('setting-key');
      const isEnabled = $builder.find('.conditional-enable-checkbox').is(':checked');

      if (isEnabled) {
        const field = $builder.find('.conditional-field-select').val();
        const operator = $builder.find('.conditional-operator').val();

        // Get value based on operator
        let condValue;
        if (operator === 'contains' || operator === '!contains') {
          // For contains operators, always use custom input
          condValue = $builder.find('.conditional-value-custom').val();
        } else {
          // For other operators, check value type
          const valueType = $builder.find('.conditional-value-type').val();
          if (valueType === 'custom') {
            condValue = $builder.find('.conditional-value-custom').val();
          } else if (valueType === 'empty') {
            condValue = '';
          } else {
            condValue = valueType; // '1' or '0'
          }
        }

        if (field) {
          values[key] = {
            field: field,
            operator: operator,
            value: condValue
          };
        }
      }
    });

    return values;
  }
}

export default SettingsConditional;