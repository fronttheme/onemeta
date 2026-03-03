/**
 * Documentation
 * Manages documentation page, field type cards, and exports
 *
 * @package OneMeta
 */

import {modal} from '@/js/shared/components/modal';
import {success, error as errorToast, info} from '@/js/shared/components/toast';

class DocsPage {
  constructor() {
    this.exportList = null;
    this.init();
  }

  /**
   * Initialize documentation page
   */
  init() {
    // Check if we're on docs page
    this.exportList = document.getElementById('export-list');

    if (!this.exportList) {
      return; // Not on docs page
    }

    // Load export list
    this.loadExportList();

    // Setup copy code buttons
    this.setupCopyCodeButtons();

    // Setup field type card interactions
    this.setupFieldTypeCards();
  }

  /**
   * Get field usage documentation
   * @param {string} fieldType - Field type
   * @returns {object}
   */
  getFieldUsage(fieldType) {
    const usageExamples = {
      text: {
        title: 'Text Field',
        description: 'Single line text input for short text content like names, titles, or labels.',
        code: `<?php
// Get text field value
$text = onemeta_get_meta(get_the_ID(), 'field_name');

// Display with escaping
echo esc_html($text);

// With default value
$text = onemeta_get_meta(get_the_ID(), 'field_name', 'Default text');
?>`,
        example: `<h2><?php echo esc_html($text); ?></h2>`
      },

      textarea: {
        title: 'Textarea Field',
        description: 'Multi-line text input for longer content like descriptions, excerpts, or paragraphs.',
        code: `<?php
// Get textarea value
$textarea = onemeta_get_meta(get_the_ID(), 'field_description');

// Display with line breaks preserved
echo wp_kses_post(wpautop($textarea));

// Or display raw with escaping
echo esc_html($textarea);
?>`,
        example: `<div class="description">
  <?php echo wp_kses_post(wpautop($textarea)); ?>
</div>`
      },

      url: {
        title: 'URL Field',
        description: 'URL field with validation for web addresses, links, or external resources.',
        code: `<?php
// Get URL value
$url = onemeta_get_meta(get_the_ID(), 'field_website');

// Display as link
if ($url) {
  echo '<a href="' . esc_url($url) . '" target="_blank">';
  echo esc_html($url);
  echo '</a>';
}
?>`,
        example: `<a href="<?php echo esc_url($url); ?>" 
   target="_blank" 
   rel="noopener">
  Visit Website
</a>`
      },

      email: {
        title: 'Email Field',
        description: 'Email field with validation for email addresses.',
        code: `<?php
// Get email value
$email = onemeta_get_meta(get_the_ID(), 'field_email');

// Display as mailto link
if ($email) {
  echo '<a href="mailto:' . esc_attr($email) . '">';
  echo esc_html($email);
  echo '</a>';
}
?>`,
        example: `<a href="mailto:<?php echo esc_attr($email); ?>">
  <?php echo esc_html($email); ?>
</a>`
      },

      date: {
        title: 'Date Field',
        description: 'Date picker for selecting dates. Returns date in Y-m-d format.',
        code: `<?php
// Get date value
$date = onemeta_get_meta(get_the_ID(), 'field_event_date');

// Format date
if ($date) {
  // Convert to timestamp
  $timestamp = strtotime($date);
  
  // Display formatted
  echo date('F j, Y', $timestamp); // December 25, 2025
  
  // Or use WordPress function
  echo date_i18n(get_option('date_format'), $timestamp);
}
?>`,
        example: `<time datetime="<?php echo esc_attr($date); ?>">
  <?php echo date_i18n('F j, Y', strtotime($date)); ?>
</time>`
      },

      toggle: {
        title: 'Toggle Field',
        description: 'On/Off switch for boolean values. Returns "1" for on, empty string for off.',
        code: `<?php
// Get toggle value
$toggle = onemeta_get_meta(get_the_ID(), 'field_featured');

// Check if enabled
if ($toggle) {
  echo '<span class="badge">Featured</span>';
}

// Or use with conditional
$is_active = (bool) $toggle;
if ($is_active) {
  // Do something
}
?>`,
        example: `<?php if ($toggle): ?>
  <div class="featured-badge">
    ⭐ Featured Post
  </div>
<?php endif; ?>`
      },

      select: {
        title: 'Select Field',
        description: 'Dropdown select for single choice selection. Returns the selected value.',
        code: `<?php
// Get select value
$category = onemeta_get_meta(get_the_ID(), 'field_category');

// Display value
echo esc_html($category);

// Use in conditional
if ($category === 'premium') {
  echo '<span class="premium-badge">Premium</span>';
}

// Get label from choices (if you store them)
$choices = [
  'free' => 'Free Plan',
  'premium' => 'Premium Plan',
  'enterprise' => 'Enterprise Plan'
];
echo esc_html($choices[$category] ?? $category);
?>`,
        example: `<div class="category-<?php echo esc_attr($category); ?>">
  <?php echo esc_html(ucfirst($category)); ?>
</div>`
      },

      checkbox: {
        title: 'Checkbox Field',
        description: 'Multiple selection with checkboxes. Returns an array of selected values.',
        code: `<?php
// Get checkbox values (returns array)
$features = onemeta_get_meta(get_the_ID(), 'field_features');

// Display as list
if ($features && is_array($features)) {
  echo '<ul>';
  foreach ($features as $feature) {
    echo '<li>' . esc_html($feature) . '</li>';
  }
  echo '</ul>';
}

// Check if specific value is selected
if (in_array('wifi', $features)) {
  echo '📶 WiFi Available';
}
?>`,
        example: `<div class="features">
  <?php foreach ($features as $feature): ?>
    <span class="badge">
      <?php echo esc_html($feature); ?>
    </span>
  <?php endforeach; ?>
</div>`
      },

      radio: {
        title: 'Radio Field',
        description: 'Radio buttons for single selection from multiple options.',
        code: `<?php
// Get radio value
$size = onemeta_get_meta(get_the_ID(), 'field_size');

// Display value
echo esc_html($size);

// Use in conditional
switch ($size) {
  case 'small':
    $class = 'product-sm';
    break;
  case 'medium':
    $class = 'product-md';
    break;
  case 'large':
    $class = 'product-lg';
    break;
}
?>`,
        example: `<div class="size-<?php echo esc_attr($size); ?>">
  Size: <?php echo esc_html(strtoupper($size)); ?>
</div>`
      },

      button_group: {
        title: 'Button Group Field',
        description: 'Button group selector for visual choice selection.',
        code: `<?php
// Get button group value
$layout = onemeta_get_meta(get_the_ID(), 'field_layout');

// Use in template logic
if ($layout === 'grid') {
  get_template_part('template-parts/grid-layout');
} else {
  get_template_part('template-parts/list-layout');
}

// Display as class
echo '<div class="layout-' . esc_attr($layout) . '">';
?>`,
        example: `<div class="content-layout layout-<?php echo esc_attr($layout); ?>">
  <!-- Your content here -->
</div>`
      },

      image: {
        title: 'Image Field',
        description: 'Image uploader with media library. Returns attachment ID.',
        code: `<?php
// Get image attachment ID
$image_id = onemeta_get_meta(get_the_ID(), 'field_featured_image');

// Display image with wp_get_attachment_image()
if ($image_id) {
  echo wp_get_attachment_image($image_id, 'full', false, [
    'class' => 'featured-image',
    'alt' => get_the_title()
  ]);
}

// Or get image URL
$image_url = wp_get_attachment_image_url($image_id, 'large');
if ($image_url) {
  echo '<img src="' . esc_url($image_url) . '" alt="">';
}

// Get image with srcset for responsive
echo wp_get_attachment_image($image_id, 'large', false, [
  'srcset' => wp_get_attachment_image_srcset($image_id, 'large'),
  'sizes' => '(max-width: 768px) 100vw, 50vw'
]);
?>`,
        example: `<figure class="featured-image">
  <?php echo wp_get_attachment_image($image_id, 'full'); ?>
  <figcaption>
    <?php echo esc_html(get_post_meta($image_id, '_wp_attachment_image_alt', true)); ?>
  </figcaption>
</figure>`
      },

      file: {
        title: 'File Field',
        description: 'File uploader with type restrictions. Returns attachment ID.',
        code: `<?php
// Get file attachment ID
$file_id = onemeta_get_meta(get_the_ID(), 'field_document');

// Get file URL and info
if ($file_id) {
  $file_url = wp_get_attachment_url($file_id);
  $file_name = basename(get_attached_file($file_id));
  $file_type = get_post_mime_type($file_id);
  $file_size = size_format(filesize(get_attached_file($file_id)));
  
  // Display download link
  echo '<a href="' . esc_url($file_url) . '" download>';
  echo esc_html($file_name) . ' (' . $file_size . ')';
  echo '</a>';
}
?>`,
        example: `<div class="file-download">
  <a href="<?php echo esc_url(wp_get_attachment_url($file_id)); ?>" 
     class="button" 
     download>
    📄 Download: <?php echo esc_html(basename(get_attached_file($file_id))); ?>
  </a>
</div>`
      },

      gallery: {
        title: 'Gallery Field',
        description: 'Multiple images uploader with ordering. Returns array of attachment IDs.',
        code: `<?php
// Get gallery attachment IDs (returns array)
$gallery = onemeta_get_meta(get_the_ID(), 'field_gallery');

// Display gallery
if ($gallery && is_array($gallery)) {
  echo '<div class="gallery">';
  foreach ($gallery as $image_id) {
    echo wp_get_attachment_image($image_id, 'thumbnail', false, [
      'class' => 'gallery-item'
    ]);
  }
  echo '</div>';
}

// With lightbox/links
foreach ($gallery as $image_id) {
  $full_url = wp_get_attachment_image_url($image_id, 'full');
  $thumb_url = wp_get_attachment_image_url($image_id, 'thumbnail');
  
  echo '<a href="' . esc_url($full_url) . '" data-lightbox="gallery">';
  echo '<img src="' . esc_url($thumb_url) . '" alt="">';
  echo '</a>';
}
?>`,
        example: `<div class="image-gallery">
  <?php foreach ($gallery as $image_id): ?>
    <div class="gallery-item">
      <?php echo wp_get_attachment_image($image_id, 'medium'); ?>
    </div>
  <?php endforeach; ?>
</div>`
      },

      repeater: {
        title: 'Repeater Field',
        description: 'Repeatable field group with sub-fields. Returns array of row data.',
        code: `<?php
// Get repeater rows (returns array of arrays)
$team_members = onemeta_get_meta(get_the_ID(), 'field_team_members');

// Loop through rows
if ($team_members && is_array($team_members)) {
  echo '<div class="team-grid">';
  
  foreach ($team_members as $member) {
    // Access sub-fields
    $name = $member['member_name'];
    $bio = $member['member_bio'];
    $avatar_id = $member['member_avatar'];
    
    // Display
    echo '<div class="team-member">';
    
    // Display image from repeater
    if ($avatar_id) {
      echo wp_get_attachment_image($avatar_id, 'thumbnail', false, [
        'class' => 'member-avatar',
        'alt' => esc_attr($name)
      ]);
    }
    
    echo '<h3>' . esc_html($name) . '</h3>';
    echo wp_kses_post(wpautop($bio));
    echo '</div>';
  }
  
  echo '</div>';
}
?>`,
        example: `<div class="team-section">
  <?php 
  $team = onemeta_get_meta(get_the_ID(), 'field_team');
  if ($team):
  ?>
    <?php foreach ($team as $member): ?>
      <article class="team-member">
        <?php echo wp_get_attachment_image($member['avatar'], 'medium'); ?>
        <h3><?php echo esc_html($member['name']); ?></h3>
        <p><?php echo esc_html($member['role']); ?></p>
        <?php echo wp_kses_post(wpautop($member['bio'])); ?>
      </article>
    <?php endforeach; ?>
  <?php endif; ?>
</div>`
      }
    };

    return usageExamples[fieldType] || null;
  }

