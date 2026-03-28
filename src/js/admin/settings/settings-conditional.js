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
    const isEnabled = value && value.rules && value.rules.length > 0;
    const relation = value?.relation || 'AND';
    const rules = value?.rules || [];

    let html = `<div class="conditional-logic-builder" data-setting-key="${key}" data-relation="${relation}">`;

    html += '<label class="conditional-enable">';
    html += `<input type="checkbox" class="conditional-enable-checkbox" ${isEnabled ? 'checked' : ''}>`;
    html += ' Enable Conditional Logic';
    html += '</label>';

    html += `<div class="conditional-rules" style="${isEnabled ? '' : 'display:none;'}">`;

    // Rules list
    html += '<div class="conditional-rules-list">';
    if (rules.length > 0) {
      rules.forEach((rule, index) => {
        html += this.renderRule(rule, index);
      });
    } else {
      html += this.renderRule({}, 0);
    }
    html += '</div>';

    // Add condition button
    html += '<button type="button" class="onemeta-button onemeta-button--secondary onemeta-button--small conditional-add-rule">';
    html += '<i class="fa-solid fa-plus"></i> Add Condition';
    html += '</button>';

    html += '</div>';
    html += '</div>';

    return html;
  }

  renderRule(rule = {}, index = 0) {
    const selectedField = rule.field || '';
    const selectedOperator = rule.operator || '==';
    const condValue = rule.value !== undefined ? rule.value : '';

    let valueType = 'custom';
    if (condValue === '1') valueType = '1';
    else if (condValue === '0') valueType = '0';
    else if (condValue === '') valueType = 'empty';

    const hideValueType = ['contains', '!contains'].includes(selectedOperator);
    const showCustom = valueType === 'custom' || hideValueType;
    const placeholder = hideValueType ? 'Enter text to match' : 'Enter value';
    const customValue = valueType === 'custom' ? condValue : '';

    let html = `<div class="conditional-rule" data-index="${index}">`;

    // Field select
    html += `<select class="conditional-field-select" data-selected="${this.renderer.escapeHtml(selectedField)}">`;
    html += '<option value="">Select field...</option>';
    html += '</select>';

    // Operator
    html += '<select class="conditional-operator">';
    html += `<option value="==" ${selectedOperator === '==' ? 'selected' : ''}>is equal to</option>`;
    html += `<option value="!=" ${selectedOperator === '!=' ? 'selected' : ''}>is not equal to</option>`;
    html += `<option value="contains" ${selectedOperator === 'contains' ? 'selected' : ''}>contains</option>`;
    html += `<option value="!contains" ${selectedOperator === '!contains' ? 'selected' : ''}>does not contain</option>`;
    html += '</select>';

    // Value type
    html += `<select class="conditional-value-type" style="display:${hideValueType ? 'none' : 'inline-block'};">`;
    html += `<option value="1"     ${valueType === '1' ? 'selected' : ''}>True (1)</option>`;
    html += `<option value="0"     ${valueType === '0' ? 'selected' : ''}>False (0)</option>`;
    html += `<option value="empty" ${valueType === 'empty' ? 'selected' : ''}>Empty</option>`;
    html += `<option value="custom"${valueType === 'custom' ? 'selected' : ''}>Custom Value</option>`;
    html += '</select>';

    // Custom value input
    html += `<input type="text" class="conditional-value-custom" value="${this.renderer.escapeHtml(customValue)}" placeholder="${placeholder}" style="display:${showCustom ? 'inline-block' : 'none'};">`;

    // Remove button (hidden when only one rule)
    html += '<button type="button" class="onemeta-button onemeta-button--icon onemeta-button--liquid onemeta-button--danger conditional-remove-rule" style="display:none;" title="Remove">';
    html += '<i class="fa-solid fa-trash-can"></i>';
    html += '</button>';

    html += '</div>';

    return html;
  }

  renderConditionalLogic__BACKUP_WORKING(key, config, value) {
    // Parse existing value
    const isEnabled = value && value.rules && value.rules.length > 0;
    const rule = isEnabled ? value.rules[0] : {};
    const selectedField = rule.field || '';
    const selectedOperator = rule.operator || '==';
    const condValue = rule.value !== undefined ? rule.value : '';

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

    $container.on('change', '.conditional-relation-select', function () {
      jQuery(this).closest('.conditional-logic-builder')
        .data('relation', jQuery(this).val());
    });

    // Toggle rules visibility
    $container.find('.conditional-enable-checkbox').on('change', function () {
      const $rules = jQuery(this).closest('.conditional-logic-builder').find('.conditional-rules');
      jQuery(this).is(':checked') ? $rules.show() : $rules.hide();
    });

    // Add rule
    $container.on('click', '.conditional-add-rule', function () {
      const $builder = jQuery(this).closest('.conditional-logic-builder');
      const $list = $builder.find('.conditional-rules-list');
      const index = $list.find('.conditional-rule').length;
      const $newRule = jQuery(self.renderRule({}, index));

      $list.append($newRule);
      self.populateFieldSelect($newRule.find('.conditional-field-select'), $builder);
      self.updateRulesUI($builder);
    });

    // Remove rule
    $container.on('click', '.conditional-remove-rule', function () {
      const $builder = jQuery(this).closest('.conditional-logic-builder');
      jQuery(this).closest('.conditional-rule').remove();
      self.updateRulesUI($builder);
    });

    // Operator change
    $container.on('change', '.conditional-operator', function () {
      const operator = jQuery(this).val();
      const $rule = jQuery(this).closest('.conditional-rule');
      const $valueType = $rule.find('.conditional-value-type');
      const $customInput = $rule.find('.conditional-value-custom');

      if (operator === 'contains' || operator === '!contains') {
        $valueType.hide();
        $customInput.show().attr('placeholder', 'Enter text to match').focus();
      } else {
        $valueType.show();
        $customInput.attr('placeholder', 'Enter value');
        $valueType.val() === 'custom' ? $customInput.show() : $customInput.hide();
      }
    });

    // Value type change
    $container.on('change', '.conditional-value-type', function () {
      const $customInput = jQuery(this).siblings('.conditional-value-custom');
      jQuery(this).val() === 'custom'
        ? $customInput.show().attr('placeholder', 'Enter value').focus()
        : $customInput.hide();
    });

    // Populate field dropdowns for existing rules
    $container.find('.conditional-field-select').each(function () {
      self.populateFieldSelect(jQuery(this), jQuery(this).closest('.conditional-logic-builder'));
    });

    // Initialize operator state on load
    $container.find('.conditional-operator').each(function () {
      const operator = jQuery(this).val();
      const $rule = jQuery(this).closest('.conditional-rule');
      const $valueType = $rule.find('.conditional-value-type');
      const $customInput = $rule.find('.conditional-value-custom');

      if (operator === 'contains' || operator === '!contains') {
        $valueType.hide();
        $customInput.show();
      }
    });

    // Initial UI state
    $container.find('.conditional-logic-builder').each(function () {
      self.updateRulesUI(jQuery(this));
    });
  }

  populateFieldSelect($select, $builder) {
    const selectedField = $select.data('selected');
    const $currentField = $builder.closest('.onemeta-field__item');
    const currentFieldKey = $currentField.find('.onemeta-field-key').val();

    jQuery('#onemeta-fields-container .onemeta-field__item').each(function () {
      const fieldKey = jQuery(this).find('.onemeta-field-key').val();
      const fieldLabel = jQuery(this).find('.onemeta-field-label').val();
      const fieldType = jQuery(this).find('.onemeta-field-type').val();

      if (!fieldKey || fieldKey === currentFieldKey || fieldType === 'heading') return;

      const isSelected = fieldKey === selectedField ? ' selected' : '';
      $select.append(`<option value="${fieldKey}"${isSelected}>${fieldLabel} (${fieldKey})</option>`);
    });
  }

  updateRulesUI($builder) {
    const $rules = $builder.find('.conditional-rule');
    const count = $rules.length;
    const $rulesList = $builder.find('.conditional-rules-list');

    // Show/hide remove buttons — only show when more than one rule
    $rules.find('.conditional-remove-rule').toggle(count > 1);

    // Add/remove relation selector
    const $existing = $builder.find('.conditional-relation');
    if (count > 1 && $existing.length === 0) {
      const relation = $builder.find('.conditional-relation-select').val()
        || $builder.data('relation')
        || 'AND';
      const $relation = jQuery(`
      <div class="conditional-relation">
        <span>Match</span>
        <select class="conditional-relation-select">
          <option value="AND" ${relation === 'AND' ? 'selected' : ''}>ALL conditions</option>
          <option value="OR"  ${relation === 'OR' ? 'selected' : ''}>ANY condition</option>
        </select>
      </div>
    `);
      $rulesList.before($relation);
    } else if (count <= 1) {
      $existing.remove();
    }
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

      if (!isEnabled) return;

      const relation = $builder.find('.conditional-relation-select').val() || 'AND';
      const rules = [];

      $builder.find('.conditional-rule').each(function () {
        const $rule = jQuery(this);
        const field = $rule.find('.conditional-field-select').val();
        const operator = $rule.find('.conditional-operator').val();

        if (!field) return; // skip empty rules

        let condValue;
        if (operator === 'contains' || operator === '!contains') {
          condValue = $rule.find('.conditional-value-custom').val();
        } else {
          const valueType = $rule.find('.conditional-value-type').val();
          condValue = valueType === 'custom'
            ? $rule.find('.conditional-value-custom').val()
            : valueType === 'empty' ? '' : valueType;
        }

        rules.push({field, operator, value: condValue});
      });

      if (rules.length > 0) {
        values[key] = {relation, rules};
      }
    });

    return values;
  }
}

export default SettingsConditional;