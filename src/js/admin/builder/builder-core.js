/**
 * Builder Core - State Management & Event Bus
 * Central orchestrator for the field builder
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';

export class BuilderCore {
  constructor() {
    this.state = {
      fieldCounter: 0,
      fields: [],
      selectedField: null,
      isDirty: false,
      isInitialLoad: true
    };

    this.listeners = {};
    this.modules = {}; // store module references
    this.init();
  }

  /**
   * Register a module
   * @param {string} name - Module name
   * @param {*} module - Module instance
   */
  registerModule(name, module) {
    this.modules[name] = module;
  }

  /**
   * Get a module by name
   * @param {string} name - Module name
   * @returns {*}
   */
  getModule(name) {
    return this.modules[name];
  }

  /**
   * Initialize core
   */
  init() {
    // Get field counter from existing fields
    const existingFields = DOM.findAll('#onemeta-fields-container .onemeta-field__item');
    this.state.fieldCounter = existingFields.length || 0;

    // Allow preview updates after initial load
    setTimeout(() => {
      this.state.isInitialLoad = false;
    }, 500);
  }

  /**
   * Get current state
   * @returns {Object}
   */
  getState() {
    return {...this.state};
  }

  /**
   * Update state
   * @param {Object} updates - State updates
   */
  setState(updates) {
    const oldState = {...this.state};
    this.state = {...this.state, ...updates};

    // Mark as dirty if content changed
    if (updates.fields || updates.fieldCounter) {
      this.state.isDirty = true;
    }

    this.emit('state-changed', {oldState, newState: this.state});
  }

  /**
   * Increment field counter and return new value
   * @returns {number}
   */
  incrementFieldCounter() {
    this.state.fieldCounter++;
    return this.state.fieldCounter;
  }

  /**
   * Get field counter
   * @returns {number}
   */
  getFieldCounter() {
    return this.state.fieldCounter;
  }

  /**
   * Check if initial load
   * @returns {boolean}
   */
  isInitialLoad() {
    return this.state.isInitialLoad;
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Unregister event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  /**
   * Build configuration from form
   * @returns {{group_key, group_title, group_type, post_type, position, fields: {}}}
   */
  buildConfig() {
    const config = {
      group_key: DOM.find('#group_key')?.value || 'field_group',
      group_title: DOM.find('#group_title')?.value || 'Field Group',
      group_type: DOM.find('#group_type')?.value || 'post',
      post_type: DOM.find('#post_type')?.value || 'post',
      position: DOM.find('#position')?.value || 'normal',
      fields: {}
    };

    DOM.findAll('#onemeta-fields-container .onemeta-field__item').forEach(item => {
      const data = this.extractFieldData(item);
      if (data.key) {
        config.fields[data.key] = data;
      }
    });

    return config;
  }

  /**
   * Get field data for saving
   * @returns {{key: *, type: *, label, description}[]}
   */
  getFieldsForSave() {
    return DOM.findAll('#onemeta-fields-container .onemeta-field__item')
      .map(item => this.extractFieldData(item))
      .filter(data => data.key && data.label); // Ensure required fields exist
  }

  /**
   * Helper to extract data from a single field DOM element
   */
  extractFieldData(fieldItem) {
    const type = DOM.find('.onemeta-field-type', fieldItem)?.value || 'text';
    const supportsPlaceholder = ['text', 'textarea', 'url', 'email'].includes(type);

    // 1. Core Data
    const fieldData = {
      key: DOM.find('.onemeta-field-key', fieldItem)?.value,
      type: type,
      label: DOM.find('.onemeta-field-label', fieldItem)?.value || 'Field',
      description: DOM.find('.onemeta-field-description', fieldItem)?.value || '',
      ...(supportsPlaceholder && {
        placeholder: DOM.find('.onemeta-field-placeholder', fieldItem)?.value || ''
      })
    };

    // 2. Advanced Settings Merge
    const advContainer = DOM.find('.onemeta-field-advanced-settings', fieldItem);
    if (advContainer && window.OnemetaFieldSettings) {
      const advanced = window.OnemetaFieldSettings.getValues(jQuery(advContainer));
      Object.assign(fieldData, advanced);
    }

    // 3. Specialized Transformations (Checkboxes, etc.)
    if (fieldData.type === 'checkbox' && typeof fieldData.default === 'string') {
      fieldData.default = fieldData.default.split(',').map(v => v.trim()).filter(Boolean);
    }

    return fieldData;
  }

  /**
   * Get builder data from window
   * @returns {Object}
   */
  getBuilderData() {
    return window.onemetaBuilder || {};
  }

  /**
   * Get i18n string
   * @param {string} key - Translation key
   * @returns {string}
   */
  i18n(key) {
    const builderData = this.getBuilderData();
    return builderData.i18n?.[key] || key;
  }
}

export default BuilderCore;