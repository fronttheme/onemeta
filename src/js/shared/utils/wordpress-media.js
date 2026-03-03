/**
 * WordPress Media API Helpers
 * Wrappers for WordPress wp.media (requires jQuery)
 *
 * @package OneMeta
 */

/**
 * Check if WordPress media library is available
 * @returns {boolean}
 */
export const isMediaAvailable = () => {
  return typeof wp !== 'undefined' && typeof wp.media !== 'undefined';
};

/**
 * Create WordPress media frame
 * @param {Object} options - Frame options
 * @returns {Object} Media frame instance
 *
 * @example
 * const frame = createMediaFrame({
 *   title: 'Select Image',
 *   button: { text: 'Use Image' },
 *   multiple: false,
 *   library: { type: 'image' }
 * });
 */
export const createMediaFrame = (options = {}) => {
  if (!isMediaAvailable()) {
    console.error('WordPress media library not available');
    return null;
  }

  const defaults = {
    title: 'Select Media',
    button: {text: 'Use This'},
    multiple: false
  };

  return wp.media({...defaults, ...options});
};

/**
 * Open image selector
 * @param {Function} onSelect - Callback when image is selected
 * @param {Object} options - Additional options
 * @returns {Object} Media frame
 *
 * @example
 * openImageSelector((attachment) => {
 *   console.log('Selected:', attachment);
 * });
 */
export const openImageSelector = (onSelect, options = {}) => {
  const frame = createMediaFrame({
    title: options.title || 'Select Image',
    button: {text: options.buttonText || 'Use Image'},
    multiple: options.multiple || false,
    library: {type: 'image'}
  });

  if (!frame) return null;

  frame.on('select', () => {
    const selection = frame.state().get('selection');

    if (options.multiple) {
      const attachments = selection.map(att => att.toJSON());
      onSelect(attachments);
    } else {
      const attachment = selection.first().toJSON();
      onSelect(attachment);
    }
  });

  frame.open();
  return frame;
};

/**
 * Open file selector
 * @param {Function} onSelect - Callback when file is selected
 * @param {Object} options - Additional options
 * @returns {Object} Media frame
 *
 * @example
 * openFileSelector((attachment) => {
 *   console.log('Selected:', attachment);
 * }, {
 *   mimeTypes: ['application/pdf', 'application/zip']
 * });
 */
export const openFileSelector = (onSelect, options = {}) => {
  const frameOptions = {
    title: options.title || 'Select File',
    button: {text: options.buttonText || 'Use File'},
    multiple: options.multiple || false
  };

  // Add MIME type restrictions if specified
  if (options.mimeTypes && options.mimeTypes.length > 0) {
    frameOptions.library = {type: options.mimeTypes};
  }

  const frame = createMediaFrame(frameOptions);
  if (!frame) return null;

  frame.on('select', () => {
    const selection = frame.state().get('selection');

    if (options.multiple) {
      const attachments = selection.map(att => att.toJSON());
      onSelect(attachments);
    } else {
      const attachment = selection.first().toJSON();
      onSelect(attachment);
    }
  });

  frame.open();
  return frame;
};

/**
 * Open gallery selector (multiple images)
 * @param {Function} onSelect - Callback when images are selected
 * @param {Object} options - Additional options
 * @returns {Object} Media frame
 *
 * @example
 * openGallerySelector((attachments) => {
 *   console.log('Selected images:', attachments);
 * });
 */
export const openGallerySelector = (onSelect, options = {}) => {
  const frame = createMediaFrame({
    title: options.title || 'Select Images',
    button: {text: options.buttonText || 'Add to Gallery'},
    multiple: true,
    library: {type: 'image'}
  });

  if (!frame) return null;

  frame.on('select', () => {
    const selection = frame.state().get('selection');
    const attachments = selection.map(att => att.toJSON());
    onSelect(attachments);
  });

  frame.open();
  return frame;
};

/**
 * MIME type presets for common file types
 */
export const MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  fonts: ['font/ttf', 'font/otf', 'font/woff', 'font/woff2']
};

/**
 * Get MIME types by category
 * @param {string} category - Category name (images, videos, etc.)
 * @returns {Array<string>}
 */
export const getMimeTypes = (category) => {
  return MIME_TYPES[category] || [];
};

export default {
  isMediaAvailable,
  createMediaFrame,
  openImageSelector,
  openFileSelector,
  openGallerySelector,
  MIME_TYPES,
  getMimeTypes
};