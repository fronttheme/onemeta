/**
 * AJAX Utilities for WordPress
 * Modern fetch-based WordPress AJAX helpers
 *
 * @package OneMeta
 */

/**
 * Get WordPress AJAX URL
 * @returns {string}
 */
export const getAjaxUrl = () => {
  return window.ajaxurl || '/wp-admin/admin-ajax.php';
};

/**
 * Get nonce from global variable
 * @param {string} key - Nonce key (default: 'nonce')
 * @returns {string}
 */
export const getNonce = (key = 'nonce') => {
  // Check multiple possible locations
  if (window.onemetaBuilder?.[key]) {
    return window.onemetaBuilder[key];
  }

  if (window.onemeta?.[key]) {
    return window.onemeta[key];
  }

  if (window.wp?.nonce) {
    return window.wp.nonce;
  }

  return '';
};

/**
 * WordPress AJAX request using fetch
 * @param {string} action - WordPress action name
 * @param {Object} data - Request data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>}
 *
 * @example
 * const result = await ajax('onemeta_save_field_group', {
 *   group_key: 'my_group',
 *   title: 'My Field Group'
 * });
 */
export const ajax = async (action, data = {}, options = {}) => {
  const url = options.url || getAjaxUrl();
  const nonce = options.nonce || getNonce();

  // Prepare form data
  const formData = new FormData();
  formData.append('action', action);

  if (nonce) {
    formData.append('nonce', nonce);
  }

  // Append data
  Object.keys(data).forEach(key => {
    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'object' && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle WordPress AJAX response format
    if (result.success === false) {
      throw new Error(result.data?.message || 'Request failed');
    }

    return result.data || result;

  } catch (error) {
    console.error('AJAX Error:', error);
    throw error;
  }
};

/**
 * WordPress REST API request
 * @param {string} endpoint - REST endpoint (e.g., '/onemeta/v1/field-groups')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 *
 * @example
 * const groups = await rest('/onemeta/v1/field-groups');
 */
export const rest = async (endpoint, options = {}) => {
  const restUrl = window.onemetaBuilder?.restUrl || '/wp-json';
  const nonce = getNonce('restNonce');

  const url = restUrl + endpoint;

  const defaults = {
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce
    },
    credentials: 'same-origin'
  };

  try {
    const response = await fetch(url, { ...defaults, ...options });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('REST Error:', error);
    throw error;
  }
};

/**
 * Upload file via WordPress AJAX
 * @param {string} action - WordPress action name
 * @param {File} file - File to upload
 * @param {Object} additionalData - Additional form data
 * @returns {Promise<Object>}
 *
 * @example
 * const result = await uploadFile('onemeta_import', file, {
 *   group_key: 'my_group'
 * });
 */
export const uploadFile = async (action, file, additionalData = {}) => {
  const formData = new FormData();
  formData.append('action', action);
  formData.append('file', file);
  formData.append('nonce', getNonce());

  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });

  try {
    const response = await fetch(getAjaxUrl(), {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });

    const result = await response.json();

    if (result.success === false) {
      throw new Error(result.data?.message || 'Upload failed');
    }

    return result.data;

  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

/**
 * Show loading indicator
 * @param {HTMLElement} element - Element to show loading on
 * @param {string} message - Loading message
 */
export const showLoading = (element, message = 'Loading...') => {
  if (!element) return;

  element.classList.add('onemeta-loading');
  element.dataset.loadingText = message;
  element.disabled = true;
};

/**
 * Hide loading indicator
 * @param {HTMLElement} element - Element to hide loading from
 */
export const hideLoading = (element) => {
  if (!element) return;

  element.classList.remove('onemeta-loading');
  delete element.dataset.loadingText;
  element.disabled = false;
};

/**
 * Show success message
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export const showSuccess = (message, duration = 3000) => {
  showNotice(message, 'success', duration);
};

/**
 * Show error message
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export const showError = (message, duration = 5000) => {
  showNotice(message, 'error', duration);
};

/**
 * Show notice/toast message
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
export const showNotice = (message, type = 'info', duration = 3000) => {
  // Try WordPress native notices first
  if (window.wp?.data?.dispatch) {
    try {
      wp.data.dispatch('core/notices').createNotice(
        type,
        message,
        {
          isDismissible: true,
          type: type
        }
      );
      return;
    } catch (e) {
      // Fallback to custom notice
    }
  }

  // Fallback: Create custom notice
  const notice = document.createElement('div');
  notice.className = `onemeta-notice onemeta-notice-${type}`;
  notice.textContent = message;
  notice.style.cssText = `
    position: fixed;
    top: 32px;
    right: 20px;
    padding: 12px 20px;
    background: white;
    border-left: 4px solid ${type === 'success' ? '#46b450' : type === 'error' ? '#dc3232' : '#0073aa'};
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 999999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notice);

  setTimeout(() => {
    notice.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notice.remove(), 300);
  }, duration);
};

/**
 * Confirm dialog
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>}
 *
 * @example
 * if (await confirm('Are you sure?')) {
 *   // User clicked OK
 * }
 */
export const confirm = async (message) => {
  return window.confirm(message);
};

export default {
  ajax,
  rest,
  uploadFile,
  getAjaxUrl,
  getNonce,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showNotice,
  confirm
};