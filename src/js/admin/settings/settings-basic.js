/**
 * Settings Basic - Basic Input Types
 * Handles text, number, textarea, toggle, select, etc.
 *
 * @package OneMeta
 */

export class SettingsBasic {
  constructor(renderer) {
    this.renderer = renderer;
  }

  /**
   * Render basic setting
   * @param {string} key - Setting key
   * @param {Object} config - Setting config
   * @param {*} value - Current value
   * @returns {string} HTML
   */
  renderBasicSetting(key, config, value) {
    switch (config.type) {
      case 'text':
      case 'url':
      case 'email':
        return this.renderTextInput(key, config, value);

      case 'number':
        return this.renderNumberInput(key, config, value);

      case 'textarea':
        return this.renderTextarea(key, config, value);

      case 'toggle':
        return this.renderToggle(key, config, value);

      case 'select':
        return this.renderSelect(key, config, value);

      case 'checkbox':
        return this.renderCheckbox(key, config, value);

      case 'date':
        return this.renderDateInput(key, config, value);

      default:
        return this.renderTextInput(key, config, value);
    }
  }

  /**
   * Render text input
   */
  renderTextInput(key, config, value) {
    const inputType = config.type || 'text';
    const displayValue = value !== undefined && value !== null ? value : '';

    let html = `<input type="${inputType}" `;
    html += `class="field-setting-input" `;
    html += `data-setting-key="${key}" `;
    html += `value="${this.renderer.escapeHtml(displayValue)}" `;

    if (config.placeholder) {
      html += `placeholder="${this.renderer.escapeHtml(config.placeholder)}" `;
    }
    html += '>';
    return html;
  }

  /**
   * Render number input
   */
  renderNumberInput(key, config, value) {
    const displayValue = value !== undefined && value !== null ? value : '';

    let html = `<input type="number" `;
    html += `class="field-setting-input" `;
    html += `data-setting-key="${key}" `;
    html += `value="${this.renderer.escapeHtml(displayValue)}" `;

    if (config.placeholder) {
      html += `placeholder="${this.renderer.escapeHtml(config.placeholder)}" `;
    }
    if (config.min !== undefined) {
      html += `min="${config.min}" `;
    }
    if (config.max !== undefined) {
      html += `max="${config.max}" `;
    }
    html += '>';
    return html;
  }

  /**
   * Render textarea
   */
  renderTextarea(key, config, value) {
    const rows = config.rows || 3;
    const displayValue = value !== undefined && value !== null ? value : '';

    let html = `<textarea `;
    html += `class="field-setting-input" `;
    html += `data-setting-key="${key}" `;
    html += `rows="${rows}" `;

    if (config.placeholder) {
      html += `placeholder="${this.renderer.escapeHtml(config.placeholder)}" `;
    }
    html += '>';
    html += this.renderer.escapeHtml(displayValue);
    html += '</textarea>';
    return html;
  }

  /**
   * Render toggle (dropdown)
   */
  renderToggle(key, config, value) {
    const choices = config.choices || { '0': 'Off', '1': 'On' };
    const selectedValue = value !== undefined && value !== null ? value : (config.default || '0');

    let html = `<select `;
    html += `class="field-setting-input" `;
    html += `data-setting-key="${key}">`;

    Object.keys(choices).forEach(choiceValue => {
      const selected = String(selectedValue) === String(choiceValue) ? ' selected' : '';
      html += `<option value="${choiceValue}"${selected}>${choices[choiceValue]}</option>`;
    });

    html += '</select>';
    return html;
  }

  /**
   * Render select dropdown
   */
  renderSelect(key, config, value) {
    const selectedValue = value !== undefined && value !== null ? value : (config.default || '');

    let html = `<select `;
    html += `class="field-setting-input" `;
    html += `data-setting-key="${key}">`;

    if (config.choices) {
      Object.keys(config.choices).forEach(choiceValue => {
        const selected = String(selectedValue) === String(choiceValue) ? ' selected' : '';
        html += `<option value="${choiceValue}"${selected}>${config.choices[choiceValue]}</option>`;
      });
    }

    html += '</select>';
    return html;
  }

  /**
   * Render checkbox (for default values)
   */
  renderCheckbox(key, config, value) {
    // Convert array to comma-separated string
    let stringValue = '';
    if (Array.isArray(value)) {
      stringValue = value.join(', ');
    } else if (typeof value === 'string') {
      stringValue = value;
    }

    let html = `<input type="text" class="field-setting-input" `;
    html += `data-setting-key="${key}" `;
    html += `value="${this.renderer.escapeHtml(stringValue)}" `;
    html += `placeholder="e.g., red, green" `;
    html += `style="width: 100%;">`;

    html += `<div class="description" style="margin-top: 5px;">`;
    html += `Enter comma-separated choice values (e.g., red, green)`;
    html += `</div>`;

    html += `<div class="description" style="font-size: 11px; color: #666; margin-top: 3px;">`;
    html += `Tip: Check the "Choices" setting above to see available values`;
    html += `</div>`;

    return html;
  }

  /**
   * Render date input
   */
  renderDateInput(key, config, value) {
    const displayValue = value !== undefined && value !== null ? value : '';

    let html = `<input type="date" `;
    html += `class="field-setting-input" `;
    html += `data-setting-key="${key}" `;
    html += `value="${this.renderer.escapeHtml(displayValue)}" `;
    html += '>';
    return html;
  }
}

export default SettingsBasic;