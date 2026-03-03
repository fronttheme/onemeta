/**
 * Preview Handler - PHP Code Preview
 * Generates and updates PHP code preview
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {debounce} from '@/js/shared/utils/events';
import {success, error} from '@/js/shared/components/toast';

export class PreviewHandler {
  constructor(builderCore) {
    this.builder = builderCore;
    this.isUpdating = false;
    this.init();
  }

  /**
   * Initialize preview handler
   */
  init() {
    this.bindFormChanges();
    this.bindCopyButton();
    this.bindExportButton();

    // Initial preview
    this.updatePreview();
  }

  /**
   * Bind form changes to update preview
   */
  bindFormChanges() {
    // Debounced update function
    const debouncedUpdate = debounce(() => {
      if (!this.builder.isInitialLoad()) {
        this.updatePreview();
      }
    }, 150);

    // Listen to all form changes
    document.addEventListener('input', (e) => {
      if (e.target.closest('#onemeta-builder-form')) {
        debouncedUpdate();
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.closest('#onemeta-builder-form')) {
        debouncedUpdate();
      }
    });

    // Listen to builder events
    this.builder.on('field-added', () => debouncedUpdate());
    this.builder.on('field-removed', () => debouncedUpdate());
  }

  /**
   * Update PHP preview
   */
  updatePreview() {
    // Prevent overlapping calls
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const config = this.builder.buildConfig();
      const phpCode = this.generatePHP(config);

      const codeElement = DOM.find('#php-preview code');
      if (codeElement) {
        codeElement.textContent = phpCode;
      }
    } catch (error) {
      console.error('Error updating preview:', error);
    }

    this.isUpdating = false;
  }

  /**
   * Generate PHP code from config
   * @param {Object} config - Field group configuration
   * @returns {string} PHP code
   */
  generatePHP(config) {
    let php = "<?php\n\n";
    php += "add_filter('onemeta_field_groups', function($groups) {\n\n";
    php += `    $groups['${this.escapePhpString(config.group_key)}'] = [\n`;
    php += `        'title'     => '${this.escapePhpString(config.group_title)}',\n`;
    php += `        'type'      => '${this.escapePhpString(config.group_type)}',\n`;

    if (config.group_type === 'post') {
      php += `        'post_type' => '${this.escapePhpString(config.post_type)}',\n`;
      php += `        'position'  => '${this.escapePhpString(config.position)}',\n`;
    }

    php += "        'fields'    => [\n";

    if (config.fields && Object.keys(config.fields).length > 0) {
      const fieldKeys = Object.keys(config.fields);

      fieldKeys.forEach(fieldKey => {
        const field = config.fields[fieldKey];

        php += `            '${this.escapePhpString(field.key)}' => [\n`;
        php += `                'type'  => '${this.escapePhpString(field.type)}',\n`;
        php += `                'label' => '${this.escapePhpString(field.label)}',\n`;

        // Track which properties we've already added
        const addedProperties = new Set(['key', 'type', 'label']);

        // Add description if present
        if (field.description) {
          php += `                'description' => '${this.escapePhpString(field.description)}',\n`;
          addedProperties.add('description');
        }

        // Add placeholder if present
        if (field.placeholder) {
          php += `                'placeholder' => '${this.escapePhpString(field.placeholder)}',\n`;
          addedProperties.add('placeholder');
        }

        // Handle checkbox defaults specially
        if (field.type === 'checkbox' && field.default) {
          if (typeof field.default === 'string') {
            const defaultArray = field.default.split(',')
              .map(v => v.trim())
              .filter(v => v !== '');
            php += `                'default' => ${this.formatPhpValue(defaultArray, '                ')},\n`;
          } else {
            php += `                'default' => ${this.formatPhpValue(field.default, '                ')},\n`;
          }
          addedProperties.add('default');
        } else if (field.default !== undefined && field.default !== null && field.default !== '') {
          php += `                'default' => ${this.formatPhpValue(field.default, '                ')},\n`;
          addedProperties.add('default');
        }

        // Add all other settings, but skip ones we've already added
        Object.keys(field).forEach(settingKey => {
          // Skip if already added or empty
          if (addedProperties.has(settingKey)) {
            return;
          }

          const settingValue = field[settingKey];

          // Skip null, undefined, or empty string
          if (settingValue === null || settingValue === undefined || settingValue === '') {
            return;
          }

          php += `                '${this.escapePhpString(settingKey)}' => ${this.formatPhpValue(settingValue, '                ')},\n`;
          addedProperties.add(settingKey);
        });

        php += "            ],\n";
      });
    }

    php += "        ],\n";
    php += "    ];\n\n";
    php += "    return $groups;\n";
    php += "});";

    return php;
  }

  /**
   * Format value for PHP output
   * @param {*} value - Value to format
   * @param {string} indent - Indentation
   * @returns {string}
   */
  formatPhpValue(value, indent = '') {
    if (value === null || value === undefined) {
      return "''";
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
      return value;
    }

    if (Array.isArray(value)) {
      return this.formatPhpArray(value, indent);
    }

    if (typeof value === 'object') {
      return this.formatPhpObject(value, indent);
    }

    // String
    return `'${this.escapePhpString(value)}'`;
  }

  /**
   * Format PHP array
   * @param {Array} arr - Array to format
   * @param {string} indent - Indentation
   * @returns {string}
   */
  formatPhpArray(arr, indent = '') {
    if (arr.length === 0) {
      return '[]';
    }

    // Check if array contains objects
    const hasObjects = arr.some(item =>
      typeof item === 'object' && item !== null && !Array.isArray(item)
    );

    if (hasObjects) {
      // Multi-line format for object arrays
      const lines = arr.map(item => {
        if (typeof item === 'object' && item !== null) {
          return indent + '    ' + this.formatPhpObject(item, indent + '    ').trim();
        }
        return indent + '    ' + this.formatPhpValue(item, indent + '    ');
      });
      return '[\n' + lines.join(',\n') + ',\n' + indent + ']';
    } else {
      // Single-line format for simple arrays
      const items = arr.map(item => this.formatPhpValue(item, indent));
      return '[' + items.join(', ') + ']';
    }
  }

  /**
   * Format PHP object (associative array)
   * @param {Object} obj - Object to format
   * @param {string} indent - Indentation
   * @returns {string}
   */
  formatPhpObject(obj, indent = '') {
    const lines = [];

    Object.keys(obj).forEach(key => {
      const value = obj[key];

      // Don't skip empty strings for 'value' key (conditional logic)
      if (key === 'value' && typeof value === 'string' && value === '') {
        // Empty string in conditional - output as PHP empty string ''
        lines.push(indent + '    ' + `'${this.escapePhpString(key)}' => ''`);
        return;
      }

      // Skip null, undefined, or empty string for all other keys
      if (value === null || value === undefined || value === '') {
        return;
      }

      lines.push(indent + '    ' + `'${this.escapePhpString(key)}' => ${this.formatPhpValue(value, indent + '    ')}`);
    });

    if (lines.length === 0) {
      return '[]';
    }

    return '[\n' + lines.join(',\n') + ',\n' + indent + ']';
  }

  /**
   * Escape string for PHP
   * @param {string} str - String to escape
   * @returns {string}
   */
  escapePhpString(str) {
    if (!str) return '';
    str = String(str);
    str = str.replace(/\\/g, '\\\\');
    str = str.replace(/'/g, "\\'");
    return str;
  }

  /**
   * Bind copy code button
   */
  bindCopyButton() {
    const copyBtn = DOM.find('#copy-code-btn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
      const codeElement = DOM.find('#php-preview code');
      if (!codeElement) return;

      const code = codeElement.textContent;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
          .then(() => success('Code copied to clipboard!'))
          .catch(() => this.copyFallback(code));
      } else {
        this.copyFallback(code);
      }
    });
  }

  /**
   * Fallback copy method
   * @param {string} text - Text to copy
   */
  copyFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      success('Code copied to clipboard!');
    } catch (err) {
      error('Failed to copy. Please copy manually from the preview. ' + err.message);
    }

    document.body.removeChild(textarea);
  }

  /**
   * Bind export PHP button
   */
  bindExportButton() {
    const exportBtn = DOM.find('#export-php-btn');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
      const codeElement = DOM.find('#php-preview code');
      if (!codeElement) return;

      const code = codeElement.textContent;
      const groupKey = DOM.find('#group_key')?.value || 'field-group';
      const filename = `${groupKey}.php`;

      const blob = new Blob([code], {type: 'text/plain;charset=utf-8'});

      if (window.navigator.msSaveBlob) {
        // IE 10+
        window.navigator.msSaveBlob(blob, filename);
      } else {
        // Modern browsers
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  }
}

export default PreviewHandler;