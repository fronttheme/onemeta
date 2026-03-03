/**
 * Settings Repeater - Repeater Sub-Fields
 * Handles repeater field sub-field configuration
 *
 * @package OneMeta
 */

import {confirmDelete} from '@/js/shared/components/confirm';

export class SettingsRepeater {
  constructor(renderer) {
    this.renderer = renderer;
  }

  /**
   * Render repeater sub-fields builder
   * @param {string} key - Setting key
   * @param {Object} config - Setting config
   * @param {*} value - Current value (array of sub-fields)
   * @returns {string} HTML
   */
  renderRepeaterSubFields(key, config, value) {
    // Ensure value is an array
    let subFields = [];
    if (Array.isArray(value)) {
      subFields = value;
    } else if (value && typeof value === 'object') {
      subFields = Object.values(value);
    }

    let html = `<div class="repeater-sub-fields-builder" data-setting-key="${key}">`;
    html += '<div class="sub-fields-header">';
    html += `<label>${this.renderer.escapeHtml(config.label)}</label>`;
    html += '<button type="button" class="add-sub-field onemeta-button onemeta-button--secondary"><i class="fa-solid fa-plus"></i>Add Sub Field</button>';
    html += '</div>';

    html += '<div class="sub-fields-list">';

    // Render existing sub-fields
    if (subFields.length > 0) {
      subFields.forEach((subField, index) => {
        html += this.renderSubFieldRow(subField, index);
      });
    } else {
      html += `
        <div class="no-sub-fields onemeta-sub-fields-empty-state">
          <div class="onemeta-fields-empty-state__icon onemeta-empty-sub-field__add-icon">
            <i class="fa-solid fa-plus"></i>
          </div>
          <h3 class="onemeta-fields-empty-state__title">No Sub-Fields Yet</h3>
          <p class="onemeta-fields-empty-state__description">
            Drag a field type here or click "Add Sub Field" to get started.
          </p>
        </div>
      `;
    }

    html += '</div>';
    html += '</div>';

    return html;
  }

