/**
 * Field List - Field Management
 * Handles field removal, type changes, and existing field initialization
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';
import {delegate} from '@/js/shared/utils/events';
import {confirmDelete} from '@/js/shared/components/confirm';

export class FieldList {
  constructor(builderCore) {
    this.builder = builderCore;
    this.init();
  }

  /**
   * Initialize field list
   */
  init() {
    this.bindRemoveButton();
    this.bindTypeChange();
    this.initializeExistingFields();
    this.animateEmptyAddIcon();
  }

  /**
   * Animate empty field add icon
   */
  animateEmptyAddIcon() {
    const icon = document.querySelector('.onemeta-fields-empty-state__icon');

    if (!icon) return;

    let animationId;
    let rotation = 0;
    let bounceProgress = 0;
    let isHovering = false;
    let lastTimestamp = 0;

    function animate(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (isHovering) {
        // Continue animations
        rotation = (rotation + deltaTime * 0.1) % 360;
        bounceProgress = (bounceProgress + deltaTime * 0.001) % 1;
      } else {
        // Slow down and stop animations
        rotation *= 0.95;
        bounceProgress *= 0.95;

        if (Math.abs(rotation) < 0.1 && Math.abs(bounceProgress) < 0.01) {
          rotation = 0;
          bounceProgress = 0;
          cancelAnimationFrame(animationId);
          animationId = null;
          return;
        }
      }

      const beforeElement = icon.querySelector('.pseudo-before') || icon;
      const iconElement = icon.querySelector('i');

      // Apply rotation to ::before pseudo-element
      // For pseudo-elements, need to use CSS custom properties
      icon.style.setProperty('--rotation', `${rotation}deg`);

      if (iconElement) {
        const bounceY = isHovering ? Math.sin(bounceProgress * Math.PI * 2) * -5 : 0;
        const bounceScale = isHovering ? 1 + Math.sin(bounceProgress * Math.PI * 2) * 0.1 : 1;
        iconElement.style.transform = `translateY(${bounceY}px) scale(${bounceScale})`;
      }

      animationId = requestAnimationFrame(animate);
    }

    icon.addEventListener('mouseenter', () => {
      isHovering = true;
      if (!animationId) {
        lastTimestamp = 0;
        animationId = requestAnimationFrame(animate);
      }
    });

    icon.addEventListener('mouseleave', () => {
      isHovering = false;
    });

    // Add CSS for the custom property
    const style = document.createElement('style');
    style.textContent = `
    .onemeta-fields-empty-state__icon::before {
      transform: translate(-50%, -50%) rotate(var(--rotation, 0deg));
    }
  `;
    document.head.appendChild(style);
  }

  /**
   * Bind remove field button
   */
  bindRemoveButton() {
    delegate('.onemeta-field-remove', 'click', async (e) => {
      e.preventDefault();

      const fieldItem = DOM.closest(e.target, '.onemeta-field__item');
      const fieldLabel = DOM.find('.onemeta-field-label', fieldItem)?.value || 'this field';

      // Show field name in confirmation
      if (!await confirmDelete(`the field "${fieldLabel}"`)) {
        return;
      }

      const fieldKey = DOM.find('.onemeta-field-key', fieldItem)?.value;

      // Remove from DOM
      DOM.remove(fieldItem);

      // Check and update empty state
      const fieldPalette = this.builder.getModule('fieldPalette');
      if (fieldPalette) {
        fieldPalette.checkEmptyState();
      }

      // Emit event
      this.builder.emit('field-removed', {fieldKey});
    });
  }

  /**
   * Bind field type change
   */
  bindTypeChange() {
    delegate('.onemeta-field-type', 'change', function () {
      const fieldType = this.value;
      const fieldItem = DOM.closest(this, '.onemeta-field__item');

      // 1. Update Header UI (Visual type indicator)
      const typeDisplay = DOM.find('.onemeta-field-header .onemeta-field-type', fieldItem);
      if (typeDisplay) typeDisplay.textContent = fieldType;

      // 2. Toggle Placeholder Visibility
      const placeholderSetting = DOM.find('.onemeta-placeholder-setting', fieldItem);
      const placeholderInput = DOM.find('.onemeta-field-placeholder', fieldItem);
      const textBasedTypes = ['text', 'textarea', 'url', 'email'];

      if (placeholderSetting) {
        if (textBasedTypes.includes(fieldType)) {
          placeholderSetting.style.display = 'block';
        } else {
          placeholderSetting.style.display = 'none';
          if (placeholderInput) placeholderInput.value = ''; // Reset value
        }
      }

      // 3. Re-render Advanced Settings
      const settingsContainer = DOM.find('.onemeta-field-advanced-settings', fieldItem);
      if (settingsContainer && window.OnemetaFieldSettings) {
        const $container = jQuery(settingsContainer);
        window.OnemetaFieldSettings.render(fieldType, $container, {});
      }
    });
  }

  /**
   * Initialize existing fields on page load
   */
  initializeExistingFields() {
    const fieldItems = DOM.findAll('.onemeta-field__item');
    const builderData = this.builder.getBuilderData();

    fieldItems.forEach(fieldItem => {
      const fieldType = DOM.find('.onemeta-field-type', fieldItem)?.value;
      const fieldKey = DOM.find('.onemeta-field-key', fieldItem)?.value;
      const settingsContainer = DOM.find('.onemeta-field-advanced-settings', fieldItem);

      if (!fieldType || !settingsContainer) return;

      let existingValues = {};

      // If editing, get saved values from window data
      if (builderData.fieldsByKey && builderData.fieldsByKey[fieldKey]) {
        existingValues = builderData.fieldsByKey[fieldKey];
      }

      // Render settings with existing values or defaults
      if (window.OnemetaFieldSettings) {
        const $container = jQuery(settingsContainer);
        window.OnemetaFieldSettings.render(fieldType, $container, existingValues);
      }
    });
  }
}

export default FieldList;