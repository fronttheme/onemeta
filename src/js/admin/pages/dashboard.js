/**
 * Dashboard Module
 * Manages field groups dashboard
 *
 * @package OneMeta
 */

import {confirmDelete} from '@/js/shared/components/confirm';
import {success, error as errorToast, info} from '@/js/shared/components/toast';
import {modal} from '@/js/shared/components/modal';

class Dashboard {
  constructor() {
    this.root = null;
    this.statsContainer = null;
    this.init();
  }

  /**
   * Initialize dashboard
   */
  init() {
    // Check if we're on dashboard page
    this.root = document.getElementById('onemeta-dashboard-root');
    this.statsContainer = document.getElementById('onemeta-stats');

    if (!this.root) {
      return; // Not on dashboard page
    }

    // Load dashboard data
    this.loadDashboard();
  }

  /**
   * Fetch and render field groups
   */
  async loadDashboard() {
    try {
      const response = await fetch(window.onemetaAdmin.restUrl + 'field-groups', {
        headers: {
          'X-WP-Nonce': window.onemetaAdmin.restNonce
        }
      });

      if (!response.ok) {
        throw new Error(window.onemetaAdmin?.i18n?.network_error || 'Network response was not ok!');
      }

      const data = await response.json();

      // Render stats
      this.renderStats(data);

      // Render field groups
      if (data.length === 0) {
        this.renderEmptyState();
      } else {
        this.renderFieldGroups(data);
      }
    } catch (err) {
      this.renderError();
    }
  }

  /**
   * Render statistics cards
   * @param {Array} groups - Field groups
   */
  renderStats(groups) {
    const i18n = window.onemetaAdmin?.i18n || {};

    const totalGroups = groups.length;
    const activeGroups = groups.filter(g => g.status === 'active').length;
    const totalFields = groups.reduce((sum, g) => {
      return sum + Object.keys(g.config.fields || {}).length;
    }, 0);

    this.statsContainer.innerHTML = `
    <div class="onemeta-stats__grid">
      <div class="onemeta-stat-card onemeta-card">
        <div class="onemeta-stat-card__icon onemeta-stat-card__icon--primary">
          <i class="fa-solid fa-list-ul"></i>
        </div>
        <div class="onemeta-stat-card__content">
          <div class="onemeta-stat-card__value">${totalGroups}</div>
          <div class="onemeta-stat-card__label">${i18n.total_groups || 'Total Groups'}</div>
        </div>
      </div>

      <div class="onemeta-stat-card onemeta-card">
        <div class="onemeta-stat-card__icon onemeta-stat-card__icon--success">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="onemeta-stat-card__content">
          <div class="onemeta-stat-card__value">${activeGroups}</div>
          <div class="onemeta-stat-card__label">${i18n.active_groups || 'Active Groups'}</div>
        </div>
      </div>

      <div class="onemeta-stat-card onemeta-card">
        <div class="onemeta-stat-card__icon onemeta-stat-card__icon--info">
          <i class="fa-solid fa-table-list"></i>
        </div>
        <div class="onemeta-stat-card__content">
          <div class="onemeta-stat-card__value">${totalFields}</div>
          <div class="onemeta-stat-card__label">${i18n.total_fields || 'Total Fields'}</div>
        </div>
      </div>
    </div>
  `;
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    const template = document.getElementById('onemeta-empty-state-template');
    this.root.innerHTML = '';
    this.root.appendChild(template.content.cloneNode(true));
  }

  /**
   * Render field groups
   * @param {Array} groups - Field groups
   */
  renderFieldGroups(groups) {
    const container = document.createElement('div');
    container.className = 'onemeta-field-groups';

    groups.forEach(group => {
      const card = this.createFieldGroupCard(group);
      container.appendChild(card);
    });

    this.root.innerHTML = '';
    this.root.appendChild(container);
  }