  /**
   * Setup field type card interactions
   */
  setupFieldTypeCards() {
    const fieldCards = document.querySelectorAll('.onemeta-field-card');

    fieldCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();

        const fieldType = card.dataset.type;
        const usage = this.getFieldUsage(fieldType);

        if (!usage) {
          console.warn('No usage documentation for field type:', fieldType);
          return;
        }

        // Create unique ID for code block
        const codeId = `usage-code-${fieldType}`;
        const exampleId = `usage-example-${fieldType}`;

        // Show comprehensive usage modal
        modal({
          title: `${usage.title} - Usage Guide`,
          content: `
            <div class="onemeta-field-usage-docs">
              <!-- Description -->
              <div style="margin-bottom: 24px;">
                <p style="font-size: 15px; line-height: 1.6; color: #665999; margin: 0;">
                  ${usage.description}
                </p>
              </div>
              
              <!-- Basic Usage -->
              <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <h3 style="margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #2f2c6e;">
                    <i class="fa-solid fa-pen-to-square"></i> Basic Usage
                  </h3>
                  <button 
                    class="onemeta-button onemeta-button--small onemeta-button--outline onemeta-inline-copy-btn" 
                    data-target="${codeId}"
                    style="padding: 4px 12px;">
                    <i class="fa-solid fa-copy" style="font-size: 16px;"></i>
                    Copy
                  </button>
                </div>
                <pre style="background: #F4F0F7; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 0;"><code id="${codeId}" class="language-php" style="background: transparent; font-family: 'JetBrains Mono', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.6; color: #2f2c6e;">${this.escapeHtml(usage.code)}</code></pre>
              </div>
              
              <!-- Example -->
              <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <h3 style="margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #2f2c6e;">
                    <i class="fa-solid fa-file-code"></i> Template Example
                  </h3>
                  <button 
                    class="onemeta-button onemeta-button--small onemeta-button--outline onemeta-inline-copy-btn" 
                    data-target="${exampleId}"
                    style="padding: 4px 12px;">
                    <i class="fa-solid fa-copy" style="font-size: 16px;"></i>
                    Copy
                  </button>
                </div>
                <pre style="background: #f6f2ff; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 0; border-left: 3px solid #6f26f8;"><code id="${exampleId}" class="language-php" style="background: transparent; font-family: 'JetBrains Mono', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.6; color: #2f2c6e;">${this.escapeHtml(usage.example)}</code></pre>
              </div>
              
              <!-- Quick Tips -->
              <div class="onemeta-info-box onemeta-info-box--info" style="margin: 0;">
                <div class="onemeta-info-box__header">
                  <div class="onemeta-info-box__icon">
                    <i class="fa-solid fa-lightbulb"></i>
                  </div>
                  <h4>Quick Tips</h4>
                </div>
                <div class="onemeta-info-box__content">                  
                  <ul style="margin: 0; line-height: 1.8;">
                    <li>Always use <code>onemeta_get_meta()</code> to retrieve field values</li>
                    <li>First parameter is the post ID, second is the field key</li>
                    <li>Always escape output with <code>esc_html()</code>, <code>esc_url()</code>, or <code>esc_attr()</code></li>
                    <li>Optional third parameter sets a default value</li>
                  </ul>
                </div>
              </div>
            </div>
          `,
          confirmText: 'Create Field Group',
          showCancel: true,
          cancelText: 'Close',
          type: 'info',
          width: '800px',
          onConfirm: () => {
            const adminUrl = window.onemetaAdmin.ajaxurl.replace('/admin-ajax.php', '/admin.php');
            window.location.href = `${adminUrl}?page=onemeta-new`;
          }
        });

        // Bind copy buttons for code blocks inside modal
        setTimeout(() => {
          this.setupInlineCopyButtons();
        }, 100);
      });

      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  /**
   * Setup inline copy buttons (for modal code blocks)
   */
  setupInlineCopyButtons() {
    const inlineCopyButtons = document.querySelectorAll('.onemeta-inline-copy-btn');

    inlineCopyButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const targetId = button.dataset.target;
        const codeBlock = document.getElementById(targetId);

        if (!codeBlock) {
          return;
        }

        const code = codeBlock.textContent;

        try {
          await this.copyToClipboard(code);

          // Show success feedback
          const originalHTML = button.innerHTML;
          button.innerHTML = '<i class="fa-solid fa-check-double"></i> Copied!';
          button.classList.add('onemeta-button--success');

          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('onemeta-button--success');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });
  }

  /**
   * Load export list
   */
  async loadExportList() {
    try {
      const response = await fetch(window.onemetaAdmin.restUrl + 'field-groups', {
        headers: {
          'X-WP-Nonce': window.onemetaAdmin.restNonce
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.length === 0) {
        this.renderEmptyExportList();
      } else {
        this.renderExportList(data);
      }

    } catch (err) {
      console.error('❌ Error loading field groups:', err);
      this.renderExportError();
    }
  }

  /**
   * Render empty export list
   */
  renderEmptyExportList() {
    const adminUrl = window.onemetaAdmin.ajaxurl.replace('/admin-ajax.php', '/admin.php');
    this.exportList.innerHTML = `
      <div class="onemeta-empty-state onemeta-empty-state--small">
        <p>No field groups available to export.</p>
        <a href="${adminUrl}?page=onemeta-new"
           class="onemeta-button onemeta-button--primary">
          Create Field Group
        </a>
      </div>
    `;
  }

  /**
   * Render export list
   * @param {Array} groups - Field groups
   */
  renderExportList(groups) {
    let html = `
      <table class="wp-list-table widefat fixed striped onemeta-export-table">
        <thead>
          <tr>
            <th>Field Group</th>
            <th>Fields</th>
            <th>Post Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    groups.forEach(group => {
      const fieldCount = Object.keys(group.config.fields || {}).length;
      const postType = group.config?.type === 'user' ? 'user' : (group.config?.post_type || 'N/A');

      html += `
        <tr>
          <td>
            <strong>${this.escapeHtml(group.title)}</strong>
            <div class="onemeta-status-badge onemeta-status-badge--${group.status}">
              ${group.status}
            </div>
          </td>
          <td>${fieldCount} ${fieldCount === 1 ? 'field' : 'fields'}</td>
          <td><code>${this.escapeHtml(postType)}</code></td>
          <td>
            <button
              class="onemeta-button onemeta-button--small onemeta-button--secondary onemeta-export-btn"
              data-group-id="${group.id}"
              data-group-title="${this.escapeHtml(group.title)}"
              data-tooltip="Export as PHP"
              data-tooltip-position="top">
              <i class="fa-solid fa-download"></i>
              Export PHP
            </button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    this.exportList.innerHTML = html;

    // Bind export buttons
    this.bindExportButtons();
  }

  /**
   * Render export error
   */
  renderExportError() {
    this.exportList.innerHTML = `
      <div class="notice notice-error onemeta-notice onemeta-notice--error">
        <p>Failed to load field groups. Please refresh the page.</p>
      </div>
    `;
  }

  /**
   * Bind export buttons
   */
  bindExportButtons() {
    const buttons = document.querySelectorAll('.onemeta-export-btn');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const groupId = button.dataset.groupId;
        const groupTitle = button.dataset.groupTitle;
        this.exportFieldGroup(groupId, groupTitle);
      });
    });
  }

  /**
   * Export field group
   * @param {string} groupId - Group ID
   * @param {string} groupTitle - Group title
   */
  async exportFieldGroup(groupId, groupTitle) {
    const loadingToast = info('Preparing export...', 0);

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

      if (loadingToast && loadingToast.remove) {
        loadingToast.remove();
      }

      if (result.success) {
        const phpCode = result.data.code;
        const filename = result.data.filename || `onemeta-${groupId}.php`;

        modal({
          title: `Export: ${groupTitle}`,
          content: `
          <p style="margin-bottom: 12px;">
            Copy this code to your theme's <code style="font-family: 'JetBrains Mono', monospace;">functions.php</code> file:
          </p>
          <textarea 
            id="export-code" 
            readonly 
            style="width:100%; height:350px; font-family:'JetBrains Mono', monospace; font-size:14px; padding:12px; background-color: #F4F0F7; color: #2f2c6e; border:1px solid #C8BADB; border-radius:4px; box-shadow: none; outline: none;"
          >${phpCode}</textarea>
        `,
          confirmText: 'Copy to Clipboard',
          cancelText: 'Download PHP File',
          showCancel: true,
          width: '700px',
          type: 'success',
          onConfirm: async () => {
            try {
              await this.copyToClipboard(phpCode);
              success('PHP code copied to clipboard!');
            } catch (err) {
              errorToast('Failed to copy. Please copy manually.');
            }
          },
          onCancel: () => {
            this.downloadFile(phpCode, filename);
          }
        });
      } else {
        errorToast('Export failed: ' + (result.data || 'Unknown error'));
      }
    } catch (err) {
      if (loadingToast && loadingToast.remove) {
        loadingToast.remove();
      }
      console.error('Export error:', err);
      errorToast('Export failed. Please try again.');
    }
  }

  /**
   * Copy text to clipboard (with fallback support)
   * @param {string} text - Text to copy
   */
  async copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return await navigator.clipboard.writeText(text);
    }

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
    success('File downloaded successfully!');
  }

  /**
   * Setup copy code buttons
   */
  setupCopyCodeButtons() {
    const copyButtons = document.querySelectorAll('.onemeta-copy-code');

    copyButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const targetId = button.dataset.target;
        const codeBlock = document.getElementById(targetId);

        if (!codeBlock) {
          errorToast('Code block not found');
          return;
        }

        const code = codeBlock.textContent;

        try {
          await this.copyToClipboard(code);

          const originalHTML = button.innerHTML;
          button.innerHTML = '<i class="fa-solid fa-check-double"></i> Copied!';
          button.classList.add('onemeta-button--success');

          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('onemeta-button--success');
          }, 2000);

          success('Code copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy:', err);
          errorToast('Failed to copy code');
        }
      });
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Auto-initialize when DOM is ready
 */
const initDocsPage = () => {
  new DocsPage();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDocsPage);
} else {
  initDocsPage();
}

export default DocsPage;