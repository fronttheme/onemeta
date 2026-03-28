<?php
  /**
   * OneMeta Documentation View
   * Field types documentation and export interface
   *
   * @package OneMeta
   */

  if ( ! defined( 'ABSPATH' ) ) {
    exit;
  }

  // Field types data
  $field_types = [
      [
          'type'        => 'text',
          'title'       => __( 'Text', 'onemeta' ),
          'description' => __( 'Single line text input for short text content', 'onemeta' ),
          'icon'        => 'fa-heading',
          'badge'       => __( 'Basic', 'onemeta' ),
          'docs_url'    => '#text-field'
      ],
      [
          'type'        => 'textarea',
          'title'       => __( 'Textarea', 'onemeta' ),
          'description' => __( 'Multi-line text input for longer content', 'onemeta' ),
          'icon'        => 'fa-paragraph',
          'badge'       => __( 'Basic', 'onemeta' ),
          'docs_url'    => '#textarea-field'
      ],
      [
          'type'        => 'url',
          'title'       => __( 'URL', 'onemeta' ),
          'description' => __( 'URL field with validation for web addresses', 'onemeta' ),
          'icon'        => 'fa-link',
          'badge'       => __( 'Basic', 'onemeta' ),
          'docs_url'    => '#url-field'
      ],
      [
          'type'        => 'email',
          'title'       => __( 'Email', 'onemeta' ),
          'description' => __( 'Email field with validation', 'onemeta' ),
          'icon'        => 'fa-at',
          'badge'       => __( 'Basic', 'onemeta' ),
          'docs_url'    => '#email-field'
      ],
      [
          'type'        => 'date',
          'title'       => __( 'Date', 'onemeta' ),
          'description' => __( 'Date picker for selecting dates', 'onemeta' ),
          'icon'        => 'fa-calendar-days',
          'badge'       => __( 'Basic', 'onemeta' ),
          'docs_url'    => '#date-field'
      ],
      [
          'type'        => 'toggle',
          'title'       => __( 'Toggle', 'onemeta' ),
          'description' => __( 'On/Off switch for boolean values', 'onemeta' ),
          'icon'        => 'fa-toggle-on',
          'badge'       => __( 'Choice', 'onemeta' ),
          'docs_url'    => '#toggle-field'
      ],
      [
          'type'        => 'select',
          'title'       => __( 'Select', 'onemeta' ),
          'description' => __( 'Dropdown select for single choice', 'onemeta' ),
          'icon'        => 'fa-circle-chevron-down',
          'badge'       => __( 'Choice', 'onemeta' ),
          'docs_url'    => '#select-field'
      ],
      [
          'type'        => 'checkbox',
          'title'       => __( 'Checkbox', 'onemeta' ),
          'description' => __( 'Multiple selection with checkboxes', 'onemeta' ),
          'icon'        => 'fa-square-check',
          'badge'       => __( 'Multiple', 'onemeta' ),
          'docs_url'    => '#checkbox-field'
      ],
      [
          'type'        => 'radio',
          'title'       => __( 'Radio', 'onemeta' ),
          'description' => __( 'Radio buttons for single selection', 'onemeta' ),
          'icon'        => 'fa-circle-dot',
          'badge'       => __( 'Choice', 'onemeta' ),
          'docs_url'    => '#radio-field'
      ],
      [
          'type'        => 'button_group',
          'title'       => __( 'Button Group', 'onemeta' ),
          'description' => __( 'Button group selector for visual choice', 'onemeta' ),
          'icon'        => 'fa-mattress-pillow',
          'badge'       => __( 'Choice', 'onemeta' ),
          'docs_url'    => '#button-group-field'
      ],
      [
          'type'        => 'image',
          'title'       => __( 'Image', 'onemeta' ),
          'description' => __( 'Image uploader with media library', 'onemeta' ),
          'icon'        => 'fa-image',
          'badge'       => __( 'Media', 'onemeta' ),
          'docs_url'    => '#image-field'
      ],
      [
          'type'        => 'file',
          'title'       => __( 'File', 'onemeta' ),
          'description' => __( 'File uploader with type restrictions', 'onemeta' ),
          'icon'        => 'fa-file-image',
          'badge'       => __( 'Media', 'onemeta' ),
          'docs_url'    => '#file-field'
      ],
      [
          'type'        => 'gallery',
          'title'       => __( 'Gallery', 'onemeta' ),
          'description' => __( 'Multiple images uploader with ordering', 'onemeta' ),
          'icon'        => 'fa-images',
          'badge'       => __( 'Media', 'onemeta' ),
          'docs_url'    => '#gallery-field'
      ],
      [
          'type'        => 'repeater',
          'title'       => __( 'Repeater', 'onemeta' ),
          'description' => __( 'Repeatable field group with sub-fields', 'onemeta' ),
          'icon'        => 'fa-cubes',
          'badge'       => __( 'Advanced', 'onemeta' ),
          'docs_url'    => '#repeater-field'
      ],
  ];