  /**
   * Create field group card
   * @param {Object} group - Field group data
   * @returns {HTMLElement}
   */
  createFieldGroupCard(group) {
    const template = document.getElementById('onemeta-field-group-card-template');
    const card = template.content.cloneNode(true).querySelector('.onemeta-field-group-card');

    const statusClass = group.status === 'active' ? 'active' : 'inactive';
    const fieldCount = Object.keys(group.config.fields || {}).length;

    // Set data attribute
    card.dataset.groupId = group.id;

    // Set title
    card.querySelector('.onemeta-field-group-card__title').textContent = group.title;

    // Set status badge
    const statusBadge = card.querySelector('.onemeta-status-badge');
    statusBadge.classList.add(`onemeta-status-badge--${statusClass}`);
    statusBadge.textContent = group.status;

    // Set field count
    card.querySelector('.onemeta-field-group-card__stat-value').textContent =
      `${fieldCount} ${fieldCount === 1 ? 'field' : 'fields'}`;

    // Set post type
    card.querySelector('.onemeta-field-group-card__stat-label').textContent =
      group.config?.type === 'user' ? 'user' : (group.config?.post_type || 'N/A');

    // Edit link construction using admin_url from PHP
    const editBtn = card.querySelector('.onemeta-action-edit');
    const adminUrl = window.onemetaAdmin.ajaxurl.replace('/admin-ajax.php', '/admin.php');
    editBtn.href = `${adminUrl}?page=onemeta-edit&id=${group.id}`;

    // Bind action buttons
    this.bindActionButtons(card, group);

    return card;
  }

  /**
   * Bind action buttons
   * @param {HTMLElement} card - Card element
   * @param {Object} group - Field group data
   */
  bindActionButtons(card, group) {
    // Export button
    const exportBtn = card.querySelector('.onemeta-action-export');
    exportBtn.addEventListener('click', () => this.exportFieldGroup(group.id, group.title));

    // Toggle button
    const toggleBtn = card.querySelector('.onemeta-action-toggle');
    const tooltipText = group.status === 'active' ? 'Deactivate' : 'Activate';
    toggleBtn.setAttribute('data-tooltip', tooltipText);
    toggleBtn.setAttribute('aria-label', tooltipText);
    toggleBtn.addEventListener('click', () => this.toggleGroupStatus(group.id, group.title));

    // Delete button
    const deleteBtn = card.querySelector('.onemeta-action-delete');
    deleteBtn.addEventListener('click', () => this.deleteFieldGroup(group.id, group.title));
  }

  /**
   * Render error state
   */
  renderError() {
    this.root.innerHTML = `
      <div class="notice notice-error onemeta-notice onemeta-notice--error">
        <p>${window.onemetaAdmin?.i18n?.failed_to_load_groups}</p>
      </div>
    `;
  }

