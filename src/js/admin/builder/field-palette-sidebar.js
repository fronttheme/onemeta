/**
 * Field Palette Sidebar
 * Collapsible sidebar with icon-only collapsed state
 *
 * @package OneMeta
 */

import {DOM} from '@/js/shared/utils/dom';

export class FieldPaletteSidebar {
  constructor(core) {
    this.core = core;
    this.isCollapsed = true;
    this.position = this.getSavedPosition();
    this.init();
  }

  init() {
    this.createSidebar();
    this.setupEventListeners();
    this.applyPosition();
    this.applyCollapsedState();
  }

  /**
   * Apply collapsed state
   */
  applyCollapsedState() {
    if (this.isCollapsed && this.sidebar) {
      this.sidebar.classList.add('collapsed');

      // Update icons
      const expandedIcon = this.sidebar.querySelector('.onemeta-palette-icon-expanded');
      const collapsedIcon = this.sidebar.querySelector('.onemeta-palette-icon-collapsed');
      if (expandedIcon) expandedIcon.style.display = 'none';
      if (collapsedIcon) collapsedIcon.style.display = 'block';
    }
  }

  /**
   * Create sidebar HTML
   */
  createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'onemeta-field-palette-sidebar';
    sidebar.innerHTML = this.getSidebarHTML();

