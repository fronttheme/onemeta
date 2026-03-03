/**
 * Field Insertion
 * Handles inserting new fields between existing fields
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';

export class FieldInsertion {
  constructor(core, dragDrop) {
    this.core = core;
    this.dragDrop = dragDrop;
    this.activeZone = null;
    this.dragGhost = null;
    this.init();
  }

  init() {
    console.log('🔧 Field Insertion System initializing...');
    console.log('Core modules:', this.core.modules);

    const fieldList = this.core.getModule('fieldList');
    console.log('FieldList found:', !!fieldList);
    if (fieldList) {
      console.log('FieldList methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(fieldList)));
    }

    this.setupInsertionZones();
    this.setupDragGhost();
    this.watchForFieldChanges();
  }

  /**
   * Create insertion zones between fields
   */
  setupInsertionZones() {
    // Create zones for main fields
    this.createMainFieldZones();

    // Create zones for repeater sub-fields
    this.createSubFieldZones();
  }

  /**
   * Create insertion zones for main fields
   */
  createMainFieldZones() {
    const container = DOM.find('#onemeta-fields-container');
    if (!container) return;

    // Remove old zones
    container.querySelectorAll('.onemeta-insertion-zone').forEach(zone => zone.remove());

    const fields = container.querySelectorAll('.onemeta-field__item');

    if (fields.length === 0) return;

    // Create zone before each field
    fields.forEach((field, index) => {
      const zone = this.createInsertionZone('main', index, false);
      field.parentNode.insertBefore(zone, field);
    });

    // Create zone after last field
    const lastZone = this.createInsertionZone('main', fields.length, true);
    container.appendChild(lastZone);
  }

  /**
   * Create insertion zones for repeater sub-fields
   *
   * Creates zones even when list is empty (no rows)
   */
  createSubFieldZones() {
    const repeaterBuilders = document.querySelectorAll('.repeater-sub-fields-builder');

    repeaterBuilders.forEach(builder => {
      const list = builder.querySelector('.sub-fields-list');
      if (!list) return;

      // Remove old zones
      list.querySelectorAll('.onemeta-insertion-zone').forEach(zone => zone.remove());

      const subFields = list.querySelectorAll('.sub-field-row');

      // Check if there's an empty state element
      const emptyState = list.querySelector('.no-sub-fields, .onemeta-sub-fields-empty-state');

      // Only skip if empty state element exists
      // If no empty state but also no rows, still create zones for drag insertion
      if (subFields.length === 0 && emptyState) {
        return;
      }

      if (subFields.length === 0 && !emptyState) {
        // Empty list without empty state - create a single zone
        const initialZone = this.createInsertionZone('sub', 0, true);
        list.appendChild(initialZone);
        return;
      }

      // Create zone before each sub-field
      subFields.forEach((field, index) => {
        const zone = this.createInsertionZone('sub', index, false);
        field.parentNode.insertBefore(zone, field);
      });

      // Create zone after last sub-field
      const lastZone = this.createInsertionZone('sub', subFields.length, true);
      list.appendChild(lastZone);
    });
  }

  /**
   * Create a single insertion zone element
   */
  createInsertionZone(type, position, isLast) {
    const zone = document.createElement('div');
    zone.className = 'onemeta-insertion-zone';
    zone.dataset.type = type; // 'main' or 'sub'
    zone.dataset.position = position;
    zone.dataset.isLast = isLast;

    zone.innerHTML = `
      <div class="onemeta-insertion-line"></div>
      <div class="onemeta-insertion-label">
        <i class="fa-solid fa-plus"></i>
        <span class="onemeta-insertion-text">Drop to insert</span>
      </div>
    `;

    // Setup drag handlers
    this.setupZoneHandlers(zone);

    return zone;
  }

  /**
   * Setup drag handlers for insertion zone
   */
  setupZoneHandlers(zone) {
    zone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.activateZone(zone);
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
    });

    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (!zone.contains(e.relatedTarget)) {
        this.deactivateZone(zone);
      }
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleZoneDrop(zone);
    });
  }

  /**
   * Activate insertion zone
   */
  activateZone(zone) {
    // Check if field type is allowed in this context
    const type = zone.dataset.type;
    const draggedType = this.dragDrop.draggedType;

    if (!draggedType) return;

    // Check repeater restrictions for sub-fields
    if (type === 'sub' && !draggedType.repeaterAllowed) {
      zone.classList.add('invalid');
      return;
    }

    // Deactivate previous zone
    if (this.activeZone && this.activeZone !== zone) {
      this.deactivateZone(this.activeZone);
    }

    zone.classList.add('active');
    this.activeZone = zone;

    // Update ghost position
    this.updateGhostPosition(zone);
  }

  /**
   * Deactivate insertion zone
   */
  deactivateZone(zone) {
    zone.classList.remove('active', 'invalid');
    if (this.activeZone === zone) {
      this.activeZone = null;
    }
  }

  /**
   * Handle drop on insertion zone
   */
  handleZoneDrop(zone) {
    const draggedType = this.dragDrop.draggedType;
    if (!draggedType) return;

    const type = zone.dataset.type;
    const position = parseInt(zone.dataset.position);

    // Check restrictions
    if (type === 'sub' && !draggedType.repeaterAllowed) {
      this.dragDrop.showErrorToast('This field type cannot be used in repeater sub-fields');
      this.deactivateZone(zone);
      return;
    }

    // Insert field
    if (type === 'main') {
      this.insertMainField(draggedType, position);
    } else {
      this.insertSubField(draggedType, position, zone);
    }

    this.deactivateZone(zone);
  }

  /**
   * Insert main field at position
   */
  insertMainField(data, position) {
    const fieldPalette = this.core.getModule('fieldPalette');

    if (!fieldPalette || typeof fieldPalette.addField !== 'function') {
      console.error('FieldPalette module not available');
      return;
    }

    // Add field with specified type
    const newField = fieldPalette.addField(data.type);

    if (!newField) {
      console.error('Failed to create field');
      return;
    }

    // Wait a tick for DOM to update
    setTimeout(() => {
      const container = DOM.find('#onemeta-fields-container');
      const fields = Array.from(container.querySelectorAll('.onemeta-field__item'));

      // Move to correct position if not already at the end
      if (position < fields.length - 1) {
        const targetField = fields[position];
        if (targetField) {
          container.insertBefore(newField, targetField);
        }
      }

      // Set field type visually
      const select = newField.querySelector('.field-type-select, .onemeta-field-type');
      if (select && select.value !== data.type) {
        select.value = data.type;
        // Trigger change event
        select.dispatchEvent(new Event('change', {bubbles: true}));
      }

      // Update visual display if using drag & drop visual
      if (this.dragDrop && this.dragDrop.updateFieldType) {
        this.dragDrop.updateFieldType(newField, data);
      }

      // Animate insertion
      newField.classList.add('field-inserted');
      setTimeout(() => newField.classList.remove('field-inserted'), 600);

      // Recreate zones
      this.createMainFieldZones();

      // Update preview
      const previewHandler = this.core.getModule('previewHandler');
      if (previewHandler && !this.core.isInitialLoad()) {
        previewHandler.updatePreview();
      }

      this.dragDrop.showSuccessFeedback(`${data.label} field inserted`);
    }, 50);
  }

  /**
   * Insert sub-field at position
   */
  insertSubField(data, position, zone) {
    // Find the repeater builder
    const builder = zone.closest('.repeater-sub-fields-builder');
    if (!builder) return;

    const addButton = builder.querySelector('.add-sub-field');
    if (!addButton) return;

    // Mark as drag & drop trigger
    jQuery(addButton).data('drag-drop-trigger', true);

    // Add sub-field
    addButton.click();

    // Wait for DOM update
    setTimeout(() => {
      const list = builder.querySelector('.sub-fields-list');
      const subFields = Array.from(list.querySelectorAll('.sub-field-row'));
      const newSubField = subFields[subFields.length - 1];

      if (!newSubField) return;

      // Move to correct position
      if (position < subFields.length - 1) {
        const targetField = subFields[position];
        list.insertBefore(newSubField, targetField);
      }

      // Set sub-field type
      const select = newSubField.querySelector('.sub-field-type-select');
      if (select) {
        select.value = data.type;

        // Update type display
        const typeDisplay = newSubField.querySelector('.sub-field-type');
        if (typeDisplay) {
          typeDisplay.textContent = data.type;
        }

        // Trigger change
        select.dispatchEvent(new Event('change', {bubbles: true}));
      }

      // Animate insertion
      newSubField.classList.add('field-inserted');
      setTimeout(() => newSubField.classList.remove('field-inserted'), 600);

      // Recreate zones
      this.createSubFieldZones();

      this.dragDrop.showSuccessFeedback(`${data.label} sub-field inserted`);
    }, 150);
  }

  /**
   * Setup drag ghost (cursor follower)
   */
  setupDragGhost() {
    document.addEventListener('dragstart', (e) => {
      const paletteItem = e.target.closest('.onemeta-palette-item');
      if (!paletteItem) return;

      // Create ghost
      this.dragGhost = document.createElement('div');
      this.dragGhost.className = 'onemeta-drag-ghost';
      this.dragGhost.innerHTML = `
        <i class="fa-solid ${paletteItem.dataset.icon}"></i>
        <span class="onemeta-drag-ghost-label">${paletteItem.dataset.label}</span>
      `;
      document.body.appendChild(this.dragGhost);

      // Update position on drag
      const updateGhostPosition = (e) => {
        if (this.dragGhost) {
          this.dragGhost.style.left = (e.pageX + 15) + 'px';
          this.dragGhost.style.top = (e.pageY + 15) + 'px';
        }
      };

      document.addEventListener('dragover', updateGhostPosition);

      // Cleanup on drag end
      document.addEventListener('dragend', () => {
        if (this.dragGhost) {
          this.dragGhost.remove();
          this.dragGhost = null;
        }
        document.removeEventListener('dragover', updateGhostPosition);
      }, {once: true});
    });
  }

  /**
   * Update ghost position near active zone
   */
  updateGhostPosition(zone) {
    if (!this.dragGhost) return;

    const rect = zone.getBoundingClientRect();
    this.dragGhost.style.transition = 'all 0.2s ease';
    this.dragGhost.style.left = (rect.left + 20) + 'px';
    this.dragGhost.style.top = (rect.top - 10) + 'px';
  }

  /**
   * Watch for field changes and recreate zones
   *
   * Also watches for sub-field changes
   */
  watchForFieldChanges() {
    const container = DOM.find('#onemeta-fields-container');
    if (!container) return;

    let isUpdating = false;

    const observer = new MutationObserver((mutations) => {
      // Ignore if we're currently updating zones
      if (isUpdating) return;

      // Check for field additions/removals (main fields)
      const hasFieldChanges = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node =>
          node.classList && node.classList.contains('onemeta-field__item')
        ) || Array.from(mutation.removedNodes).some(node =>
          node.classList && node.classList.contains('onemeta-field__item')
        );
      });

      // Check for sub-field additions/removals
      const hasSubFieldChanges = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node =>
          node.classList && node.classList.contains('sub-field-row')
        ) || Array.from(mutation.removedNodes).some(node =>
          node.classList && node.classList.contains('sub-field-row')
        );
      });

      if (!hasFieldChanges && !hasSubFieldChanges) return;

      // Debounce recreation
      isUpdating = true;
      clearTimeout(this.recreateTimeout);
      this.recreateTimeout = setTimeout(() => {
        this.createMainFieldZones();
        this.createSubFieldZones();
        isUpdating = false;
      }, 300);
    });

    observer.observe(container, {
      childList: true,
      subtree: true // Watch deep changes for sub-fields
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    DOM.findAll('.onemeta-insertion-zone').forEach(zone => zone.remove());
    if (this.dragGhost) {
      this.dragGhost.remove();
    }
  }
}

export default FieldInsertion;