  /**
   * Export field group
   * @param {string} groupId - Group ID
   * @param {string} groupTitle - Group title
   */
  async exportFieldGroup(groupId, groupTitle) {
    // Show loading indicator
    const i18n = window.onemetaAdmin?.i18n || {};
    const loadingToast = info(i18n.preparing_export || 'Preparing export...', 0);

    const formData = new FormData();
    formData.append('action', 'onemeta_export_group');
    formData.append('nonce', window.onemetaAdmin.nonce);
    formData.append('group_id', groupId);

    try {
      const response = await fetch(window.onemetaAdmin.ajaxurl, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      // Remove loading toast
      if (loadingToast && loadingToast.remove) {
        loadingToast.remove();
      }

      if (result.success) {
        const phpCode = result.data.code;
        const filename = result.data.filename || `onemeta-${groupId}.php`;

        // Show modal with code
        modal({
          title: `${i18n.export_title || 'Export:'} ${groupTitle}`,
          content: `
        <p style="margin-bottom: 12px;">
          ${i18n.export_instructions || 'Copy this code to your theme\'s <code style="font-family: \'JetBrains Mono\', monospace;">functions.php</code> file:'}
        </p>
        <textarea 
          id="export-code" 
          readonly
          style="width:100%; height:350px; font-family:'JetBrains Mono', monospace; font-size:14px; padding:12px; background-color: #F4F0F7; color: #2f2c6e; border:1px solid #C8BADB; border-radius:4px; box-shadow: none; outline: none;"
        >${phpCode}</textarea>
      `,
          confirmText: i18n.copy_to_clipboard || 'Copy to Clipboard',
          cancelText: i18n.download_php_file || 'Download PHP File',
          showCancel: true,
          width: '700px',
          type: 'success',
          onConfirm: async () => {
            try {
              await this.copyToClipboard(phpCode);
              success(i18n.code_copied || 'PHP code copied to clipboard!');
            } catch (err) {
              errorToast(i18n.copy_failed || 'Failed to copy. Please copy manually.');
            }
          },
          onCancel: () => {
            this.downloadFile(phpCode, filename);
          }
        });
      } else {
        errorToast(`${i18n.export_failed || 'Export failed:'} ${result.data || i18n.unknown_error || 'Unknown error'}`);
      }
    } catch (err) {
      // Remove loading toast on error
      if (loadingToast && loadingToast.remove) {
        loadingToast.remove();
      }
      console.error('Export error:', err);
      errorToast(i18n.export_failed_retry || 'Export failed. Please try again.');
    }
  }

  /**
   * Copy text to clipboard (with fallback support)
   * @param {string} text - Text to copy
   */
  async copyToClipboard(text) {
    // Try modern API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return await navigator.clipboard.writeText(text);
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  }

  /**
   * Download content as file
   * @param {string} content - File content
   * @param {string} filename - File name
   */
  downloadFile(content, filename) {
    const blob = new Blob([content], {type: 'application/x-php'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    success(window.onemetaAdmin?.i18n?.file_downloaded || 'File downloaded successfully!');
  }

  /**
   * Toggle group status
   * @param {string} groupId - Group ID
   * @param {string} groupTitle - Group title
   */
  async toggleGroupStatus(groupId, groupTitle) {
    const i18n = window.onemetaAdmin?.i18n || {};

    const formData = new FormData();
    formData.append('action', 'onemeta_toggle_group_status');
    formData.append('nonce', window.onemetaAdmin.nonce);
    formData.append('group_id', groupId);

    try {
      const response = await fetch(window.onemetaAdmin.ajaxurl, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        success(`"${groupTitle}" ${i18n.status_updated || 'status updated!'}`);

        // Reload after short delay
        setTimeout(() => {
          location.reload();
        }, 800);
      } else {
        errorToast(`${i18n.status_update_failed || 'Failed to update status:'} ${result.data || i18n.unknown_error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      errorToast(i18n.status_update_retry || 'Failed to update status. Please try again.');
    }
  }

  /**
   * Delete field group
   * @param {string} groupId - Group ID
   * @param {string} groupTitle - Group title
   */
  async deleteFieldGroup(groupId, groupTitle) {
    const i18n = window.onemetaAdmin?.i18n || {};

    // Show confirmation dialog
    const confirmed = await confirmDelete(`${i18n.field_group || 'field group'} "${groupTitle}"`);

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.append('action', 'onemeta_delete_group');
    formData.append('nonce', window.onemetaAdmin.nonce);
    formData.append('group_id', groupId);

    try {
      const response = await fetch(window.onemetaAdmin.ajaxurl, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        success(i18n.group_deleted || 'Field group deleted successfully!');

        // Reload after short delay
        setTimeout(() => {
          location.reload();
        }, 800);
      } else {
        errorToast(`${i18n.delete_failed || 'Failed to delete:'} ${result.data || i18n.unknown_error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      errorToast(i18n.delete_retry || 'Failed to delete. Please try again.');
    }
  }

}

/**
 * Auto-initialize when DOM is ready
 */
const initDashboard = () => {
  new Dashboard();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

export default Dashboard;