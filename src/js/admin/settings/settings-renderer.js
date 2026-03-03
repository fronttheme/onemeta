/**
 * Settings Renderer - Base Class
 * Orchestrates field settings rendering
 *
 * @package OneMeta
 */

import SettingsBasic from './settings-basic';
import SettingsChoices from './settings-choices';
import SettingsRepeater from './settings-repeater';
import SettingsConditional from './settings-conditional';

export class SettingsRenderer {
  constructor() {
    this.renderCount = 0;

    // Initialize sub-renderers
    this.basicRenderer = new SettingsBasic(this);
    this.choicesRenderer = new SettingsChoices(this);
    this.repeaterRenderer = new SettingsRepeater(this);
    this.conditionalRenderer = new SettingsConditional(this);
  }

  /**
   * Render settings for a field type
   * @param {string} fieldType - Field type
   * @param {jQuery} $container - Container element
   * @param {Object} currentValues - Current field values
   */
  render(fieldType, $container, currentValues = {}) {
    this.renderCount++;

    const schema = window.onemetaBuilder?.schemas?.[fieldType] || {};

    // Clear existing settings
    $container.empty();

    // No settings for this field type
    if (Object.keys(schema).length === 0) {
      return;
    }

    // Render each setting
    Object.keys(schema).forEach(settingKey => {
      const settingConfig = schema[settingKey];

      // Get saved value or default
      let value = currentValues[settingKey];
      if (value === undefined || value === null) {
        value = settingConfig.default || '';
      }

      // Render setting based on type
      const html = this.renderSetting(settingKey, settingConfig, value);
      $container.append(html);
    });

    // Initialize interactive components
    this.initializeComponents($container);
  }

  /**
   * Render a single setting
   * @param {string} key - Setting key
   * @param {Object} config - Setting configuration
   * @param {*} value - Current value
   * @returns {string} HTML
   */
  renderSetting(key, config, value) {
    let html = `<div class="setting-row" data-setting-key="${key}">`;

    // Skip label for complex types (they handle their own labels)
    if (config.type !== 'repeater_sub_fields') {
      html += `<label>${this.escapeHtml(config.label)}</label>`;
    }

    // Route to appropriate renderer
    switch (config.type) {
      case 'choices':
        html += this.choicesRenderer.renderChoicesBuilder(key, config, value);
        break;

      case 'repeater_sub_fields':
        html += this.repeaterRenderer.renderRepeaterSubFields(key, config, value);
        break;

      case 'conditional_logic':
        html += this.conditionalRenderer.renderConditionalLogic(key, config, value);
        break;

      default:
        html += this.basicRenderer.renderBasicSetting(key, config, value);
    }

    html += '</div>';
    return html;
  }

  /**
   * Initialize interactive components
   * @param {jQuery} $container - Container element
   */
  initializeComponents($container) {
    // Initialize all sub-renderers
    this.choicesRenderer.initializeComponents($container);
    this.repeaterRenderer.initializeComponents($container);
    this.conditionalRenderer.initializeComponents($container);
  }

  /**
   * Get all settings values from container
   * @param {jQuery} $container - Container element
   * @returns {Object}
   */
  getValues($container) {
    const values = {};

    // Basic inputs
    $container.find('.field-setting-input').each(function () {
      const $input = jQuery(this);
      const key = $input.data('setting-key');
      const value = $input.val();

      if (key && value !== '') {
        values[key] = value;
      }
    });

    // Get complex field values from sub-renderers
    Object.assign(values, this.choicesRenderer.getValues($container));
    Object.assign(values, this.repeaterRenderer.getValues($container));
    Object.assign(values, this.conditionalRenderer.getValues($container));

    return values;
  }

  /**
   * Escape HTML
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }
}

// Expose globally for backward compatibility
window.OnemetaFieldSettings = new SettingsRenderer();

export default SettingsRenderer;