?>

<div class="wrap onemeta-wrapper onemeta-page-wrapper onemeta-docs-page">

  <!-- Page Header -->
  <div class="onemeta-page-header">
    <div class="onemeta-page-header__content">
      <h1 class="onemeta-page-header__title">
        <?php esc_html_e( 'Documentation', 'onemeta' ); ?>
      </h1>
      <p class="onemeta-page-header__description">
        <?php esc_html_e( 'Learn how to use OneMeta field types, helper functions, and advanced features', 'onemeta' ); ?>
      </p>
    </div>
    <div class="onemeta-page-header__actions">
      <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta-new' ) ); ?>"
         class="onemeta-button onemeta-button--primary">
        <i class="fa-solid fa-plus"></i>
        <?php esc_html_e( 'Create Field Group', 'onemeta' ); ?>
      </a>
    </div>
  </div>

  <!-- Field Types Section -->
  <div class="onemeta-docs-section">
    <div class="onemeta-docs-section__header">
      <h2 class="onemeta-docs-section__title">
        <i class="fa-solid fa-table-list"></i>
        <?php esc_html_e( 'Available Field Types', 'onemeta' ); ?>
      </h2>
      <p class="onemeta-docs-section__description">
        <?php esc_html_e( '14 powerful field types to cover all your custom field needs', 'onemeta' ); ?>
      </p>
    </div>

    <div class="onemeta-field-types-grid">
      <?php foreach ( $field_types as $field_type ): ?>
        <a href="<?php echo esc_url( $field_type['docs_url'] ); ?>"
           class="onemeta-field-card"
           data-type="<?php echo esc_attr( $field_type['type'] ); ?>">
          <div class="onemeta-field-card__icon">
            <i class="fa-solid <?php echo esc_attr( $field_type['icon'] ); ?>"></i>
          </div>
          <h3 class="onemeta-field-card__title">
            <?php echo esc_html( $field_type['title'] ); ?>
          </h3>
          <p class="onemeta-field-card__description">
            <?php echo esc_html( $field_type['description'] ); ?>
          </p>
          <div class="onemeta-field-card__footer">
            <span class="onemeta-badge onemeta-field-type-badge onemeta-field-type-badge--<?php echo esc_attr( strtolower( $field_type['badge'] ) ); ?>">
              <?php echo esc_html( $field_type['badge'] ); ?>
            </span>
          </div>
        </a>
      <?php endforeach; ?>
    </div>
  </div>

  <!-- Export Section -->
  <div class="onemeta-docs-section">
    <div class="onemeta-card">
      <div class="onemeta-card__header">
        <h2 class="onemeta-card__title">
          <i class="fa-solid fa-download"></i>
          <?php esc_html_e( 'Export Field Groups', 'onemeta' ); ?>
        </h2>
      </div>
      <div class="onemeta-card__body">
        <p><?php esc_html_e( 'Export your field groups as PHP code that you can add to your theme or plugin.', 'onemeta' ); ?></p>
        <div id="export-list" class="onemeta-export-list">
          <!-- Will be populated by docs.js -->
          <div class="onemeta-loading">
            <i class="fa-solid fa-spinner onemeta-loading__spinner"></i>
            <p><?php esc_html_e( 'Loading field groups...', 'onemeta' ); ?></p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Helper Functions Section -->
  <div class="onemeta-docs-section">
    <div class="onemeta-card">
      <div class="onemeta-card__header">
        <h2 class="onemeta-card__title">
          <i class="fa-solid fa-laptop-code"></i>
          <?php esc_html_e( 'Helper Functions', 'onemeta' ); ?>
        </h2>
      </div>
      <div class="onemeta-card__body">
        <p><?php esc_html_e( 'Use these helper functions to easily work with OneMeta fields in your theme or plugin.', 'onemeta' ); ?></p>

        <!-- Post Meta Functions -->
        <div class="onemeta-code-example">
          <div class="onemeta-code-example__header">
            <span class="onemeta-code-example__label">Post/Page Meta Functions</span>
            <button class="onemeta-button onemeta-button--small onemeta-button--outline onemeta-copy-code"
                    data-target="post-meta-functions"
                    data-tooltip="Copy to clipboard"
                    data-tooltip-position="top">
              <i class="fa-solid fa-copy"></i>
              <?php esc_html_e( 'Copy', 'onemeta' ); ?>
            </button>
          </div>
          <pre class="onemeta-code-block" id="post-meta-functions"><code class="language-php">// Get post meta value
