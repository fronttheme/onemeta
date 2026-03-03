<?php
  /**
   * OneMeta Dashboard View
   * Lists all field groups
   *
   * @package OneMeta
   */

  if ( ! defined( 'ABSPATH' ) ) {
    exit;
  }
?>

<div class="wrap onemeta-wrapper onemeta-page-wrapper onemeta-dashboard-page">

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

  <div class="onemeta-page-body">
    <!-- Page Header -->
    <div class="onemeta-page-header">
      <div class="onemeta-page-header__content">
        <h1 class="onemeta-page-header__title">
          <?php esc_html_e( 'Field Groups', 'onemeta' ); ?>
        </h1>
        <p class="onemeta-page-header__description">
          <?php esc_html_e( 'Manage your custom field groups', 'onemeta' ); ?>
        </p>
      </div>
      <div class="onemeta-page-header__actions">
        <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta-new' ) ); ?>"
           class="onemeta-button onemeta-button--primary">
          <i class="fa-solid fa-plus"></i>
          <?php esc_html_e( 'Add New Field Group', 'onemeta' ); ?>
        </a>
      </div>
    </div>

    <!-- Stats Cards -->
    <div id="onemeta-stats" class="onemeta-stats">
      <!-- Will be populated by dashboard.js -->
    </div>

    <!-- Dashboard Content -->
    <div id="onemeta-dashboard-root" class="onemeta-dashboard">
      <!-- Loading state -->
      <div class="onemeta-loading">
        <i class="fa-solid fa-spinner onemeta-loading__spinner"></i>
        <p><?php esc_html_e( 'Loading field groups...', 'onemeta' ); ?></p>
      </div>
    </div>

    <!-- Empty State Template -->
    <template id="onemeta-empty-state-template">
      <div class="onemeta-empty-state">
        <div class="onemeta-empty-state__icon">
          <i class="fa-solid fa-table-list"></i>
        </div>
        <h2 class="onemeta-empty-state__title">
          <?php esc_html_e( 'No Field Groups Yet', 'onemeta' ); ?>
        </h2>
        <p class="onemeta-empty-state__description">
          <?php esc_html_e( 'Create your first field group to start building custom fields for your content.', 'onemeta' ); ?>
        </p>
        <a href="<?php echo esc_url( admin_url( 'admin.php?page=onemeta-new' ) ); ?>"
           class="onemeta-button onemeta-button--primary onemeta-button--large">
          <i class="fa-solid fa-plus"></i>
          <?php esc_html_e( 'Create Field Group', 'onemeta' ); ?>
        </a>
      </div>
    </template>

    <!-- Field Group Card Template -->
    <template id="onemeta-field-group-card-template">
      <div class="onemeta-field-group-card onemeta-card onemeta-card--hover" data-group-id="">
        <div class="onemeta-field-group-card__info">
          <h3 class="onemeta-field-group-card__title"></h3>
          <div class="onemeta-field-group-card__meta">
            <!-- Status badge -->
            <span class="onemeta-status-badge onemeta-badge"></span>
            <!-- Field count -->
            <span class="onemeta-field-group-card__stat">
            <i class="fa-solid fa-table-list"></i>
            <span class="onemeta-field-group-card__stat-value"></span>
          </span>
            <!-- Post type -->
            <span class="onemeta-field-group-card__stat">
            <i class="fa-solid fa-tag"></i>
            <span class="onemeta-field-group-card__stat-label"></span>
          </span>
          </div>
        </div>

        <div class="onemeta-field-group-card__actions">
          <!-- Edit button -->
          <a href="#"
             class="onemeta-button onemeta-button--liquid onemeta-button--icon onemeta-action-edit"
             data-tooltip="<?php echo esc_attr__( 'Edit', 'onemeta' ); ?>"
             aria-label="<?php echo esc_attr__( 'Edit', 'onemeta' ); ?>">
            <i class="fa-solid fa-pen-to-square"></i>
          </a>
          <!-- Export button -->
          <button class="onemeta-button onemeta-button--liquid onemeta-button--icon onemeta-action-export"
                  data-tooltip="<?php echo esc_attr__( 'Export', 'onemeta' ); ?>"
                  aria-label="<?php echo esc_attr__( 'Export', 'onemeta' ); ?>">
            <i class="fa-solid fa-download"></i>
          </button>
          <!-- Toggle status button -->
          <button class="onemeta-button onemeta-button--liquid onemeta-button--icon onemeta-action-toggle"
                  data-tooltip="<?php echo esc_attr__( 'Toggle Status', 'onemeta' ); ?>"
                  aria-label="<?php echo esc_attr__( 'Toggle Status', 'onemeta' ); ?>">
            <i class="fa-solid fa-eye"></i>
          </button>
          <!-- Delete button -->
          <button class="onemeta-button onemeta-button--liquid onemeta-button--icon onemeta-button--danger onemeta-action-delete"
                  data-tooltip="<?php echo esc_attr__( 'Delete', 'onemeta' ); ?>"
                  aria-label="<?php echo esc_attr__( 'Delete', 'onemeta' ); ?>">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </template>
  </div>
</div>