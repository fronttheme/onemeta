<?php
  /**
   * OneMeta Plugin
   * About OneMeta plugin
   *
   * @package OneMeta
   */

  if ( ! defined( 'ABSPATH' ) ) {
    exit;
  }

  global $wpdb;

  $table_name    = $wpdb->prefix . 'onemeta_field_groups';
  $total_groups  = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
  $active_groups = $wpdb->get_var(
      $wpdb->prepare(
          "SELECT COUNT(*) FROM $table_name WHERE status = %s",
          'active'
      )
  );
?>

<div class="wrap onemeta-wrapper onemeta-page-wrapper onemeta-about-page">

  <!-- Page Header -->
  <div class="onemeta-page-header onemeta-page-header--hero">
    <div class="onemeta-page-header__content">
      <div class="onemeta-about-logo">
        <img src="<?php echo esc_url( ONEMETA_PLUGIN_URL . 'assets/images/logo/onemeta-logo.svg' ); ?>"
             alt="<?php esc_attr_e( 'OneMeta Logo', 'onemeta' ); ?>">
        <div class="onemeta-page-header__version">
        <span class="onemeta-badge onemeta-badge--primary">
          v<?php echo esc_html( ONEMETA_VERSION ); ?>
        </span>
        </div>
      </div>
    </div>
    <div class="onemeta-about-text">
      <p class="onemeta-page-header__subtitle">
        <?php esc_html_e( 'Custom Meta Fields Made Simple', 'onemeta' ); ?>
      </p>
      <p class="onemeta-page-header__description">
        <?php esc_html_e( 'Build powerful custom fields with a visual builder. Export as PHP code or use directly in WordPress.', 'onemeta' ); ?>
      </p>
    </div>
  </div>

  <!-- Body -->
  <div class="onemeta-page-body">

    <!-- Main Content Grid -->
    <div class="onemeta-about-grid">

      <!-- Features Card -->
      <div class="onemeta-card onemeta-about-card">
        <div class="onemeta-card__header">
          <h2 class="onemeta-card__title">
            <i class="fa-solid fa-ranking-star"></i>
            <?php esc_html_e( 'Features', 'onemeta' ); ?>
          </h2>
        </div>
        <div class="onemeta-card__body">
          <div class="onemeta-features-grid">
            <div class="onemeta-feature">
              <div class="onemeta-feature__icon">
                <i class="fa-solid fa-table-list"></i>
              </div>
              <div class="onemeta-feature__content">
                <h3 class="onemeta-feature__title"><?php esc_html_e( '14 Field Types', 'onemeta' ); ?></h3>
                <p class="onemeta-feature__description">
                  <?php esc_html_e( 'Text, Textarea, URL, Email, Date, Toggle, Select, Checkbox, Radio, Button Group, Image, File, Gallery, Repeater', 'onemeta' ); ?>
                </p>
              </div>
            </div>

            <div class="onemeta-feature">
              <div class="onemeta-feature__icon">
                <i class="fa-solid fa-shuffle"></i>
              </div>
              <div class="onemeta-feature__content">
                <h3 class="onemeta-feature__title"><?php esc_html_e( 'Conditional Logic', 'onemeta' ); ?></h3>
                <p class="onemeta-feature__description">
                  <?php esc_html_e( 'Show/hide fields based on other field values', 'onemeta' ); ?>
                </p>
              </div>
            </div>

            <div class="onemeta-feature">
              <div class="onemeta-feature__icon">
                <i class="fa-solid fa-cubes"></i>
              </div>
              <div class="onemeta-feature__content">
                <h3 class="onemeta-feature__title"><?php esc_html_e( 'Repeater Fields', 'onemeta' ); ?></h3>
                <p class="onemeta-feature__description">
                  <?php esc_html_e( 'Create repeatable field groups with sub-fields', 'onemeta' ); ?>
                </p>
              </div>
            </div>

            <div class="onemeta-feature">
              <div class="onemeta-feature__icon">
                <i class="fa-solid fa-user"></i>
              </div>
              <div class="onemeta-feature__content">
                <h3 class="onemeta-feature__title"><?php esc_html_e( 'User Meta Support', 'onemeta' ); ?></h3>
                <p class="onemeta-feature__description">
                  <?php esc_html_e( 'Add custom fields to user profiles', 'onemeta' ); ?>
                </p>
              </div>
            </div>

            <div class="onemeta-feature">
              <div class="onemeta-feature__icon">
                <i class="fa-solid fa-laptop-code"></i>
              </div>
              <div class="onemeta-feature__content">
                <h3 class="onemeta-feature__title"><?php esc_html_e( 'Export as PHP', 'onemeta' ); ?></h3>
                <p class="onemeta-feature__description">
                  <?php esc_html_e( 'Export field groups as clean PHP config code', 'onemeta' ); ?>
                </p>
              </div>
            </div>

            <div class="onemeta-feature">
              <div class="onemeta-feature__icon">
                <i class="fa-solid fa-chart-diagram"></i>
              </div>
              <div class="onemeta-feature__content">
                <h3 class="onemeta-feature__title"><?php esc_html_e( 'REST API', 'onemeta' ); ?></h3>
                <p class="onemeta-feature__description">
                  <?php esc_html_e( 'Full REST API support for modern integrations', 'onemeta' ); ?>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Info Card -->
      <div class="onemeta-card onemeta-about-card">
        <div class="onemeta-card__header">
          <h2 class="onemeta-card__title">
            <i class="fa-solid fa-screwdriver-wrench"></i>
            <?php esc_html_e( 'System Information', 'onemeta' ); ?>
          </h2>
        </div>
        <div class="onemeta-card__body">
          <div class="onemeta-info-list">
            <div class="onemeta-info-item">
              <span class="onemeta-info-item__label"><?php esc_html_e( 'Version', 'onemeta' ); ?></span>
              <span class="onemeta-info-item__value">
              <span class="onemeta-badge onemeta-badge--primary">
                v<?php echo esc_html( ONEMETA_VERSION ); ?>
              </span>
            </span>
            </div>

            <div class="onemeta-info-item">
              <span class="onemeta-info-item__label"><?php esc_html_e( 'Author', 'onemeta' ); ?></span>
              <span class="onemeta-info-item__value">
              <a href="https://www.farukdesign.com/" target="_blank" rel="noopener">Faruk Ahmed</a>
            </span>
            </div>

            <div class="onemeta-info-item">
              <span class="onemeta-info-item__label"><?php esc_html_e( 'Organization', 'onemeta' ); ?></span>
              <span class="onemeta-info-item__value">
              <a href="https://www.fronttheme.com/" target="_blank" rel="noopener">fronttheme</a>
            </span>
            </div>

            <div class="onemeta-info-item">
              <span class="onemeta-info-item__label"><?php esc_html_e( 'Plugin Directory', 'onemeta' ); ?></span>
              <span class="onemeta-info-item__value">
              <code class="onemeta-code-inline"><?php echo esc_html( ONEMETA_PLUGIN_DIR ); ?></code>
            </span>
            </div>

            <div class="onemeta-info-item">
              <span class="onemeta-info-item__label"><?php esc_html_e( 'Database Table', 'onemeta' ); ?></span>
              <span class="onemeta-info-item__value">
              <code class="onemeta-code-inline"><?php echo esc_html( $table_name ); ?></code>
            </span>
            </div>

            <div class="onemeta-info-item">
              <span class="onemeta-info-item__label"><?php esc_html_e( 'PHP Version', 'onemeta' ); ?></span>
              <span class="onemeta-info-item__value">
              <span class="onemeta-badge onemeta-badge--primary">
                <?php echo esc_html( PHP_VERSION ); ?>
              </span>
            </span>
            </div>

            <div class="onemeta-info-item">
              <span class="onemeta-info-item__label"><?php esc_html_e( 'WordPress Version', 'onemeta' ); ?></span>
              <span class="onemeta-info-item__value">
              <span class="onemeta-badge onemeta-badge--primary">
                <?php echo esc_html( get_bloginfo( 'version' ) ); ?>
              </span>
            </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links Card -->
      <div class="onemeta-card onemeta-about-card">
        <div class="onemeta-card__header">
          <h2 class="onemeta-card__title">
            <i class="fa-solid fa-link"></i>
            <?php esc_html_e( 'Quick Links', 'onemeta' ); ?>
          </h2>
        </div>
        <div class="onemeta-card__body">
          <div class="onemeta-quick-links">
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta' ) ); ?>" class="onemeta-quick-link">
            <span class="onemeta-quick-link__icon">
              <i class="fa-solid fa-table-list"></i>
            </span>
              <span class="onemeta-quick-link__text">
              <strong><?php esc_html_e( 'Field Groups', 'onemeta' ); ?></strong>
              <small><?php esc_html_e( 'Manage your field groups', 'onemeta' ); ?></small>
            </span>
              <i class="fa-solid fa-chevron-right"></i>
            </a>

            <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta-new' ) ); ?>" class="onemeta-quick-link">
            <span class="onemeta-quick-link__icon">
              <i class="fa-solid fa-circle-plus"></i>
            </span>
              <span class="onemeta-quick-link__text">
              <strong><?php esc_html_e( 'Add New', 'onemeta' ); ?></strong>
              <small><?php esc_html_e( 'Create a new field group', 'onemeta' ); ?></small>
            </span>
              <i class="fa-solid fa-chevron-right"></i>
            </a>

            <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta-docs' ) ); ?>" class="onemeta-quick-link">
            <span class="onemeta-quick-link__icon">
              <i class="fa-solid fa-book"></i>
            </span>
              <span class="onemeta-quick-link__text">
              <strong><?php esc_html_e( 'Documentation', 'onemeta' ); ?></strong>
              <small><?php esc_html_e( 'Learn how to use OneMeta', 'onemeta' ); ?></small>
            </span>
              <i class="fa-solid fa-chevron-right"></i>
            </a>

            <a href="https://github.com/fronttheme/onemeta" target="_blank" rel="noopener" class="onemeta-quick-link">
            <span class="onemeta-quick-link__icon">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </span>
              <span class="onemeta-quick-link__text">
              <strong><?php esc_html_e( 'GitHub Repository', 'onemeta' ); ?></strong>
              <small><?php esc_html_e( 'View source code', 'onemeta' ); ?></small>
            </span>
              <i class="fa-solid fa-chevron-right"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- Support Card -->
      <div class="onemeta-card onemeta-about-card">
        <div class="onemeta-card__header">
          <h2 class="onemeta-card__title">
            <i class="fa-solid fa-life-ring"></i>
            <?php esc_html_e( 'Need Help?', 'onemeta' ); ?>
          </h2>
        </div>
        <div class="onemeta-card__body">
          <p><?php esc_html_e( 'Get support, report bugs, or request features:', 'onemeta' ); ?></p>
          <div class="onemeta-button-group">
            <a href="https://github.com/fronttheme/onemeta/issues" target="_blank" rel="noopener" class="onemeta-button onemeta-button--primary">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              <?php esc_html_e( 'GitHub Issues', 'onemeta' ); ?>
            </a>
            <a href="mailto:hellofronttheme@gmail.com" class="onemeta-button onemeta-button--secondary">
              <i class="fa-solid fa-paper-plane"></i>
              <?php esc_html_e( 'Email Support', 'onemeta' ); ?>
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Footer -->
  <div class="onemeta-about-footer onemeta-page-footer">
    <p>
      <?php
        printf(
        /* translators: %1$s: heart icon, %2$s: company link */
            esc_html__( 'Made with %1$s by %2$s', 'onemeta' ),
            '<i class="fa-solid fa-heart" style="color: #ff00ac; font-size: 16px; vertical-align: text-bottom; margin: 0 3px;"></i>',
            '<a href="https://www.fronttheme.com/" target="_blank" rel="noopener">fronttheme</a>'
        );
      ?>
    </p>
  </div>

</div>