$value = onemeta_get_meta($post_id, 'field_key', 'default');

// Update post meta value
onemeta_update_meta($post_id, 'field_key', $value);

// Delete post meta value
onemeta_delete_meta($post_id, 'field_key');</code></pre>
        </div>

        <!-- User Meta Functions -->
        <div class="onemeta-code-example">
          <div class="onemeta-code-example__header">
            <span class="onemeta-code-example__label">User Meta Functions</span>
            <button class="onemeta-button onemeta-button--small onemeta-button--outline onemeta-copy-code"
                    data-target="user-meta-functions"
                    data-tooltip="Copy to clipboard"
                    data-tooltip-position="top">
              <i class="fa-solid fa-copy"></i>
              <?php esc_html_e( 'Copy', 'onemeta' ); ?>
            </button>
          </div>
          <pre class="onemeta-code-block" id="user-meta-functions"><code class="language-php">// Get user meta value
$value = onemeta_get_user_meta($user_id, 'field_key', 'default');

// Update user meta value
onemeta_update_user_meta($user_id, 'field_key', $value);

// Delete user meta value
onemeta_delete_user_meta($user_id, 'field_key');</code></pre>
        </div>

        <!-- Usage Examples -->
        <div class="onemeta-card onemeta-flex-column-gap">
          <div class="onemeta-info-box__header">
            <div class="onemeta-info-box__icon">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h4><?php esc_html_e( 'Real-World Usage Examples', 'onemeta' ); ?></h4>
          </div>
          <div class="onemeta-info-box__content">
            <div class="onemeta-code-example onemeta-border-light">
            <pre class="onemeta-code-block onemeta-code-block--light"><code class="language-php">// Example 1: Display custom title in single.php
$custom_title = onemeta_get_meta(get_the_ID(), 'custom_title');
if (!empty($custom_title)) {
    echo '&lt;h1&gt;' . esc_html($custom_title) . '&lt;/h1&gt;';
}

// Example 2: Display user bio in author.php
$user_id = get_queried_object_id();
$custom_bio = onemeta_get_user_meta($user_id, 'custom_bio');
if (!empty($custom_bio)) {
    echo '&lt;div class="author-bio"&gt;' . wp_kses_post($custom_bio) . '&lt;/div&gt;';
}

// Example 3: Working with repeater fields
$portfolios = onemeta_get_user_meta($user_id, 'portfolios');
if (is_array($portfolios) && !empty($portfolios)) {
    foreach ($portfolios as $portfolio) {
        echo '&lt;h3&gt;' . esc_html($portfolio['title']) . '&lt;/h3&gt;';
        echo '&lt;p&gt;' . esc_html($portfolio['description']) . '&lt;/p&gt;';
    }
}

// Example 4: Working with image fields
$image_id = onemeta_get_meta(get_the_ID(), 'featured_image');
if (!empty($image_id)) {
    echo wp_get_attachment_image($image_id, 'large');
}

// Example 5: Working with checkbox fields (returns array)
$skills = onemeta_get_user_meta($user_id, 'skills');
if (is_array($skills) && !empty($skills)) {
    echo '&lt;ul&gt;';
    foreach ($skills as $skill) {
        echo '&lt;li&gt;' . esc_html($skill) . '&lt;/li&gt;';
    }
    echo '&lt;/ul&gt;';
}

