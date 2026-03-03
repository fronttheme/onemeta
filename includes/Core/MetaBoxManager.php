<?php
	/**
	 * Meta Box Manager
	 * Handles registration and rendering of meta boxes
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Core;

	use WP_Post;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * MetaBoxManager Class
	 */
	class MetaBoxManager {

		/**
		 * Instance
		 *
		 * @var MetaBoxManager|null
		 */
		private static ?MetaBoxManager $instance = null;

		/**
		 * Get instance
		 *
		 * @return MetaBoxManager|null
		 */
		public static function instance(): ?MetaBoxManager {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			add_action( 'add_meta_boxes', [ $this, 'register_meta_boxes' ] );
		}

		/**
		 * Register meta boxes from config
		 */
		public function register_meta_boxes(): void {
			$config = ConfigLoader::instance()->get_config();

			if ( empty( $config ) ) {
				return;
			}

			foreach ( $config as $group_id => $group ) {
				// Set default type if not set
				if ( ! isset( $group['type'] ) ) {
					$group['type'] = 'post';
				}

				// Skip user fields
				if ( $group['type'] === 'user' ) {
					continue;
				}

				// Skip if no post_type defined
				if ( ! isset( $group['post_type'] ) ) {
					continue;
				}

				add_meta_box(
					'onemeta_' . $group_id,
					$group['title'],
					[ $this, 'render_meta_box' ],
					$group['post_type'],
					$group['position'] ?? 'normal',
					$group['priority'] ?? 'default',
					[ 'group_id' => $group_id, 'config' => $group ]
				);
			}
		}

		/**
		 * Render meta box
		 *
		 * @param WP_Post $post Post object
		 * @param array $metabox Metabox data
		 */
		public function render_meta_box( WP_Post $post, array $metabox ): void {
			$group_id = $metabox['args']['group_id'];
			$config   = $metabox['args']['config'];

			wp_nonce_field( 'onemeta_' . $group_id, 'onemeta_' . $group_id . '_nonce' );

			echo '<div class="onemeta-meta-fields">';

			foreach ( $config['fields'] as $field_id => $field ) {
				FieldRenderer::render_field( $post->ID, $group_id, $field_id, $field );
			}

			echo '</div>';
		}
	}