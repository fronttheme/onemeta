/**
 * Settings Choices - Choice-Based Fields
 * Handles select, radio, checkbox, button group choices
 *
 * @package OneMeta
 */

export class SettingsChoices {
  constructor(renderer) {
    this.renderer = renderer;
  }

  /**
   * Render choices builder
   * @param {string} key - Setting key
   * @param {Object} config - Setting config
   * @param {*} value - Current value (object with key/label pairs)
   * @returns {string} HTML
   */
  renderChoicesBuilder(key, config, value) {
    const choices = [];

    // Convert value object to array
    if (value && typeof value === 'object') {
      Object.keys(value).forEach(choiceKey => {
        choices.push({
          key: choiceKey,
          label: value[choiceKey]
        });
      });
    }

    let html = `<div class="choices-builder" data-setting-key="${key}">`;
    html += '<div class="choices-list">';

    // Render existing choices
    if (choices.length > 0) {
      choices.forEach(choice => {
        html += this.renderChoiceRow(choice.key, choice.label);
      });
    }

    html += '</div>';
    html += '<button type="button" class="add-choice-btn onemeta-button onemeta-button--primary"><i class="fa-solid fa-plus"></i>Add Choice</button>';
    html += '</div>';

    return html;
  }

  /**
   * Render single choice row
   * @param {string} key - Choice key
   * @param {string} label - Choice label
   * @returns {string} HTML
   */
  renderChoiceRow(key, label) {
    let html = '<div class="choice-row">';
    html += `<input type="text" class="choice-key" value="${this.renderer.escapeHtml(key)}" placeholder="key">`;
    html += `<input type="text" class="choice-label" value="${this.renderer.escapeHtml(label)}" placeholder="Label">`;
    html += '<i class="fa-solid fa-xmark remove-choice"></i>';
    html += '</div>';
    return html;
  }

  /**
   * Initialize choices components
   * @param {jQuery} $container - Container element
   */
  initializeComponents($container) {
    const self = this;

    // Add choice button
    $container.find('.add-choice-btn').on('click', function() {
      const $choicesList = jQuery(this).siblings('.choices-list');
      const newRow = self.renderChoiceRow('', '');
      $choicesList.append(newRow);
    });

    // Remove choice button
    $container.on('click', '.remove-choice', function() {
      jQuery(this).closest('.choice-row').remove();
    });
  }

  /**
   * Get choices values
   * @param {jQuery} $container - Container element
   * @returns {Object}
   */
  getValues($container) {
    const values = {};

    $container.find('.choices-builder').each(function() {
      const $builder = jQuery(this);
      const key = $builder.data('setting-key');
      const choices = {};

      $builder.find('.choice-row').each(function() {
        const choiceKey = jQuery(this).find('.choice-key').val();
        const choiceLabel = jQuery(this).find('.choice-label').val();

        if (choiceKey) {
          choices[choiceKey] = choiceLabel;
        }
      });

      if (Object.keys(choices).length > 0) {
        values[key] = choices;
      }
    });

    return values;
  }
}

export default SettingsChoices;