// Example 6: Working with toggle fields (returns '0' or '1')
$is_featured = onemeta_get_meta(get_the_ID(), 'is_featured');
if ($is_featured === '1') {
    echo '&lt;span class="badge"&gt;Featured&lt;/span&gt;';
}</code></pre>
            </div>
          </div>
        </div>

        <!-- Important Notes -->
        <div class="onemeta-info-box onemeta-info-box--info">
          <div class="onemeta-info-box__header">
            <div class="onemeta-info-box__icon">
              <i class="fa-solid fa-circle-info"></i>
            </div>
            <h4><?php esc_html_e( 'Important Notes', 'onemeta' ); ?></h4>
          </div>
          <div class="onemeta-info-box__content">
            <ul>
              <li>
                <strong><?php esc_html_e( 'Field Keys:', 'onemeta' ); ?></strong> <?php esc_html_e( 'Do not include the "onemeta_" prefix - it\'s added automatically', 'onemeta' ); ?>
              </li>
              <li>
                <strong><?php esc_html_e( 'Context Matters:', 'onemeta' ); ?></strong> <?php esc_html_e( 'Use onemeta_get_meta() for posts/pages and onemeta_get_user_meta() for users', 'onemeta' ); ?>
              </li>
              <li>
                <strong><?php esc_html_e( 'Security:', 'onemeta' ); ?></strong> <?php esc_html_e( 'Always sanitize and escape output values (esc_html, esc_url, wp_kses_post)', 'onemeta' ); ?>
              </li>
              <li>
                <strong><?php esc_html_e( 'Arrays:', 'onemeta' ); ?></strong> <?php esc_html_e( 'Repeater, gallery, and checkbox fields return arrays - use is_array() before looping', 'onemeta' ); ?>
              </li>
              <li>
                <strong><?php esc_html_e( 'Toggle Fields:', 'onemeta' ); ?></strong> <?php esc_html_e( 'Return string \'0\' or \'1\', not boolean - compare with === \'1\'', 'onemeta' ); ?>
              </li>
              <li>
                <strong><?php esc_html_e( 'Image/File Fields:', 'onemeta' ); ?></strong> <?php esc_html_e( 'Return attachment ID (integer) - use wp_get_attachment_image() or wp_get_attachment_url()', 'onemeta' ); ?>
              </li>
            </ul>
          </div>
        </div>

        <!-- Field Return Types Reference -->
        <div class="onemeta-card onemeta-flex-column-gap">
          <div class="onemeta-info-box__header">
            <div class="onemeta-info-box__icon">
              <i class="fa-solid fa-gear"></i>
            </div>
            <h4><?php esc_html_e( 'Field Return Types', 'onemeta' ); ?></h4>
          </div>
          <div class="onemeta-info-box__content">
            <table class="onemeta-table onemeta-table--compact">
              <thead>
              <tr>
                <th><?php esc_html_e( 'Field Type', 'onemeta' ); ?></th>
                <th><?php esc_html_e( 'Return Type', 'onemeta' ); ?></th>
                <th><?php esc_html_e( 'Example', 'onemeta' ); ?></th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>Text, Textarea, URL, Email, Date</td>
                <td>String</td>
                <td><code>"Hello World"</code></td>
              </tr>
              <tr>
                <td>Toggle</td>
                <td>String</td>
                <td><code>"0"</code> or <code>"1"</code></td>
              </tr>
              <tr>
                <td>Select, Radio, Button Group</td>
                <td>String</td>
                <td><code>"option_value"</code></td>
              </tr>
              <tr>
                <td>Checkbox</td>
                <td>Array</td>
                <td><code>["value1", "value2"]</code></td>
              </tr>
              <tr>
                <td>Image, File</td>
                <td>Integer</td>
                <td><code>123</code> (attachment ID)</td>
              </tr>
              <tr>
                <td>Gallery</td>
                <td>Array</td>
                <td><code>[123, 456, 789]</code> (attachment IDs)</td>
              </tr>
              <tr>
                <td>Repeater</td>
                <td>Array</td>
                <td><code>[["title" => "Item 1"], ["title" => "Item 2"]]</code></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Conditional Logic Section -->
  <div class="onemeta-docs-section">
    <div class="onemeta-card">
      <div class="onemeta-card__header">
        <h2 class="onemeta-card__title">
          <i class="fa-solid fa-clipboard-check"></i>
          <?php esc_html_e( 'Conditional Logic', 'onemeta' ); ?>
        </h2>
      </div>
      <div class="onemeta-card__body">
        <p><?php esc_html_e( 'Show or hide fields based on the value of other fields using conditional logic.', 'onemeta' ); ?></p>

        <div class="onemeta-code-example">
          <div class="onemeta-code-example__header">
            <span class="onemeta-code-example__label">PHP</span>
            <button class="onemeta-button onemeta-button--small onemeta-button--outline onemeta-copy-code"
                    data-target="conditional-logic"
                    data-tooltip="Copy to clipboard"
                    data-tooltip-position="top">
              <i class="fa-solid fa-copy"></i>
              <?php esc_html_e( 'Copy', 'onemeta' ); ?>
            </button>
          </div>
          <pre class="onemeta-code-block" id="conditional-logic"><code class="language-php">'my_field' => [
    'type'  => 'text',
    'label' => 'My Text',
    'description' => 'Text description',
    'placeholder' => 'Text placeholder',
    'default' => 'My default text',
    'conditional' => [
        'relation' => 'AND', // 'AND', 'OR'
        'rules'    => [
            [
                'field'    => 'my_other_field',
                'operator' => '!=',
                'value'    => '',
            ],
        ],
    ],
],</code></pre>
        </div>

        <div class="onemeta-info-box onemeta-info-box--info">
          <div class="onemeta-info-box__header">
            <div class="onemeta-info-box__icon">
              <i class="fa-solid fa-circle-info"></i>
            </div>
            <h4><?php esc_html_e( 'Conditional Logic Operators', 'onemeta' ); ?></h4>
          </div>
          <div class="onemeta-info-box__content">
            <table class="operator-table">
              <tr>
                <td><code>==</code></td>
                <td><?php esc_html_e( 'Equal to', 'onemeta' ); ?></td>
              </tr>
              <tr>
                <td><code>!=</code></td>
                <td><?php esc_html_e( 'Not equal to', 'onemeta' ); ?></td>
              </tr>
              <tr>
                <td><code>contains</code></td>
                <td><?php esc_html_e( 'Contains text', 'onemeta' ); ?></td>
              </tr>
              <tr>
                <td><code>!contains</code></td>
                <td><?php esc_html_e( 'Does not contain text', 'onemeta' ); ?></td>
              </tr>
            </table>
            <p><small><?php esc_html_e( 'Note: "contains" operators are case-insensitive.', 'onemeta' ); ?></small></p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Start Section -->
  <div class="onemeta-docs-section">
    <div class="onemeta-card onemeta-card--highlighted">
      <div class="onemeta-card__header">
        <h2 class="onemeta-card__title">
          <i class="fa-solid fa-lightbulb"></i>
          <?php esc_html_e( 'Quick Start Guide', 'onemeta' ); ?>
        </h2>
      </div>
      <div class="onemeta-card__body">
        <ol class="onemeta-steps-list">
          <li class="onemeta-step">
            <div class="onemeta-step__number">1</div>
            <div class="onemeta-step__content">
              <h4><?php esc_html_e( 'Create a Field Group', 'onemeta' ); ?></h4>
              <p><?php esc_html_e( 'Go to OneMeta → Add New and create your first field group', 'onemeta' ); ?></p>
            </div>
          </li>
          <li class="onemeta-step">
            <div class="onemeta-step__number">2</div>
            <div class="onemeta-step__content">
              <h4><?php esc_html_e( 'Add Fields', 'onemeta' ); ?></h4>
              <p><?php esc_html_e( 'Click "Add Field" and choose from 14 different field types', 'onemeta' ); ?></p>
            </div>
          </li>
          <li class="onemeta-step">
            <div class="onemeta-step__number">3</div>
            <div class="onemeta-step__content">
              <h4><?php esc_html_e( 'Configure Settings', 'onemeta' ); ?></h4>
              <p><?php esc_html_e( 'Set field labels, descriptions, and advanced options', 'onemeta' ); ?></p>
            </div>
          </li>
          <li class="onemeta-step">
            <div class="onemeta-step__number">4</div>
            <div class="onemeta-step__content">
              <h4><?php esc_html_e( 'Use in Your Theme', 'onemeta' ); ?></h4>
              <p><?php esc_html_e( 'Access field values using onemeta_get_meta() function', 'onemeta' ); ?></p>
            </div>
          </li>
        </ol>

        <div class="onemeta-quick-start-actions">
          <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta-new' ) ); ?>"
             class="onemeta-button onemeta-button--primary onemeta-button--large">
            <i class="fa-solid fa-plus"></i>
            <?php esc_html_e( 'Create Your First Field Group', 'onemeta' ); ?>
          </a>
        </div>
      </div>
    </div>
  </div>

</div>