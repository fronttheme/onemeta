<?php
  /**
   * OneMeta Builder View
   *
   * @package OneMeta
   */

  if ( ! defined( 'ABSPATH' ) ) {
    exit;
  }

  // Get field group if editing
  $group_id         = isset( $_GET['id'] ) ? sanitize_text_field( $_GET['id'] ) : '';
  $field_group_data = \OneMeta\Admin\FieldGroupEditor::get_field_group_for_edit( $group_id );
  $editing          = $field_group_data['editing'];
  $field_group      = $field_group_data['field_group'];

  // Get post types
  $post_types = get_post_types( [
      'public'  => true,
      'show_ui' => true,
  ], 'objects' );

  // Remove attachment
  unset( $post_types['attachment'] );

  // Get selected
  $selected = $editing && isset( $field_group['post_type'] ) ? $field_group['post_type'] : 'post';
?>

<div class="wrap onemeta-wrapper onemeta-page-wrapper onemeta-builder-page">

  <!-- Page Header -->
  <div class="onemeta-page-header">
    <div class="onemeta-page-header__content">
      <h1 class="onemeta-page-header__title">
        <?php echo $editing ? esc_html__( 'Edit Field Group', 'onemeta' ) : esc_html__( 'Add New Field Group', 'onemeta' ); ?>
      </h1>
      <p class="onemeta-page-header__description">
        <?php echo $editing
            ? esc_html__( 'Modify your field group configuration', 'onemeta' )
            : esc_html__( 'Create a new custom field group', 'onemeta' ); ?>
      </p>
    </div>
    <div class="onemeta-page-header__actions">
      <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta' ) ); ?>"
         class="onemeta-button onemeta-button--secondary">
        <i class="fa-solid fa-chevron-left"></i>
        <?php esc_html_e( 'Back to Field Groups', 'onemeta' ); ?>
      </a>
    </div>
  </div>

  <div class="onemeta-builder onemeta-builder-container">

    <!-- Left Column: Builder Form -->
    <div class="onemeta-builder__form-column">
      <form id="onemeta-builder-form" class="onemeta-builder-form" method="post">

        <!-- Basic Settings Card -->
        <div class="onemeta-panel onemeta-card onemeta-settings-card">
          <div class="onemeta-card__header">
            <h2 class="onemeta-card__title">
              <i class="fa-solid fa-gear"></i>
              <?php esc_html_e( 'Basic Settings', 'onemeta' ); ?>
            </h2>
          </div>

          <div class="onemeta-card__body">
            <table class="form-table onemeta-form-table">
              <tr class="onemeta-form-row">
                <th class="onemeta-form-label">
                  <label for="group_key"><?php esc_html_e( 'Field Group Key', 'onemeta' ); ?>
                    <span class="onemeta-required">*</span>
                  </label>
                </th>
                <td class="onemeta-form-field">
                  <input
                      type="text"
                      id="group_key"
                      name="group_key"
                      class="regular-text onemeta-input"
                      value="<?php echo $editing ? esc_attr( $field_group['group_key'] ) : ''; ?>"
                      <?php echo $editing ? 'readonly' : ''; ?>
                      required
                      pattern="[a-z0-9_]+"
                      placeholder="my_field_group"
                  >
                  <p class="onemeta-field-description">
                    <?php esc_html_e( 'Unique identifier (lowercase, underscores only)', 'onemeta' ); ?>
                  </p>
                  <?php if ( $editing ): ?>
                    <p class="onemeta-field-note">
                      <i class="fa-solid fa-lock"></i>
                      <?php esc_html_e( 'Field group key cannot be changed after creation', 'onemeta' ); ?>
                    </p>
                  <?php endif; ?>
                </td>
              </tr>

              <tr class="onemeta-form-row">
                <th class="onemeta-form-label">
                  <label for="group_title"><?php esc_html_e( 'Title', 'onemeta' ); ?>
                    <span class="onemeta-required">*</span>
                  </label>
                </th>
                <td class="onemeta-form-field">
                  <input
                      type="text"
                      id="group_title"
                      name="group_title"
                      class="regular-text onemeta-input"
                      value="<?php echo $editing ? esc_attr( $field_group['title'] ) : ''; ?>"
                      required
                      placeholder="My Custom Fields"
                  >
                  <p class="description onemeta-field-description">
                    <?php esc_html_e( 'Display name for this field group', 'onemeta' ); ?>
                  </p>
                </td>
              </tr>

              <tr class="onemeta-form-row">
                <th class="onemeta-form-label">
                  <label for="group_type"><?php esc_html_e( 'Type', 'onemeta' ); ?></label>
                </th>
                <td class="onemeta-form-field">
                  <select id="group_type" name="group_type" class="onemeta-select" required>
                    <option value="post" <?php echo ( $editing && $field_group['type'] === 'post' ) ? 'selected' : ''; ?>>
                      <?php esc_html_e( 'Post/Page Meta', 'onemeta' ); ?>
                    </option>
                    <option value="user" <?php echo ( $editing && $field_group['type'] === 'user' ) ? 'selected' : ''; ?>>
                      <?php esc_html_e( 'User Meta', 'onemeta' ); ?>
                    </option>
                  </select>
                </td>
              </tr>

              <tr class="post-type-row onemeta-form-row onemeta-conditional-row">
                <th class="onemeta-form-label">
                  <label for="post_type"><?php esc_html_e( 'Post Type', 'onemeta' ); ?></label>
                </th>
                <td class="onemeta-form-field">
                  <select id="post_type" name="post_type" class="onemeta-select">
                    <?php foreach ( $post_types as $post_type ): ?>
                      <option value="<?php echo esc_attr( $post_type->name ); ?>"
                          <?php selected( $selected, $post_type->name ); ?>>
                        <?php echo esc_html( $post_type->labels->singular_name ); ?>
                      </option>
                    <?php endforeach; ?>
                  </select>
                </td>
              </tr>

              <tr class="post-type-row onemeta-form-row onemeta-conditional-row">
                <th class="onemeta-form-label">
                  <label for="position"><?php esc_html_e( 'Position', 'onemeta' ); ?></label>
                </th>
                <td class="onemeta-form-field">
                  <select id="position" name="position" class="onemeta-select">
                    <option value="normal" <?php echo ( $editing && isset( $field_group['position'] ) && $field_group['position'] === 'normal' ) ? 'selected' : ''; ?>>
                      <?php esc_html_e( 'Normal', 'onemeta' ); ?>
                    </option>
                    <option value="side" <?php echo ( $editing && isset( $field_group['position'] ) && $field_group['position'] === 'side' ) ? 'selected' : ''; ?>>
                      <?php esc_html_e( 'Side', 'onemeta' ); ?>
                    </option>
                  </select>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Fields Card -->
        <div class="onemeta-panel onemeta-card onemeta-fields-card">
          <div class="onemeta-card__header">
            <h2 class="onemeta-card__title">
              <i class="fa-solid fa-table-list"></i>
              <?php esc_html_e( 'Fields', 'onemeta' ); ?>
              <span class="onemeta-badge onemeta-badge--primary onemeta-field-count">
                <?php echo $editing && ! empty( $field_group['fields'] ) ? count( $field_group['fields'] ) : '0'; ?>
              </span>
            </h2>
            <button type="button" class="onemeta-button onemeta-button--secondary onemeta-button--small" id="add-field-btn">
              <i class="fa-solid fa-plus"></i>
              <?php esc_html_e( 'Add Field', 'onemeta' ); ?>
            </button>
          </div>

          <div class="onemeta-card__body onemeta-card__body--no-padding">
            <div id="onemeta-fields-container" class="onemeta-fields-container">

              <!-- Empty State -->
              <div class="onemeta-fields-empty-state" style="<?php echo ( $editing && ! empty( $field_group['fields'] ) ) ? 'display: none;' : 'display: flex;'; ?>">
                <div class="onemeta-fields-empty-state__icon onemeta-empty-field__add-icon">
                  <i class="fa-solid fa-plus"></i>
                </div>
                <h3 class="onemeta-fields-empty-state__title">
                  <?php esc_html_e( 'No Fields Yet', 'onemeta' ); ?>
                </h3>
                <p class="onemeta-fields-empty-state__description">
                  <?php esc_html_e( 'Drag a field type from the sidebar or click "Add Field" to create your first custom field', 'onemeta' ); ?>
                </p>
              </div>

              <!-- Existing Fields -->
              <?php if ( $editing && ! empty( $field_group['fields'] ) ): ?>
                <?php $field_index = 0; ?>
                <?php foreach ( $field_group['fields'] as $field_key => $field ): ?>
                  <div class="onemeta-field onemeta-field__item" data-index="<?php echo $field_index; ?>">
                    <div class="field-header onemeta-field__header">
                      <button type="button" class="onemeta-button onemeta-button--icon onemeta-button--liquid onemeta-button--danger onemeta-field-remove" title="<?php esc_attr_e( 'Remove Field', 'onemeta' ); ?>">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                      <div class="onemeta-field-key-label-type">
                        <div class="onemeta-field-key-wrapper">
                          <i class="fa-solid fa-key field-handle onemeta-field__handle"></i>
                          <input type="text" class="onemeta-field-key onemeta-input onemeta-input--inline" value="<?php echo esc_attr( $field_key ); ?>" placeholder="field_key" required pattern="[a-z0-9_]+">
                        </div>
                        <input type="text" class="onemeta-field-label onemeta-input onemeta-input--inline" value="<?php echo esc_attr( $field['label'] ); ?>" placeholder="Field Label" required>
                        <select class="field-type-select onemeta-select onemeta-field-type" required>
                          <option value="text" <?php selected( $field['type'], 'text' ); ?>><?php esc_html_e( 'Text', 'onemeta' ); ?></option>
                          <option value="textarea" <?php selected( $field['type'], 'textarea' ); ?>><?php esc_html_e( 'Textarea', 'onemeta' ); ?></option>
                          <option value="url" <?php selected( $field['type'], 'url' ); ?>><?php esc_html_e( 'URL', 'onemeta' ); ?></option>
                          <option value="email" <?php selected( $field['type'], 'email' ); ?>><?php esc_html_e( 'Email', 'onemeta' ); ?></option>
                          <option value="date" <?php selected( $field['type'], 'date' ); ?>><?php esc_html_e( 'Date', 'onemeta' ); ?></option>
                          <option value="toggle" <?php selected( $field['type'], 'toggle' ); ?>><?php esc_html_e( 'Toggle', 'onemeta' ); ?></option>
                          <option value="select" <?php selected( $field['type'], 'select' ); ?>><?php esc_html_e( 'Select', 'onemeta' ); ?></option>
                          <option value="checkbox" <?php selected( $field['type'], 'checkbox' ); ?>><?php esc_html_e( 'Checkbox', 'onemeta' ); ?></option>
                          <option value="radio" <?php selected( $field['type'], 'radio' ); ?>><?php esc_html_e( 'Radio', 'onemeta' ); ?></option>
                          <option value="button_group" <?php selected( $field['type'], 'button_group' ); ?>><?php esc_html_e( 'Button Group', 'onemeta' ); ?></option>
                          <option value="image" <?php selected( $field['type'], 'image' ); ?>><?php esc_html_e( 'Image', 'onemeta' ); ?></option>
                          <option value="file" <?php selected( $field['type'], 'file' ); ?>><?php esc_html_e( 'File', 'onemeta' ); ?></option>
                          <option value="gallery" <?php selected( $field['type'], 'gallery' ); ?>><?php esc_html_e( 'Gallery', 'onemeta' ); ?></option>
                          <option value="repeater" <?php selected( $field['type'], 'repeater' ); ?>><?php esc_html_e( 'Repeater', 'onemeta' ); ?></option>
                          <option value="heading" <?php selected( $field['type'], 'heading' ); ?>><?php esc_html_e( 'Heading', 'onemeta' ); ?></option>
                        </select>
                      </div>
                    </div>

                    <div class="field-settings onemeta-field__settings onemeta-field-settings">
                      <div class="onemeta-field-settings__row">
                        <label class="onemeta-setting onemeta-field-setting">
                          <span class="onemeta-setting__label"><?php esc_html_e( 'Description', 'onemeta' ); ?>:</span>
                          <input type="text" class="onemeta-input onemeta-field-description" value="<?php echo isset( $field['description'] ) ? esc_attr( $field['description'] ) : ''; ?>" placeholder="<?php esc_attr_e( 'Optional description', 'onemeta' ); ?>">
                        </label>
                        <label class="onemeta-setting onemeta-field-setting onemeta-placeholder-setting" style="<?php echo ! in_array( $field['type'], [
                            'text',
                            'textarea',
                            'url',
                            'email'
                        ] ) ? 'display: none;' : ''; ?>">
                          <span class="onemeta-setting__label"><?php esc_html_e( 'Placeholder', 'onemeta' ); ?>:</span>
                          <input type="text" class="onemeta-input onemeta-field-placeholder" value="<?php echo isset( $field['placeholder'] ) ? esc_attr( $field['placeholder'] ) : ''; ?>" placeholder="<?php esc_attr_e( 'Optional placeholder', 'onemeta' ); ?>">
                        </label>
                      </div>
                    </div>

                    <!-- Dynamic Advanced Settings -->
                    <div class="onemeta-field-advanced-settings" data-field-index="<?php echo $field_index; ?>">
                      <!-- Settings rendered by JavaScript based on field type -->
                    </div>
                  </div>
                  <?php $field_index ++; ?>
                <?php endforeach; ?>
              <?php endif; ?>
            </div>
          </div>

          <div class="onemeta-card__footer">
            <button type="button" class="onemeta-button onemeta-button--secondary" id="add-field-btn-bottom">
              <i class="fa-solid fa-plus"></i>
              <?php esc_html_e( 'Add Field', 'onemeta' ); ?>
            </button>
          </div>
        </div>

        <!-- Actions Card -->
        <div class="onemeta-panel onemeta-card onemeta-actions-card">
          <div class="onemeta-card__body">
            <div class="onemeta-actions onemeta-button-group onemeta-btn-group-ui">
              <button type="submit" name="action" value="save" class="onemeta-button onemeta-button--primary onemeta-button--large">
                <i class="fa-solid fa-circle-check"></i>
                <?php esc_html_e( 'Save Field Group', 'onemeta' ); ?>
              </button>
              <button type="button" id="export-php-btn" class="onemeta-button onemeta-button--secondary onemeta-button--large">
                <i class="fa-solid fa-download"></i>
                <?php esc_html_e( 'Export PHP', 'onemeta' ); ?>
              </button>
              <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta' ) ); ?>" class="onemeta-button onemeta-button--ghost onemeta-button--large">
                <?php esc_html_e( 'Cancel', 'onemeta' ); ?>
              </a>
            </div>
          </div>
        </div>

        <?php wp_nonce_field( 'onemeta_builder_save', 'onemeta_builder_nonce' ); ?>
      </form>
    </div>

    <!-- Right Column: Code Live Preview -->
    <div class="onemeta-builder__preview-column onemeta-live-preview">
      <div class="onemeta-card onemeta-preview-card onemeta-sticky">
        <div class="onemeta-card__header">
          <h3 class="onemeta-card__title">
            <i class="fa-solid fa-laptop-code"></i>
            <?php esc_html_e( 'PHP Code Preview', 'onemeta' ); ?>
          </h3>
          <button type="button" class="onemeta-button onemeta-button--small onemeta-button--outline" id="copy-code-btn">
            <i class="fa-solid fa-copy"></i>
            <?php esc_html_e( 'Copy', 'onemeta' ); ?>
          </button>
        </div>
        <div class="onemeta-card__body onemeta-card__body--no-padding">
          <pre id="php-preview" class="onemeta-code-preview"><code class="onemeta-code"><?php esc_html_e( 'Add fields to see generated code...', 'onemeta' ); ?></code></pre>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- Field Template -->
