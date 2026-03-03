/**
 * OneMeta Builder Entry Point
 * Initializes all builder modules
 *
 * @package OneMeta
 */

// Import styles (Vite will process these)
import '@/scss/admin/admin.scss';

// Import builder modules
import BuilderCore from './builder/builder-core';
import FieldPalette from './builder/field-palette';
import FieldList from './builder/field-list';
import PreviewHandler from './builder/preview-handler';
import SaveHandler from './builder/save-handler';
import GroupSettings from './builder/group-settings';

// Drag & Drop
import {FieldPaletteSidebar} from './builder/field-palette-sidebar';
import {FieldDragDrop} from './builder/field-drag-drop';
import {FieldInsertion} from './builder/field-insertion';

// Import settings renderer (sets up window.OnemetaFieldSettings)
import './settings/settings-renderer';

import './pages/dashboard';
import './pages/docs';

// Import tooltips
import {initTooltips} from '@/js/shared/components/tooltip';

// Initialize tooltips once
initTooltips();

/**
 * Builder Application Class
 * Orchestrates all builder modules
 */
class BuilderApp {
  constructor() {
    this.modules = {};
    this.core = null;
    this.init();
  }

  /**
   * Initialize builder application
   */
  init() {
    // Check if we're on builder page
    const builderForm = document.querySelector('#onemeta-builder-form');
    if (!builderForm) {
      return; // Not on builder page
    }

    try {
      // Initialize core (state management & event bus)
      this.core = new BuilderCore();

      // Initialize all modules
      this.modules.groupSettings = new GroupSettings(this.core);
      this.modules.fieldPalette = new FieldPalette(this.core);
      this.modules.fieldList = new FieldList(this.core);
      this.modules.previewHandler = new PreviewHandler(this.core);
      this.modules.saveHandler = new SaveHandler(this.core);

      // Register modules with core so they can access each other
      this.core.registerModule('groupSettings', this.modules.groupSettings);
      this.core.registerModule('fieldPalette', this.modules.fieldPalette);
      this.core.registerModule('fieldList', this.modules.fieldList);
      this.core.registerModule('previewHandler', this.modules.previewHandler);
      this.core.registerModule('saveHandler', this.modules.saveHandler);

      // Initialize Field Palette Sidebar
      const paletteSidebar = new FieldPaletteSidebar(this.core);
      this.core.registerModule('paletteSidebar', paletteSidebar);

      // Initialize Drag & Drop Handler
      const dragDrop = new FieldDragDrop(this.core);
      this.core.registerModule('dragDrop', dragDrop);

      // Initialize Field Insertion System
      const fieldInsertion = new FieldInsertion(this.core, dragDrop);
      this.core.registerModule('fieldInsertion', fieldInsertion);

      // Initialize visual displays for existing fields
      dragDrop.initExistingFields();

      // Add dragging class to body when drag starts
      document.addEventListener('dragstart', (e) => {
        if (e.target.closest('.onemeta-palette-item')) {
          document.body.classList.add('onemeta-dragging');
        }
      });

      document.addEventListener('dragend', () => {
        document.body.classList.remove('onemeta-dragging');
      });

      // Expose core for debugging
      if (window.onemetaBuilder) {
        window.onemetaBuilder.core = this.core;
      }

    } catch (error) {
      console.error('❌ OneMeta Builder Initialization Error:', error);
    }
  }

  /**
   * Get builder core
   * @returns {BuilderCore}
   */
  getCore() {
    return this.core;
  }

  /**
   * Get module by name
   * @param {string} name - Module name
   * @returns {*}
   */
  getModule(name) {
    return this.modules[name];
  }

  /**
   * Get all modules
   * @returns {Object}
   */
  getModules() {
    return this.modules;
  }
}

/**
 * Auto-initialize when DOM is ready
 */
const initApp = () => {
  window.OneMetaBuilder = new BuilderApp();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM already loaded
  initApp();
}

// Export for module usage
export default BuilderApp;