  /**
   * Render single sub-field row
   * @param {Object} subField - Sub-field data
   * @param {number} index - Row index
   * @returns {string} HTML
   */
  renderSubFieldRow(subField, index) {
    const textBasedTypes = ['text', 'textarea', 'url', 'email'];
    const choiceBasedTypes = ['select', 'checkbox', 'radio', 'button_group'];
    const currentType = subField.type || 'text';
    const showPlaceholder = textBasedTypes.includes(currentType);
    const showChoices = choiceBasedTypes.includes(currentType);
    const showToggleOptions = currentType === 'toggle';
    const showLayout = ['checkbox', 'radio'].includes(currentType);

    // Convert array default back to string for display
    let defaultValue = subField.default || '';
    if (Array.isArray(defaultValue)) {
      defaultValue = defaultValue.join(', ');
    }

    let html = `<div class="sub-field-row" data-index="${index}">`;
    html += '<div class="sub-field-header">';

    html += '<div class="onemeta-sub-field-header__text">';
    html += '<span class="sub-field-handle"><i class="fa-solid fa-key"></i></span>';
    html += `<span class="sub-field-title">${subField.label || 'Sub Field ' + (index + 1)}</span>`;
    html += `<span class="sub-field-type">${subField.type || 'text'}</span>`;
    html += '</div>';

    html += '<div class="onemeta-sub-field-header__actions">';
    html += '<button type="button" class="sub-field-toggle onemeta-button onemeta-button--icon onemeta-button--liquid"><i class="fa-solid fa-chevron-down"></i></button>';
    html += '<button type="button" class="sub-field-delete onemeta-button onemeta-button--icon onemeta-button--liquid onemeta-button--danger"><i class="fa-solid fa-trash-can"></i></button>';
    html += '</div>';

    html += '</div>';

    html += '<div class="sub-field-settings" style="display:none;">';

    // Label
    html += '<div class="sub-field-setting">';
    html += '<label>Label</label>';
    html += `<input type="text" class="sub-field-label" value="${this.renderer.escapeHtml(subField.label || '')}" placeholder="Field Label">`;
    html += '</div>';

    // Field Key
    html += '<div class="sub-field-setting">';
    html += '<label>Field Key</label>';
    html += `<input type="text" class="sub-field-key" value="${this.renderer.escapeHtml(subField.key || '')}" placeholder="field_key">`;
    html += '</div>';

    // Field Type
    html += '<div class="sub-field-setting">';
    html += '<label>Field Type</label>';
    html += '<select class="sub-field-type-select">';

    const types = [
      {value: 'text', label: 'Text'},
      {value: 'textarea', label: 'Textarea'},
      {value: 'url', label: 'URL'},
      {value: 'email', label: 'Email'},
      {value: 'select', label: 'Select'},
      {value: 'toggle', label: 'Toggle'},
      {value: 'checkbox', label: 'Checkbox'},
      {value: 'radio', label: 'Radio'},
      {value: 'button_group', label: 'Button Group'},
      {value: 'image', label: 'Image'},
      {value: 'file', label: 'File'}
    ];

    types.forEach(type => {
      const selected = subField.type === type.value ? ' selected' : '';
      html += `<option value="${type.value}"${selected}>${type.label}</option>`;
    });

    html += '</select>';
    html += '</div>';

    // Description
    html += '<div class="sub-field-setting">';
    html += '<label>Description</label>';
    html += `<input type="text" class="sub-field-description" value="${this.renderer.escapeHtml(subField.description || '')}" placeholder="Optional description">`;
    html += '</div>';

    // Placeholder (only for text-based fields)
    html += `<div class="sub-field-setting sub-field-placeholder-setting" style="display: ${showPlaceholder ? 'block' : 'none'};">`;
    html += '<label>Placeholder</label>';
    html += `<input type="text" class="sub-field-placeholder" value="${this.renderer.escapeHtml(subField.placeholder || '')}" placeholder="Optional placeholder">`;
    html += '</div>';

    // Choices (for select, checkbox, radio, button_group)
    html += `<div class="sub-field-setting sub-field-choices-setting" style="display: ${showChoices ? 'block' : 'none'};">`;
    html += '<label>Choices (one per line, format: key : label)</label>';
    html += '<textarea class="sub-field-choices" rows="4" placeholder="option1 : Option 1\noption2 : Option 2">';
    if (subField.choices) {
      const choicesText = Object.entries(subField.choices)
        .map(([key, label]) => `${key} : ${label}`)
        .join('\n');
      html += this.renderer.escapeHtml(choicesText);
    }
    html += '</textarea>';
    html += '</div>';

    // Toggle Options (for toggle field)
    html += `<div class="sub-field-setting sub-field-toggle-options" style="display: ${showToggleOptions ? 'block' : 'none'};">`;
    html += '<label>On Text</label>';
    html += `<input type="text" class="sub-field-on-text" value="${this.renderer.escapeHtml(subField.on_text || 'On')}" placeholder="On">`;
    html += '<label>Off Text</label>';
    html += `<input type="text" class="sub-field-off-text" value="${this.renderer.escapeHtml(subField.off_text || 'Off')}" placeholder="Off">`;
    html += '</div>';

    // Layout (for checkbox, radio)
    html += `<div class="sub-field-setting sub-field-layout-setting" style="display: ${showLayout ? 'block' : 'none'};">`;
    html += '<label>Layout</label>';
    html += '<select class="sub-field-layout">';
    html += `<option value="vertical"${subField.layout === 'vertical' ? ' selected' : ''}>Vertical</option>`;
    html += `<option value="horizontal"${subField.layout === 'horizontal' ? ' selected' : ''}>Horizontal</option>`;
    html += '</select>';
    html += '</div>';

    // Default Value
    html += '<div class="sub-field-setting">';
    html += '<label>Default Value';
    // Show hint for checkbox fields
    if (currentType === 'checkbox') {
      html += ' <small>(comma-separated: red, green, blue)</small>';
    }
    html += '</label>';
    html += `<input type="text" class="sub-field-default" value="${this.renderer.escapeHtml(defaultValue)}" placeholder="Default value">`;
    html += '</div>';

    html += '</div>'; // .sub-field-settings
    html += '</div>'; // .sub-field-row

    return html;
  }