<script type="text/template" id="field-template">
  <div class="onemeta-field onemeta-field__item" data-index="FIELDINDEX">
    <div class="field-header onemeta-field__header">
      <button type="button" class="onemeta-button onemeta-button--icon onemeta-button--danger onemeta-button--liquid onemeta-field-remove" title="<?php esc_attr_e( 'Remove Field', 'onemeta' ); ?>">
        <i class="fa-solid fa-trash-can"></i>
      </button>
      <div class="onemeta-field-key-label-type">
        <div class="onemeta-field-key-wrapper">
          <i class="fa-solid fa-key field-handle onemeta-field__handle"></i>
          <input type="text" class="onemeta-field-key onemeta-input onemeta-input--inline" value="FIELDKEY" placeholder="field_key" required pattern="[a-z0-9_]+">
        </div>
        <input type="text" class="onemeta-field-label onemeta-input onemeta-input--inline" value="" placeholder="<?php esc_attr_e( 'Field Label', 'onemeta' ); ?>" required>
        <select class="field-type-select onemeta-select onemeta-field-type" required>
          <option value="text"><?php esc_html_e( 'Text', 'onemeta' ); ?></option>
          <option value="textarea"><?php esc_html_e( 'Textarea', 'onemeta' ); ?></option>
          <option value="url"><?php esc_html_e( 'URL', 'onemeta' ); ?></option>
          <option value="email"><?php esc_html_e( 'Email', 'onemeta' ); ?></option>
          <option value="date"><?php esc_html_e( 'Date', 'onemeta' ); ?></option>
          <option value="toggle"><?php esc_html_e( 'Toggle', 'onemeta' ); ?></option>
          <option value="select"><?php esc_html_e( 'Select', 'onemeta' ); ?></option>
          <option value="checkbox"><?php esc_html_e( 'Checkbox', 'onemeta' ); ?></option>
          <option value="radio"><?php esc_html_e( 'Radio', 'onemeta' ); ?></option>
          <option value="button_group"><?php esc_html_e( 'Button Group', 'onemeta' ); ?></option>
          <option value="image"><?php esc_html_e( 'Image', 'onemeta' ); ?></option>
          <option value="file"><?php esc_html_e( 'File', 'onemeta' ); ?></option>
          <option value="gallery"><?php esc_html_e( 'Gallery', 'onemeta' ); ?></option>
          <option value="repeater"><?php esc_html_e( 'Repeater', 'onemeta' ); ?></option>
          <option value="heading"><?php esc_html_e( 'Heading', 'onemeta' ); ?></option>
        </select>
      </div>
    </div>

    <div class="field-settings onemeta-field__settings onemeta-field-settings">
      <div class="onemeta-field-settings__row">
        <label class="onemeta-setting onemeta-field-setting">
          <span class="onemeta-setting__label"><?php esc_html_e( 'Description', 'onemeta' ); ?>:</span>
          <input type="text" class="onemeta-input onemeta-field-description" value="" placeholder="<?php esc_attr_e( 'Optional description', 'onemeta' ); ?>">
        </label>
        <label class="onemeta-setting onemeta-field-setting onemeta-placeholder-setting">
          <span class="onemeta-setting__label"><?php esc_html_e( 'Placeholder', 'onemeta' ); ?>:</span>
          <input type="text" class="onemeta-input onemeta-field-placeholder" value="" placeholder="<?php esc_attr_e( 'Optional placeholder', 'onemeta' ); ?>">
        </label>
      </div>
    </div>

    <!-- Dynamic Advanced Settings -->
    <div class="onemeta-field-advanced-settings" data-field-index="FIELDINDEX">
      <!-- Settings rendered by JavaScript based on field type -->
    </div>
  </div>
</script>
