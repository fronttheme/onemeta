/**
 * Confirm Component
 * Confirmation dialog
 *
 * @package OneMeta
 */

import {modal} from './modal';

/**
 * Show confirmation dialog
 * @param {string|Object} options - Message string or options object
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if canceled
 */
export function confirm(options) {
  // Handle string shorthand
  if (typeof options === 'string') {
    options = {message: options};
  }

  const {
    message = 'Are you sure?',
    title = 'Confirm',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    icon = 'warning'
  } = options;

  return new Promise((resolve) => {
    // Build content with icon
    let content = '<div class="onemeta-confirm">';

    if (icon) {
      content += `<div class="onemeta-confirm__icon onemeta-confirm__icon--${icon}">`;
      content += getIconHtml(icon);
      content += '</div>';
    }

    content += `<div class="onemeta-confirm__message">${message}</div>`;
    content += '</div>';

    modal({
      title: title,
      content: content,
      type: type,
      confirmText: confirmText,
      cancelText: cancelText,
      showCancel: true,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      onClose: () => resolve(false),
      closeOnOverlay: false, // Force user to make a choice
      width: '450px'
    });
  });
}

/**
 * Confirm delete action
 * @param {string} itemName - Name of item to delete
 * @returns {Promise<boolean>}
 */
export function confirmDelete(itemName = 'this item') {
  return confirm({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    icon: 'trash'
  });
}

/**
 * Confirm discard changes
 * @returns {Promise<boolean>}
 */
export function confirmDiscard() {
  return confirm({
    title: 'Unsaved Changes',
    message: 'You have unsaved changes. Are you sure you want to discard them?',
    confirmText: 'Discard',
    cancelText: 'Keep Editing',
    type: 'warning',
    icon: 'warning'
  });
}

/**
 * Get icon HTML based on type
 * @param {string} type - Icon type
 * @returns {string} HTML
 */
function getIconHtml(type) {
  const icons = {
    warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
    danger: '<i class="fa-solid fa-xmark"></i>',
    trash: '<i class="fa-solid fa-trash-can"></i>',
    info: '<i class="fa-solid fa-circle-info"></i>',
    question: '<i class="fa-solid fa-circle-question"></i>',
    success: '<i class="fa-solid fa-circle-check"></i>'
  };

  return icons[type] || icons.warning;
}

export default confirm;