  /**
   * Initialize repeater components
   * @param {jQuery} $container - Container element
   */
  initializeComponents($container) {
    const self = this;

    // Remove all previous event handlers
    $container.off('click', '.add-sub-field');
    $container.off('click', '.onemeta-empty-sub-field__add-icon');
    $container.off('click', '.sub-field-header');
    $container.off('click', '.sub-field-toggle');
    $container.off('click', '.sub-field-delete');
    $container.off('input', '.sub-field-label');
    $container.off('change', '.sub-field-type-select');

    // Shared function to add a sub-field
    const addSubField = function ($builder, shouldFocus = false) {
      const $list = $builder.find('.sub-fields-list');
      const $noFields = $list.find('.no-sub-fields');

      $noFields.remove();

      const currentRows = $list.find('.sub-field-row').length;

      const newSubField = {
        key: 'sub_field_' + Date.now(),
        label: 'Sub Field ' + (currentRows + 1),
        type: 'text',
        description: '',
        placeholder: '',
        default: ''
      };

      const html = self.renderSubFieldRow(newSubField, currentRows);
      const $newRow = jQuery(html);
      $list.append($newRow);

      // Expand immediately
      const $settings = $newRow.find('.sub-field-settings');
      const $toggle = $newRow.find('.sub-field-toggle');

      $settings.show();
      $toggle.html('<i class="fa-solid fa-chevron-up"></i>');

      // Focus and scroll if manually created
      if (shouldFocus) {
        setTimeout(() => {
          // Scroll to the new row smoothly
          $newRow[0].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Focus and select the label input
          const $labelInput = $newRow.find('.sub-field-label');
          $labelInput.focus().select();
        }, 100);
      }

      return $newRow; // Return the new row for external use
    };

    // Add sub-field button - MANUAL CREATION (with focus)
    $container.on('click', '.add-sub-field', function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Check if this is triggered by drag & drop
      const isDragDrop = jQuery(this).data('drag-drop-trigger');
      if (isDragDrop) {
        // Remove flag and don't focus
        jQuery(this).removeData('drag-drop-trigger');
        const $builder = jQuery(this).closest('.repeater-sub-fields-builder');
        addSubField($builder, false);
        return;
      }

      // Regular manual click - with focus
      const $builder = jQuery(this).closest('.repeater-sub-fields-builder');
      addSubField($builder, true);
    });