    document.body.appendChild(sidebar);
    this.sidebar = sidebar;
  }

  /**
   * Get sidebar HTML
   */
  getSidebarHTML() {
    return `
      <!-- Header (visible in both states) -->
      <div class="onemeta-palette-header">
        <button class="onemeta-palette-toggle-btn" 
                data-tooltip="Toggle Sidebar" 
                data-tooltip-position="right">
                <i class="fa-solid fa-arrow-right-arrow-left onemeta-palette-icon-expanded"></i>
                <i class="fa-solid fa-arrow-right-arrow-left onemeta-palette-icon-collapsed" style="display: none;"></i>
        </button>
        <div class="onemeta-palette-header-actions">
          <button class="onemeta-palette-position-btn" 
                  data-tooltip="Change Position" 
                  data-tooltip-position="bottom">
            <i class="fa-solid fa-ellipsis"></i>
          </button>
        </div>
      </div>

      <!-- Search (only in expanded) -->
      <div class="onemeta-palette-search">
        <input type="text" 
               class="onemeta-palette-search-input" 
               placeholder="Search field types..."
               autocomplete="off">
        <i class="fa-solid fa-magnifying-glass onemeta-palette-search-icon"></i>
      </div>

      <!-- Field Types -->
      <div class="onemeta-palette-body">
        ${this.getFieldTypesHTML()}
      </div>

      <!-- Footer (only in expanded) -->
      <div class="onemeta-palette-footer">
        <p class="onemeta-palette-hint">
          <i class="fa-solid fa-circle-info"></i>
          <span>Drag to form or click form <strong>'Add Field'</strong> button to add field.</span>
        </p>
      </div>

      <!-- Position Selector Popup -->
      <div class="onemeta-position-selector" style="display: none;">
        <div class="onemeta-position-grid">
          <button data-position="left" data-tooltip="Left" class="active">
            <i class="fa-solid fa-arrow-left-long"></i>
          </button>
          <button data-position="right" data-tooltip="Right">
            <i class="fa-solid fa-arrow-right-long"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Get field types HTML
   */
  getFieldTypesHTML() {
    const fieldTypes = {
      basic: {
        label: 'Basic',
        types: [
          {type: 'text', icon: 'fa-heading', label: 'Text', repeater: true},
          {type: 'textarea', icon: 'fa-paragraph', label: 'Textarea', repeater: true},
          {type: 'url', icon: 'fa-link', label: 'URL', repeater: true},
          {type: 'email', icon: 'fa-at', label: 'Email', repeater: true},
          {type: 'date', icon: 'fa-calendar-days', label: 'Date', repeater: false}
        ]
      },
      choice: {
        label: 'Choice',
        types: [
          {type: 'toggle', icon: 'fa-toggle-on', label: 'Toggle', repeater: true},
          {type: 'select', icon: 'fa-circle-chevron-down', label: 'Select', repeater: true},
          {type: 'checkbox', icon: 'fa-square-check', label: 'Checkbox', repeater: true},
          {type: 'radio', icon: 'fa-circle-dot', label: 'Radio', repeater: true},
          {type: 'button_group', icon: 'fa-mattress-pillow', label: 'Button Group', repeater: true}
        ]
      },
      media: {
        label: 'Media',
        types: [
          {type: 'image', icon: 'fa-image', label: 'Image', repeater: true},
          {type: 'file', icon: 'fa-file-image', label: 'File', repeater: true},
          {type: 'gallery', icon: 'fa-images', label: 'Gallery', repeater: false}
        ]
      },
      advanced: {
        label: 'Advanced',
        types: [
          {type: 'repeater', icon: 'fa-cubes', label: 'Repeater', repeater: false}
        ]
      }
    };

    let html = '';

    Object.keys(fieldTypes).forEach(categoryKey => {
      const category = fieldTypes[categoryKey];

      html += `<div class="onemeta-palette-category" data-category="${categoryKey}">${category.label}</div>`;
      html += '<div class="onemeta-palette-items">';

      category.types.forEach(field => {
        const badge = !field.repeater ? '<span class="onemeta-palette-badge">Main</span>' : '';

        html += `
          <div class="onemeta-palette-item" 
               draggable="true"
               data-type="${field.type}"
               data-icon="${field.icon}"
               data-label="${field.label}"
               data-repeater-allowed="${field.repeater}"
               data-tooltip="${field.label}"
               data-tooltip-position="right">
            <i class="fa-solid ${field.icon}"></i>
            <span class="onemeta-palette-item-label">${field.label}</span>
            ${badge}
          </div>
        `;
      });

      html += '</div>';
    });

    return html;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle button
    const toggleBtn = this.sidebar.querySelector('.onemeta-palette-toggle-btn');
    toggleBtn?.addEventListener('click', () => this.toggle());

    // Position selector
    const positionBtn = this.sidebar.querySelector('.onemeta-palette-position-btn');
    const positionSelector = this.sidebar.querySelector('.onemeta-position-selector');

    positionBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = positionSelector.style.display === 'block';
      positionSelector.style.display = isVisible ? 'none' : 'block';
    });

    // Position buttons
    const positionBtns = this.sidebar.querySelectorAll('.onemeta-position-grid button');
    positionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const position = btn.dataset.position;
        this.setPosition(position);
        positionSelector.style.display = 'none';

        // Update active state
        positionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Search
    const searchInput = this.sidebar.querySelector('.onemeta-palette-search-input');
    searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));

    // Draggable items
    this.setupDraggableItems();

    // Click to add
    this.setupClickToAdd();

    // Close position selector when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.onemeta-palette-position-btn') &&
        !e.target.closest('.onemeta-position-selector')) {
        positionSelector.style.display = 'none';
      }
    });
  }

  /**
   * Setup draggable items
   */
  setupDraggableItems() {
    const items = this.sidebar.querySelectorAll('.onemeta-palette-item');

    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const data = {
          type: item.dataset.type,
          icon: item.dataset.icon,
          label: item.dataset.label,
          repeaterAllowed: item.dataset.repeaterAllowed === 'true'
        };

        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(data));
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });
  }

  /**
   * Setup click to add - only works when fields container is empty
   */
  setupClickToAdd() {
    const items = this.sidebar.querySelectorAll('.onemeta-palette-item');

    items.forEach(item => {
      item.addEventListener('click', () => {
        // Check if fields container is empty
        const fieldsContainer = DOM.find('#onemeta-fields-container');
        const hasFields = fieldsContainer && fieldsContainer.querySelectorAll('.onemeta-field__item').length > 0;

        if (hasFields) {
          // Fields exist - show hint to drag instead
          this.showInfoToast('Drag field types to your form');
          return;
        }

        // EMPTY STATE - clicking adds field!
        const type = item.dataset.type;
        const label = item.dataset.label;

        const fieldList = this.core.getModule('fieldList');
        if (fieldList && typeof fieldList.addField === 'function') {
          fieldList.addField(type);
          this.showSuccessFeedback(`${label} field added`);
        }
      });
    });
  }

  /**
   * Show info toast
   */
  showInfoToast(message) {
    if (window.OnemetaToast && window.OnemetaToast.info) {
      window.OnemetaToast.info(message);
    }
  }

  /**
   * Handle search
   */
  handleSearch(query) {
    const items = this.sidebar.querySelectorAll('.onemeta-palette-item');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
      const label = item.dataset.label.toLowerCase();
      const type = item.dataset.type.toLowerCase();
      const matches = label.includes(lowerQuery) || type.includes(lowerQuery);

      item.style.display = matches ? '' : 'none';
    });

    // Hide empty categories
    const categories = this.sidebar.querySelectorAll('.onemeta-palette-category');
    categories.forEach(category => {
      const items = category.nextElementSibling;
      const visibleItems = items.querySelectorAll('.onemeta-palette-item:not([style*="display: none"])');

      category.style.display = visibleItems.length > 0 ? '' : 'none';
      items.style.display = visibleItems.length > 0 ? '' : 'none';
    });
  }

  /**
   * Toggle sidebar
   */
  toggle() {
    const expandedIcon = this.sidebar.querySelector('.onemeta-palette-icon-expanded');
    const collapsedIcon = this.sidebar.querySelector('.onemeta-palette-icon-collapsed');

    if (this.isCollapsed) {
      this.expand();
      if (expandedIcon) expandedIcon.style.display = 'block';
      if (collapsedIcon) collapsedIcon.style.display = 'none';
    } else {
      this.collapse();
      if (expandedIcon) expandedIcon.style.display = 'none';
      if (collapsedIcon) collapsedIcon.style.display = 'block';
    }
  }

  /**
   * Expand sidebar
   */
  expand() {
    this.isCollapsed = false;
    this.sidebar.classList.remove('collapsed');
    this.saveState();
  }

  /**
   * Collapse sidebar
   */
  collapse() {
    this.isCollapsed = true;
    this.sidebar.classList.add('collapsed');
    this.saveState();
  }

  /**
   * Set position
   */
  setPosition(position) {
    this.position = position;
    this.applyPosition();
    this.saveState();
  }

  /**
   * Apply position
   */
  applyPosition() {
    this.sidebar.classList.remove('position-left', 'position-right');
    this.sidebar.classList.add(`position-${this.position}`);
  }

  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem('onemeta_palette_state', JSON.stringify({
        isCollapsed: this.isCollapsed,
        position: this.position
      }));
    } catch (e) {
      console.error('Failed to save palette state:', e);
    }
  }

  /**
   * Get saved position
   */
  getSavedPosition() {
    try {
      const saved = localStorage.getItem('onemeta_palette_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.isCollapsed = state.isCollapsed || true;

        // Apply collapsed state after sidebar is created
        setTimeout(() => {
          if (this.isCollapsed && this.sidebar) {
            this.sidebar.classList.add('collapsed');
          }
        }, 100);

        return state.position || 'left';
      }
    } catch (e) {
      console.error('Failed to load palette state:', e);
    }
    return 'left';
  }

  /**
   * Show success feedback
   */
  showSuccessFeedback(message) {
    if (window.OnemetaToast) {
      window.OnemetaToast.success(message);
    } else {
      const toast = document.createElement('div');
      toast.className = 'onemeta-palette-toast';
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
  }

  /**
   * Destroy sidebar
   */
  destroy() {
    this.sidebar?.remove();
  }
}

export default FieldPaletteSidebar;