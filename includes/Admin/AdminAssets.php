<?php
	/**
	 * Admin Assets
	 * Handles enqueuing of admin styles and scripts
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Admin;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * AdminAssets Class
	 */
	class AdminAssets {

		/**
		 * Instance
		 *
		 * @var AdminAssets|null
		 */
		private static ?AdminAssets $instance = null;

		/**
		 * Get instance
		 *
		 * @return AdminAssets|null
		 */
		public static function instance(): ?AdminAssets {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
			add_action( 'admin_head', [ $this, 'clean_admin_page' ], 999 ); // High priority
		}

		/**
		 * Enqueue admin assets
		 *
		 * @param string $hook Current admin page hook
		 */
		public function enqueue_admin_assets( string $hook ): void {
			// Check if this is a OneMeta page
			if ( ! str_contains( $hook, 'onemeta' ) ) {
				return;
			}

			// Check for dev mode - must be explicitly enabled by user
			$is_dev = defined( 'ONEMETA_DEV_MODE' ) && ONEMETA_DEV_MODE === true;

			if ( $is_dev ) {
				$this->enqueue_dev_assets();
			} else {
				$this->enqueue_production_assets();
			}

			// Enqueue FontAwesome
			wp_enqueue_style(
				'onemeta-fontawesome',
				ONEMETA_PLUGIN_URL . 'assets/fonts/fontawesome/css/all.min.css',
				[],
				'7.1.0'
			);

			// Get current page from URL
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Reading admin page parameter for asset loading only
			$page = isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : '';

			// Localize data for dashboard page
			if ( $page === 'onemeta' || $page === 'onemeta-docs' ) {
				$this->localize_dashboard_data();
			}

			// Conditionally load builder assets for builder pages only
			if ( $page === 'onemeta-new' || $page === 'onemeta-edit' ) {
				$this->enqueue_builder_data( $page );
			}
		}

		/**
		 * Enqueue development assets
		 */
		private function enqueue_dev_assets(): void {
			// wp-i18n for Vite dev mode
			wp_enqueue_script( 'wp-i18n' );

			wp_enqueue_script(
				'vite-client-builder',
				'http://localhost:3000/@vite/client',
				[],
				null,
				false
			);

			wp_enqueue_script(
				'onemeta-builder-app',
				'http://localhost:3000/src/js/admin/main.js',
				[ 'wp-i18n' ],
				null,
				false
			);

			wp_set_script_translations( 'onemeta-builder-app', 'onemeta' );

			add_filter( 'script_loader_tag', [ $this, 'add_vite_module_type' ], 10, 2 );
		}

		/**
		 * Enqueue production assets
		 */
		private function enqueue_production_assets(): void {
			wp_enqueue_style(
				'onemeta-builder-app',
				ONEMETA_PLUGIN_URL . 'assets/css/admin.css',
				[],
				ONEMETA_VERSION
			);

			wp_enqueue_script(
				'onemeta-builder-app',
				ONEMETA_PLUGIN_URL . 'assets/js/admin.min.js',
				[ 'jquery', 'wp-i18n' ],
				ONEMETA_VERSION,
				true
			);

			wp_set_script_translations( 'onemeta-builder-app', 'onemeta' );

			add_filter( 'script_loader_tag', [ $this, 'add_vite_module_type' ], 10, 2 );
		}

		/**
		 * Localize data for dashboard page
		 */
		private function localize_dashboard_data(): void {
			$dashboard_data = [
				'ajaxurl'   => admin_url( 'admin-ajax.php' ),
				'nonce'     => wp_create_nonce( 'onemeta_admin_nonce' ),
				'restUrl'   => rest_url( 'onemeta/v1/' ),
				'restNonce' => wp_create_nonce( 'wp_rest' ),
				'pluginUrl' => ONEMETA_PLUGIN_URL,
				'i18n'      => [
					'total_groups'          => __( 'Total Groups', 'onemeta' ),
					'active_groups'         => __( 'Active Groups', 'onemeta' ),
					'total_fields'          => __( 'Total Fields', 'onemeta' ),
					'failed_to_load_groups' => __( 'Failed to load field groups. Please refresh the page.', 'onemeta' ),
					'preparing_export'      => __( 'Preparing export...', 'onemeta' ),
					'export_title'          => __( 'Export:', 'onemeta' ),
					'export_instructions'   => __( 'Copy this code to your theme\'s <code style="font-family: \'JetBrains Mono\', monospace;">functions.php</code> file:', 'onemeta' ),
					'copy_to_clipboard'     => __( 'Copy to Clipboard', 'onemeta' ),
					'download_php_file'     => __( 'Download PHP File', 'onemeta' ),
					'code_copied'           => __( 'PHP code copied to clipboard!', 'onemeta' ),
					'copy_failed'           => __( 'Failed to copy. Please copy manually.', 'onemeta' ),
					'export_failed'         => __( 'Export failed:', 'onemeta' ),
					'unknown_error'         => __( 'Unknown error', 'onemeta' ),
					'export_failed_retry'   => __( 'Export failed. Please try again.', 'onemeta' ),
					'file_downloaded'       => __( 'File downloaded successfully!', 'onemeta' ),
					'status_updated'        => __( 'status updated!', 'onemeta' ),
					'status_update_failed'  => __( 'Failed to update status:', 'onemeta' ),
					'status_update_retry'   => __( 'Failed to update status. Please try again.', 'onemeta' ),
					'field_group'           => __( 'field group', 'onemeta' ),
					'group_deleted'         => __( 'Field group deleted successfully!', 'onemeta' ),
					'delete_failed'         => __( 'Failed to delete:', 'onemeta' ),
					'delete_retry'          => __( 'Failed to delete. Please try again.', 'onemeta' ),
					'network_error'         => __( 'Network response was not ok!', 'onemeta' ),
				]
			];

			wp_localize_script( 'onemeta-builder-app', 'onemetaAdmin', $dashboard_data );
		}

		/**
		 * Enqueue builder-specific data
		 *
		 * @param string $page Current page
		 */
		private function enqueue_builder_data( string $page ): void {
			// Get field group if editing
			$group_id         = isset( $_GET['id'] ) ? sanitize_text_field( $_GET['id'] ) : '';
			$field_group_data = FieldGroupEditor::get_field_group_for_edit( $group_id );
			$editing          = $field_group_data['editing'];
			$field_group      = $field_group_data['field_group'];

			// Prepare builder-specific data
			$builder_data = [
				'ajaxurl'               => admin_url( 'admin-ajax.php' ),
				'nonce'                 => wp_create_nonce( 'onemeta_admin_nonce' ),
				'restUrl'               => rest_url( 'onemeta/v1/' ),
				'restNonce'             => wp_create_nonce( 'wp_rest' ),
				'pluginUrl'             => ONEMETA_PLUGIN_URL,
				'fieldTypes'            => $this->get_field_types(),
				'fileTypes'             => $this->get_file_types(),
				'dashboardUrl'          => admin_url( 'admin.php?page=onemeta' ),
				'fieldCount'            => $editing && ! empty( $field_group['fields'] ) ? count( $field_group['fields'] ) : 0,
				'schemas'               => \OneMeta\Admin\FieldTypeSchemas::get_all_schemas(),
				'fieldTypeGroups'       => \OneMeta\Admin\FieldTypeSchemas::get_field_type_groups(),
				'existingFields'        => $editing && ! empty( $field_group['fields'] ) ? array_values( $field_group['fields'] ) : [],
				'fieldsByKey'           => $editing && ! empty( $field_group['fields'] ) ? $field_group['fields'] : [],
				'i18n'                  => $this->get_translations(),
				'placeholderFieldTypes' => [ 'text', 'textarea', 'url', 'email', 'date' ],
				'defaultFieldTypes'     => [
					'text',
					'textarea',
					'url',
					'email',
					'date',
					'toggle',
					'select',
					'checkbox',
					'radio',
					'button_group'
				],
			];

			// Localize script for builder pages
			wp_localize_script( 'onemeta-builder-app', 'onemetaBuilder', $builder_data );

		}

		/**
		 * Add Vite module type
		 *
		 * @param string $tag Script tag
		 * @param string $handle Script handle
		 *
		 * @return string Modified script tag
		 */
		public function add_vite_module_type( string $tag, string $handle ): string {
			if ( in_array( $handle, [ 'vite-client-builder', 'onemeta-builder-app' ] ) ) {
				return str_replace( '<script', '<script type="module"', $tag );
			}

			return $tag;
		}

		/**
		 * Get available field types
		 *
		 * @return array
		 */
		private function get_field_types(): array {
			return [
				[
					'value' => 'text',
					'label' => __( 'Text', 'onemeta' ),
					'icon'  => 'fa-heading',
					'group' => 'basic',
				],
				[
					'value' => 'textarea',
					'label' => __( 'Textarea', 'onemeta' ),
					'icon'  => 'fa-paragraph',
					'group' => 'basic',
				],
				[
					'value' => 'url',
					'label' => __( 'URL', 'onemeta' ),
					'icon'  => 'fa-link',
					'group' => 'basic',
				],
				[
					'value' => 'email',
					'label' => __( 'Email', 'onemeta' ),
					'icon'  => 'fa-at',
					'group' => 'basic',
				],
				[
					'value' => 'date',
					'label' => __( 'Date', 'onemeta' ),
					'icon'  => 'fa-calendar-days',
					'group' => 'basic',
				],
				[
					'value' => 'toggle',
					'label' => __( 'Toggle', 'onemeta' ),
					'icon'  => 'fa-toggle-on',
					'group' => 'choice',
				],
				[
					'value' => 'select',
					'label' => __( 'Select', 'onemeta' ),
					'icon'  => 'fa-circle-chevron-down',
					'group' => 'choice',
				],
				[
					'value' => 'checkbox',
					'label' => __( 'Checkbox', 'onemeta' ),
					'icon'  => 'fa-square-check',
					'group' => 'choice',
				],
				[
					'value' => 'radio',
					'label' => __( 'Radio', 'onemeta' ),
					'icon'  => 'fa-circle-dot',
					'group' => 'choice',
				],
				[
					'value' => 'button_group',
					'label' => __( 'Button Group', 'onemeta' ),
					'icon'  => 'fa-mattress-pillow',
					'group' => 'choice',
				],
				[
					'value' => 'image',
					'label' => __( 'Image', 'onemeta' ),
					'icon'  => 'fa-image',
					'group' => 'media',
				],
				[
					'value' => 'file',
					'label' => __( 'File', 'onemeta' ),
					'icon'  => 'fa-file-image',
					'group' => 'media',
				],
				[
					'value' => 'gallery',
					'label' => __( 'Gallery', 'onemeta' ),
					'icon'  => 'fa-images',
					'group' => 'media',
				],
				[
					'value' => 'repeater',
					'label' => __( 'Repeater', 'onemeta' ),
					'icon'  => 'fa-cubes',
					'group' => 'advanced',
				],
			];
		}

		/**
		 * Get available file types
		 *
		 * @return array
		 */
		private function get_file_types(): array {
			return [
				[ 'value' => 'any', 'label' => __( 'Any File', 'onemeta' ) ],
				[ 'value' => 'video', 'label' => __( 'Video', 'onemeta' ) ],
				[ 'value' => 'audio', 'label' => __( 'Audio', 'onemeta' ) ],
				[ 'value' => 'document', 'label' => __( 'Document', 'onemeta' ) ],
				[ 'value' => 'archive', 'label' => __( 'Archive', 'onemeta' ) ],
				[ 'value' => 'font', 'label' => __( 'Font', 'onemeta' ) ],
				[ 'value' => 'spreadsheet', 'label' => __( 'Spreadsheet', 'onemeta' ) ],
			];
		}

		/**
		 * Get translations for builder
		 *
		 * @return array
		 */
		private function get_translations(): array {
			return [
				'confirmDeleteField' => __( 'Are you sure you want to delete this field?', 'onemeta' ),
				'confirmDeleteGroup' => __( 'Are you sure you want to delete this field group?', 'onemeta' ),
				'saveSuccess'        => __( 'Field group saved successfully!', 'onemeta' ),
				'saveError'          => __( 'Error saving field group. Please try again.', 'onemeta' ),
				'exportSuccess'      => __( 'PHP code exported to clipboard!', 'onemeta' ),
				'exportError'        => __( 'Failed to copy code. Please try again.', 'onemeta' ),
				'invalidFieldKey'    => __( 'Field key must be lowercase with underscores only (a-z, 0-9, _)', 'onemeta' ),
				'duplicateFieldKey'  => __( 'Field key already exists. Please use a unique key.', 'onemeta' ),
				'addChoice'          => __( 'Add Choice', 'onemeta' ),
				'removeChoice'       => __( 'Remove Choice', 'onemeta' ),
				'choiceValue'        => __( 'Value', 'onemeta' ),
				'choiceLabel'        => __( 'Label', 'onemeta' ),
				'addSubField'        => __( 'Add Sub-Field', 'onemeta' ),
				'noSubFields'        => __( 'No sub-fields added yet.', 'onemeta' ),
				'toggleSubFields'    => __( 'Toggle Sub-Fields', 'onemeta' ),
				'saving'             => __( 'Saving...', 'onemeta' ),
			];
		}

		/**
		 * Clean up admin page - hide other notices
		 */
		public function clean_admin_page(): void {
			$screen = get_current_screen();

			// Check if current page is any onemeta page
			if ( ! $screen || strpos( $screen->id, 'onemeta' ) === false ) {
				return;
			}

			// CSS to hide all notices (except onemeta)
			?>
      <style>
        /* Hide ALL notices on any onemeta page */
        body[id*="onemeta"] .notice:not(.onemeta-notice),
        body[id*="onemeta"] .update-nag,
        body[id*="onemeta"] .updated {
          display: none !important;
        }
        /* Show only onemeta notices */
        .onemeta-notice {
          display: block !important;
          margin: 15px 0 !important;
          border-left-color: #2271b1 !important;
        }
        /* Optional: Clean up admin UI */
        body[id*="onemeta"] #wpbody-content > .notice {
          display: none;
        }
        /* Hide screen options & help tabs */
        body[id*="onemeta"] #screen-meta,
        body[id*="onemeta"] #screen-meta-links {
          display: none;
        }
      </style>

      <!-- Optional: Remove admin footer text -->
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          // Remove footer text
          const footer = document.getElementById('footer-left');
          if (footer) {
            footer.innerHTML = '';
          }

          // Remove footer upgrade notice
          const upgrade = document.getElementById('footer-upgrade');
          if (upgrade) {
            upgrade.remove();
          }
        });
      </script>
			<?php

			// Remove admin notices via PHP
			remove_all_actions( 'admin_notices' );
			remove_all_actions( 'all_admin_notices' );
		}
	}