    // Empty state add icon click - MANUAL CREATION (with focus)
    $container.on('click', '.onemeta-empty-sub-field__add-icon', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const $builder = jQuery(this).closest('.repeater-sub-fields-builder');
      addSubField($builder, true);
    });

    // Toggle sub-field settings
    $container.on('click', '.sub-field-header', function (e) {
      if (jQuery(e.target).hasClass('sub-field-delete') ||
        jQuery(e.target).hasClass('sub-field-toggle') ||
        jQuery(e.target).closest('.sub-field-delete').length ||
        jQuery(e.target).closest('.sub-field-toggle').length) {
        return;
      }

      const $row = jQuery(this).closest('.sub-field-row');
      const $settings = $row.find('.sub-field-settings');
      const $toggle = $row.find('.sub-field-toggle');

      if ($settings.is(':visible')) {
        $settings.slideUp(200, function () {
          $toggle.html('<i class="fa-solid fa-chevron-down"></i>');
        });
      } else {
        $settings.slideDown(200, function () {
          $toggle.html('<i class="fa-solid fa-chevron-up"></i>');
        });
      }
    });

    // Toggle button click
    $container.on('click', '.sub-field-toggle', function (e) {
      e.stopPropagation();
      e.preventDefault();

      const $row = jQuery(this).closest('.sub-field-row');
      const $settings = $row.find('.sub-field-settings');
      const $toggle = jQuery(this);

      if ($settings.is(':visible')) {
        $settings.slideUp(200, function () {
          $toggle.html('<i class="fa-solid fa-chevron-down"></i>');
        });
      } else {
        $settings.slideDown(200, function () {
          $toggle.html('<i class="fa-solid fa-chevron-up"></i>');
        });
      }
    });

    // Delete sub-field
    $container.on('click', '.sub-field-delete', async function (e) {
      e.stopPropagation();
      e.preventDefault();

      const confirmed = await confirmDelete('this sub-field');

      if (!confirmed) {
        return;
      }

      const $row = jQuery(this).closest('.sub-field-row');
      const $list = $row.closest('.sub-fields-list');

      $row.remove();

      if ($list.find('.sub-field-row').length === 0) {
        $list.html(`
        <div class="no-sub-fields onemeta-sub-fields-empty-state">
          <div class="onemeta-fields-empty-state__icon onemeta-empty-sub-field__add-icon">
            <i class="fa-solid fa-plus"></i>
          </div>
          <h3 class="onemeta-fields-empty-state__title">No Sub-Fields Yet</h3>
          <p class="onemeta-fields-empty-state__description">
            Drag a field type here or click "Add Sub Field" to get started.
          </p>
        </div>
      `);
      }
    });

    // Update title when label changes
    $container.on('input', '.sub-field-label', function () {
      const label = jQuery(this).val();
      const $row = jQuery(this).closest('.sub-field-row');
      $row.find('.sub-field-title').text(label || 'Sub Field');
    });

    // Update UI when type changes
    $container.on('change', '.sub-field-type-select', function () {
      const type = jQuery(this).val();
      const $row = jQuery(this).closest('.sub-field-row');

      // Update type display
      $row.find('.sub-field-type').text(type);

      // Show/hide conditional settings
      const textBasedTypes = ['text', 'textarea', 'url', 'email'];
      const choiceBasedTypes = ['select', 'checkbox', 'radio', 'button_group'];

      // Placeholder
      const $placeholderSetting = $row.find('.sub-field-placeholder-setting');
      if (textBasedTypes.includes(type)) {
        $placeholderSetting.show();
      } else {
        $placeholderSetting.hide();
        $row.find('.sub-field-placeholder').val('');
      }

      // Choices
      const $choicesSetting = $row.find('.sub-field-choices-setting');
      if (choiceBasedTypes.includes(type)) {
        $choicesSetting.show();
      } else {
        $choicesSetting.hide();
        $row.find('.sub-field-choices').val('');
      }

      // Toggle Options
      const $toggleOptions = $row.find('.sub-field-toggle-options');
      if (type === 'toggle') {
        $toggleOptions.show();
      } else {
        $toggleOptions.hide();
        $row.find('.sub-field-on-text').val('On');
        $row.find('.sub-field-off-text').val('Off');
      }

      // Layout
      const $layoutSetting = $row.find('.sub-field-layout-setting');
      if (['checkbox', 'radio'].includes(type)) {
        $layoutSetting.show();
      } else {
        $layoutSetting.hide();
        $row.find('.sub-field-layout').val('vertical');
      }

      // Update default value label hint
      const $defaultLabel = $row.find('.sub-field-setting:has(.sub-field-default) label');
      if (type === 'checkbox') {
        $defaultLabel.html('Default Value <small>(comma-separated: red, green, blue)</small>');
      } else {
        $defaultLabel.text('Default Value');
      }
    });
  }

  /**
   * Get repeater values
   * @param {jQuery} $container - Container element
   * @returns {Object}
   */
  getValues($container) {
    const values = {};

    $container.find('.repeater-sub-fields-builder').each(function () {
      const $builder = jQuery(this);
      const key = $builder.data('setting-key');
      const subFields = [];

      $builder.find('.sub-field-row').each(function () {
        const $row = jQuery(this);
        const type = $row.find('.sub-field-type-select').val();
        const defaultValue = $row.find('.sub-field-default').val();

        const subField = {
          key: $row.find('.sub-field-key').val(),
          label: $row.find('.sub-field-label').val(),
          type: type,
          description: $row.find('.sub-field-description').val(),
          placeholder: $row.find('.sub-field-placeholder').val(),
          default: defaultValue
        };

        // Convert checkbox default to array
        if (type === 'checkbox' && defaultValue) {
          subField.default = defaultValue
            .split(',')
            .map(v => v.trim())
            .filter(v => v !== '');
        }

        // Parse choices if present
        const choicesText = $row.find('.sub-field-choices').val();
        if (choicesText && ['select', 'checkbox', 'radio', 'button_group'].includes(type)) {
          const choices = {};
          choicesText.split('\n').forEach(line => {
            const [key, label] = line.split(':').map(s => s.trim());
            if (key && label) {
              choices[key] = label;
            }
          });
          if (Object.keys(choices).length > 0) {
            subField.choices = choices;
          }
        }

        // Toggle options
        if (type === 'toggle') {
          subField.on_text = $row.find('.sub-field-on-text').val() || 'On';
          subField.off_text = $row.find('.sub-field-off-text').val() || 'Off';
        }

        // Layout
        if (['checkbox', 'radio'].includes(type)) {
          subField.layout = $row.find('.sub-field-layout').val() || 'vertical';
        }

        // Only add if has required fields
        if (subField.key && subField.label && subField.type) {
          subFields.push(subField);
        }
      });

      if (subFields.length > 0) {
        values[key] = subFields;
      }
    });

    return values;
  }
}

export default SettingsRepeater;