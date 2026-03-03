<?php
	/**
	 * Meta Saver
	 * Handles saving post meta data
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Core;

	use WP_Post;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * MetaSaver Class
	 */
	class MetaSaver {

		/**
		 * Instance
		 *
		 * @var MetaSaver|null
		 */
		private static ?MetaSaver $instance = null;

		/**
		 * Get instance
		 *
		 * @return MetaSaver|null
		 */
		public static function instance(): ?MetaSaver {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			add_action( 'save_post', [ $this, 'save_post_meta' ], 10, 2 );
		}

		/**
		 * Save post meta
		 *
		 * @param int $post_id Post ID
		 * @param WP_Post $post Post object
		 */
		public function save_post_meta( int $post_id, WP_Post $post ): void {
			// Check autosave
			if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
				return;
			}

			// Check permissions
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return;
			}

			$config = ConfigLoader::instance()->get_config();

			// Save each group
			foreach ( $config as $group_id => $group ) {
				if ( ! $this->should_save_group( $group, $post ) ) {
					continue;
				}

				// Verify nonce
				if ( ! $this->verify_group_nonce( $group_id ) ) {
					continue;
				}

				$this->save_group_fields( $post_id, $group_id, $group );
			}

			// Save repeater fields with config
			$this->save_repeater_fields( $post_id, $config );
		}

		/**
		 * Check if group should be saved
		 *
		 * @param array $group Group config
		 * @param WP_Post $post Post object
		 *
		 * @return bool True if should save
		 */
		private function should_save_group( array $group, WP_Post $post ): bool {
			// Set default type
			if ( ! isset( $group['type'] ) ) {
				$group['type'] = 'post';
			}

			// Skip user fields
			if ( $group['type'] === 'user' ) {
				return false;
			}

			// Skip if post type doesn't match
			if ( ! isset( $group['post_type'] ) || $group['post_type'] !== $post->post_type ) {
				return false;
			}

			return true;
		}

		/**
		 * Verify nonce for group
		 *
		 * @param string $group_id Group ID
		 *
		 * @return bool True if nonce is valid
		 */
		private function verify_group_nonce( string $group_id ): bool {
			if ( ! isset( $_POST[ 'onemeta_' . $group_id . '_nonce' ] ) ) {
				return false;
			}

			return wp_verify_nonce( $_POST[ 'onemeta_' . $group_id . '_nonce' ], 'onemeta_' . $group_id );
		}

		/**
		 * Save group fields
		 *
		 * @param int $post_id Post ID
		 * @param string $group_id Group ID
		 * @param array $group Group config
		 */
		private function save_group_fields( int $post_id, string $group_id, array $group ): void {
			$data = $_POST['onemeta_meta'][ $group_id ] ?? [];

			// Save each field
			foreach ( $group['fields'] as $field_id => $field ) {
				$type = $field['type'] ?? 'text';

				// Skip repeater fields (handled separately)
				if ( $type === 'repeater' ) {
					continue;
				}

				$cleared_field = $field_id . '_cleared';

				// Check if this is a date field that was cleared
				if ( isset( $data[ $cleared_field ] ) && $data[ $cleared_field ] === '1' ) {
					// Date was intentionally cleared - delete the meta
					$field_name = 'onemeta_' . $field_id;
					update_post_meta( $post_id, $field_name, '' );
					continue; // Skip normal save
				}

				// Handle toggle fields - if not in POST, set to '0'
				if ( $type === 'toggle' ) {
					$value = isset( $data[ $field_id ] ) ? '1' : '0';
				} else {
					$value = $data[ $field_id ] ?? '';
				}

				$this->save_field_value( $post_id, $field_id, $field, $value );
			}
		}

		/**
		 * Save single field value
		 *
		 * @param int $post_id Post ID
		 * @param string $field_id Field ID
		 * @param array $field Field config
		 * @param mixed $value Field value
		 */
		private function save_field_value( int $post_id, string $field_id, array $field, mixed $value ): void {
			$type = $field['type'] ?? 'text';

			// Skip repeater fields (handled separately)
			if ( $type === 'repeater' ) {
				return;
			}

			// Sanitize value
			$sanitized_value = Sanitizer::instance()->sanitize_by_type( $value, $type, $field );

			// Update post meta
			update_post_meta( $post_id, 'onemeta_' . $field_id, $sanitized_value );
		}

		/**
		 * Save repeater fields
		 *
		 * @param int $post_id Post ID
		 * @param array $config Full config (to get sub-fields)
		 */
		private function save_repeater_fields( int $post_id, array $config ): void {
			if ( ! isset( $_POST['onemeta_repeater'] ) ) {
				return;
			}

			foreach ( $_POST['onemeta_repeater'] as $field_id => $items ) {
				// Find the field config to get sub-fields
				$field_config = $this->find_field_config( $field_id, $config );
				$sub_fields   = $field_config['sub_fields'] ?? [];

				// Sanitize repeater with toggle handling
				$sanitized_items = $this->sanitize_repeater_items( $items, $sub_fields );

				update_post_meta(
					$post_id,
					'onemeta_' . $field_id,
					$sanitized_items
				);
			}
		}

		/**
		 * Sanitize repeater items with proper toggle handling
		 *
		 * @param array $items Repeater items
		 * @param array $sub_fields Sub-field configs
		 *
		 * @return array Sanitized items
		 */
		private function sanitize_repeater_items( array $items, array $sub_fields ): array {
			if ( empty( $items ) || empty( $sub_fields ) ) {
				return [];
			}

			$sanitized = [];

			foreach ( $items as $index => $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}

				$sanitized_item = [];

				foreach ( $sub_fields as $sub_field ) {
					if ( ! isset( $sub_field['key'] ) ) {
						continue;
					}

					$sub_key  = $sub_field['key'];
					$sub_type = $sub_field['type'] ?? 'text';

					// Handle toggle fields in repeater
					if ( $sub_type === 'toggle' ) {
						$sub_value = isset( $item[ $sub_key ] ) ? '1' : '0';
					} else {
						$sub_value = $item[ $sub_key ] ?? '';
					}

					// Sanitize the value
					$sanitized_item[ $sub_key ] = Sanitizer::instance()->sanitize_by_type(
						$sub_value,
						$sub_type,
						$sub_field
					);
				}

				$sanitized[] = $sanitized_item;
			}

			return $sanitized;
		}

		/**
		 * Find field config by field ID
		 *
		 * @param string $field_id Field ID
		 * @param array $config Full config
		 *
		 * @return array Field config
		 */
		private function find_field_config( string $field_id, array $config ): array {
			foreach ( $config as $group ) {
				if ( isset( $group['fields'][ $field_id ] ) ) {
					return $group['fields'][ $field_id ];
				}
			}

			return [];
		}
	}