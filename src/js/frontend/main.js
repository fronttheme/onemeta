/**
 * OneMeta Frontend Entry Point
 * Initializes all field handlers and modules
 *
 * @package OneMeta
 */

// Import styles (Vite will process these)
import '@/scss/frontend/frontend.scss';

// Import field handlers
import DateField from './fields/date-field';
import ToggleField from './fields/toggle-field';
import ButtonGroup from './fields/button-group';

// Import media handlers
import ImageUpload from './media/image-upload';
import FileUpload from './media/file-upload';
import GalleryUpload from './media/gallery-upload';

// Import repeater handler
import RepeaterFields from './repeater/repeater-fields';

// Import conditional logic (shared module)
import ConditionalLogic from '@/js/shared/modules/conditional-logic';

/**
 * Frontend Application Class
 * Orchestrates all field modules
 */
class FrontendApp {
  constructor() {
    this.modules = [];
    this.init();
  }

  /**
   * Initialize all modules
   */
  init() {
    try {
      // Initialize field handlers
      this.modules.push(
        new DateField(),
        new ToggleField(),
        new ButtonGroup()
      );

      // Initialize media handlers
      this.modules.push(
        new ImageUpload(),
        new FileUpload(),
        new GalleryUpload()
      );

      // Initialize repeater handler
      this.modules.push(
        new RepeaterFields()
      );

      // Initialize conditional logic
      this.modules.push(
        new ConditionalLogic()
      );

    } catch (error) {
      console.error('❌ OneMeta Frontend Initialization Error:', error);
    }
  }

  /**
   * Get all initialized modules
   * @returns {Array}
   */
  getModules() {
    return this.modules;
  }

  /**
   * Reinitialize all modules (for dynamic content)
   */
  reinit() {
    this.modules = [];
    this.init();
  }
}

/**
 * Auto-initialize when DOM is ready
 */
const initApp = () => {
  window.OneMetaFields = new FrontendApp();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM already loaded
  initApp();
}

// Export for module usage
export default FrontendApp;