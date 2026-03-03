<?php
	/**
	 * Field Assets
	 * Handles enqueuing of frontend field assets and conditional logic
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Core;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * FieldAssets Class
	 */
	class FieldAssets {

		/**
		 * Instance
		 *
		 * @var FieldAssets|null
		 */
		private static ?FieldAssets $instance = null;

		/**
		 * Get instance
		 *
		 * @return FieldAssets|null
		 */
		public static function instance(): ?FieldAssets {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		}

		/**
		 * Enqueue assets
		 *
		 * @param string $hook Current admin page hook
		 */
		public function enqueue_assets( string $hook ): void {
			if ( ! in_array( $hook, [ 'post.php', 'post-new.php', 'profile.php', 'user-edit.php' ] ) ) {
				return;
			}

			$is_dev = defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'ONEMETA_DEV_MODE' ) && ONEMETA_DEV_MODE;

			wp_enqueue_media();

			if ( $is_dev ) {
				$this->enqueue_dev_assets();
			} else {
				$this->enqueue_production_assets();
			}

			$this->localize_script();
		}

		/**
		 * Enqueue development assets
		 */
		private function enqueue_dev_assets(): void {
			wp_enqueue_script(
				'vite-client-frontend',
				'http://localhost:3000/@vite/client',
				[],
				null,
				false
			);

			wp_enqueue_script(
				'onemeta-meta-fields',
				'http://localhost:3000/src/js/frontend/main.js',
				[ 'jquery', 'jquery-ui-sortable' ],
				null,
				false
			);

			add_filter( 'script_loader_tag', [ $this, 'add_vite_module_type' ], 10, 2 );
		}

		/**
		 * Enqueue production assets
		 */
		private function enqueue_production_assets(): void {
			wp_enqueue_style(
				'onemeta-meta-fields',
				ONEMETA_PLUGIN_URL . 'assets/css/frontend.css',
				[],
				ONEMETA_VERSION
			);

			wp_enqueue_script(
				'onemeta-meta-fields',
				ONEMETA_PLUGIN_URL . 'assets/js/frontend.min.js',
				[ 'jquery', 'jquery-ui-sortable' ],
				ONEMETA_VERSION,
				true
			);
		}

		/**
		 * Localize script with data
		 */
		private function localize_script(): void {
			global $post;

			wp_localize_script( 'onemeta-meta-fields', 'onemetaMeta', [
				'ajaxurl'     => admin_url( 'admin-ajax.php' ),
				'nonce'       => wp_create_nonce( 'onemeta_meta_nonce' ),
				'conditional' => $this->get_conditional_logic_data(),
				'currentPost' => [
					'id'   => isset( $post ) ? $post->ID : 0,
					'type' => isset( $post ) ? get_post_type( $post ) : '',
				],
			] );
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
			if ( in_array( $handle, [ 'vite-client-frontend', 'onemeta-meta-fields' ] ) ) {
				return str_replace( '<script', '<script type="module"', $tag );
			}

			return $tag;
		}

		/**
		 * Get conditional logic data for current post type
		 *
		 * @return array Conditional logic configuration
		 */
		private function get_conditional_logic_data(): array {
			global $post;

			if ( ! isset( $post ) ) {
				return [];
			}

			$config           = ConfigLoader::instance()->get_config();
			$conditional_data = [];

			// Check each group
			foreach ( $config as $group_key => $group ) {
				// Check if this group applies to current post type
				if ( ! isset( $group['type'] ) || $group['type'] !== 'post' ) {
					continue;
				}

				if ( ! isset( $group['post_type'] ) || $group['post_type'] !== get_post_type( $post ) ) {
					continue;
				}

				// Check each field for conditional logic
				if ( isset( $group['fields'] ) && is_array( $group['fields'] ) ) {
					foreach ( $group['fields'] as $field_key => $field ) {
						if ( isset( $field['conditional'] ) && ! empty( $field['conditional']['field'] ) ) {
							$conditional_data[ $field_key ] = $field['conditional'];
						}
					}
				}
			}

			return $conditional_data;
		}
	}