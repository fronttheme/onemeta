<?php
	/**
	 * Admin AJAX
	 * Handles all AJAX requests for admin functionality
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Admin;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * AdminAjax Class
	 */
	class AdminAjax {

		/**
		 * Instance
		 *
		 * @var AdminAjax|null
		 */
		private static ?AdminAjax $instance = null;

		/**
		 * Get instance
		 *
		 * @return AdminAjax|null
		 */
		public static function instance(): ?AdminAjax {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			// AJAX handlers
			add_action( 'wp_ajax_onemeta_export_group', [ $this, 'handle_export' ] );
			add_action( 'wp_ajax_onemeta_delete_group', [ $this, 'handle_delete' ] );
			add_action( 'wp_ajax_onemeta_toggle_group_status', [ $this, 'handle_toggle_status' ] );
			add_action( 'wp_ajax_onemeta_save_field_group', [ $this, 'handle_save_field_group' ] );
		}

		/**
		 * Handle export field group
		 */
		public function handle_export(): void {
			check_ajax_referer( 'onemeta_admin_nonce', 'nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( __( 'You do not have sufficient permissions.', 'onemeta' ) );
			}

			$group_id = isset( $_POST['group_id'] ) ? sanitize_text_field( $_POST['group_id'] ) : '';

			if ( empty( $group_id ) ) {
				wp_send_json_error( 'Group ID is required' );
			}

			global $wpdb;
			$table_name = $wpdb->prefix . 'onemeta_field_groups';

			$result = $wpdb->get_row(
				$wpdb->prepare( "SELECT * FROM $table_name WHERE group_key = %s", $group_id ),
				ARRAY_A
			);

			if ( $result ) {
				$config   = json_decode( $result['config'], true );
				$php_code = CodeExporter::generate_php_code( $group_id, $config );

				wp_send_json_success( [
					'code'     => $php_code,
					'filename' => 'onemeta-' . $group_id . '.php'
				] );
			} else {
				wp_send_json_error( 'Group not found' );
			}
		}

		/**
		 * Handle delete field group
		 */
		public function handle_delete(): void {
			check_ajax_referer( 'onemeta_admin_nonce', 'nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( __( 'Insufficient permissions.', 'onemeta' ) );
			}

			$group_id = isset( $_POST['group_id'] ) ? sanitize_text_field( $_POST['group_id'] ) : '';

			if ( empty( $group_id ) ) {
				wp_send_json_error( 'Group ID required' );
			}

			global $wpdb;
			$table_name = $wpdb->prefix . 'onemeta_field_groups';

			$result = $wpdb->delete( $table_name, [ 'group_key' => $group_id ] );

			if ( $result ) {
				wp_send_json_success( 'Group deleted successfully' );
			} else {
				wp_send_json_error( 'Failed to delete group' );
			}
		}

		/**
		 * Handle toggle group status
		 */
		public function handle_toggle_status(): void {
			check_ajax_referer( 'onemeta_admin_nonce', 'nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( __( 'Insufficient permissions.', 'onemeta' ) );
			}

			$group_id = isset( $_POST['group_id'] ) ? sanitize_text_field( $_POST['group_id'] ) : '';

			if ( empty( $group_id ) ) {
				wp_send_json_error( 'Group ID required' );
			}

			global $wpdb;
			$table_name = $wpdb->prefix . 'onemeta_field_groups';

			// Get current status
			$current = $wpdb->get_var(
				$wpdb->prepare( "SELECT status FROM $table_name WHERE group_key = %s", $group_id )
			);

			$new_status = $current === 'active' ? 'inactive' : 'active';

			$result = $wpdb->update(
				$table_name,
				[ 'status' => $new_status ],
				[ 'group_key' => $group_id ]
			);

			if ( $result !== false ) {
				wp_send_json_success( 'Status updated' );
			} else {
				wp_send_json_error( 'Failed to update status' );
			}
		}

		/**
		 * Handle save field group
		 */
		public function handle_save_field_group(): void {
			check_ajax_referer( 'onemeta_builder_save', 'onemeta_builder_nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( [ 'message' => 'Permission denied' ] );
			}

			// Get form data
			$group_key   = sanitize_key( $_POST['group_key'] );
			$group_title = sanitize_text_field( $_POST['group_title'] );
			$group_type  = sanitize_text_field( $_POST['group_type'] );
			$post_type   = sanitize_text_field( $_POST['post_type'] ?? '' );
			$position    = sanitize_text_field( $_POST['position'] ?? 'normal' );

			// Build config
			$config = [
				'title' => $group_title,
				'type'  => $group_type,
			];

			if ( $group_type === 'post' ) {
				$config['post_type'] = $post_type;
				$config['position']  = $position;
			}

			// Parse fields
			$fields           = $this->parse_fields( $_POST['fields'] ?? [] );
			$config['fields'] = $fields;

			// Save to database
			$this->save_to_database( $group_key, $group_title, $config );
		}

		/**
		 * Parse fields from POST data
		 *
		 * @param array $fields_data Raw field data from POST
		 *
		 * @return array Sanitized fields array
		 */
		private function parse_fields( array $fields_data ): array {
			$fields = [];

			foreach ( $fields_data as $field_data ) {
				if ( ! isset( $field_data['key'] ) || ! isset( $field_data['type'] ) ) {
					continue;
				}

				$field_key = sanitize_key( $field_data['key'] );

				// Start with basic required fields
				$fields[ $field_key ] = [
					'type'  => sanitize_text_field( $field_data['type'] ),
					'label' => sanitize_text_field( $field_data['label'] ),
				];

				// Add description and placeholder
				if ( isset( $field_data['description'] ) && $field_data['description'] !== '' ) {
					$fields[ $field_key ]['description'] = sanitize_textarea_field( $field_data['description'] );
				}

				if ( isset( $field_data['placeholder'] ) && $field_data['placeholder'] !== '' ) {
					$fields[ $field_key ]['placeholder'] = sanitize_text_field( $field_data['placeholder'] );
				}

				// Add all other field settings dynamically
				$basic_keys = [ 'key', 'type', 'label', 'description', 'placeholder' ];
				foreach ( $field_data as $setting_key => $setting_value ) {
					// Skip basic keys (already handled)
					if ( in_array( $setting_key, $basic_keys ) ) {
						continue;
					}

					// Skip if value is empty string (but allow '0')
					if ( $setting_value === '' ) {
						continue;
					}

					// Handle different value types
					if ( is_array( $setting_value ) ) {
						$fields[ $field_key ][ $setting_key ] = $this->sanitize_array_setting( $setting_key, $setting_value );
					} else {
						$fields[ $field_key ][ $setting_key ] = sanitize_text_field( $setting_value );
					}
				}
			}

			return $fields;
		}

		/**
		 * Sanitize array settings (choices, sub_fields, conditional, etc.)
		 *
		 * @param string $setting_key Setting key
		 * @param array $setting_value Setting value
		 *
		 * @return array Sanitized array
		 */
		private function sanitize_array_setting( string $setting_key, array $setting_value ): array {
			switch ( $setting_key ) {
				case 'sub_fields':
					return $this->sanitize_sub_fields( $setting_value );

				case 'choices':
					$sanitized = [];
					foreach ( $setting_value as $k => $v ) {
						$sanitized[ sanitize_key( $k ) ] = sanitize_text_field( $v );
					}

					return $sanitized;

				case 'conditional':
					$rules = [];
					foreach ( $setting_value['rules'] ?? [] as $rule ) {
						if ( ! is_array( $rule ) ) {
							continue;
						}
						$rules[] = [
							'field'    => sanitize_text_field( $rule['field'] ?? '' ),
							'operator' => sanitize_text_field( $rule['operator'] ?? '==' ),
							'value'    => sanitize_text_field( $rule['value'] ?? '' ),
						];
					}

					return [
						'relation' => sanitize_text_field( $setting_value['relation'] ?? 'AND' ),
						'rules'    => $rules,
					];

				case 'default':
					// Handle array defaults (for checkbox fields)
					return array_map( 'sanitize_text_field', $setting_value );

				default:
					return array_map( 'sanitize_text_field', $setting_value );
			}
		}

		/**
		 * Sanitize sub-fields array
		 *
		 * @param array $sub_fields Sub-fields data
		 *
		 * @return array Sanitized sub-fields
		 */
		private function sanitize_sub_fields( array $sub_fields ): array {
			$sanitized = [];

			foreach ( $sub_fields as $sub_field ) {
				if ( ! is_array( $sub_field ) ) {
					continue;
				}

				$clean_sub_field = [];

				// Basic Properties
				if ( isset( $sub_field['key'] ) ) {
					$clean_sub_field['key'] = sanitize_key( $sub_field['key'] );
				}

				if ( isset( $sub_field['label'] ) ) {
					$clean_sub_field['label'] = sanitize_text_field( $sub_field['label'] );
				}

				if ( isset( $sub_field['type'] ) ) {
					$clean_sub_field['type'] = sanitize_text_field( $sub_field['type'] );
				}

				if ( isset( $sub_field['description'] ) ) {
					$clean_sub_field['description'] = sanitize_text_field( $sub_field['description'] );
				}

				if ( isset( $sub_field['placeholder'] ) ) {
					$clean_sub_field['placeholder'] = sanitize_text_field( $sub_field['placeholder'] );
				}

				// Handle default value based on field type
				if ( isset( $sub_field['default'] ) ) {
					$field_type = $clean_sub_field['type'] ?? 'text';

					// Checkbox defaults should be arrays
					if ( $field_type === 'checkbox' ) {
						if ( is_array( $sub_field['default'] ) ) {
							// Already an array (from JavaScript conversion)
							$clean_sub_field['default'] = array_map( 'sanitize_text_field', $sub_field['default'] );
						} elseif ( is_string( $sub_field['default'] ) && ! empty( $sub_field['default'] ) ) {
							// Convert comma-separated string to array (fallback)
							$clean_sub_field['default'] = array_map(
								'sanitize_text_field',
								array_filter(
									array_map( 'trim', explode( ',', $sub_field['default'] ) ),
									function ( $v ) {
										return $v !== '';
									}
								)
							);
						}
					} else {
						// All other field types: keep as string
						$clean_sub_field['default'] = sanitize_text_field( $sub_field['default'] );
					}
				}

				// Choices (for select, checkbox, radio, button_group)
				if ( isset( $sub_field['choices'] ) && is_array( $sub_field['choices'] ) ) {
					$clean_choices = [];
					foreach ( $sub_field['choices'] as $choice_key => $choice_label ) {
						$clean_choices[ sanitize_key( $choice_key ) ] = sanitize_text_field( $choice_label );
					}
					$clean_sub_field['choices'] = $clean_choices;
				}

				// Toggle Options
				if ( isset( $sub_field['on_text'] ) ) {
					$clean_sub_field['on_text'] = sanitize_text_field( $sub_field['on_text'] );
				}

				if ( isset( $sub_field['off_text'] ) ) {
					$clean_sub_field['off_text'] = sanitize_text_field( $sub_field['off_text'] );
				}

				// Layout (for checkbox, radio)
				if ( isset( $sub_field['layout'] ) ) {
					$clean_sub_field['layout'] = sanitize_text_field( $sub_field['layout'] );
				}

				// Button Text (for file/image/gallery)
				if ( isset( $sub_field['button_text'] ) ) {
					$clean_sub_field['button_text'] = sanitize_text_field( $sub_field['button_text'] );
				}

				// File Type (for file field)
				if ( isset( $sub_field['file_type'] ) ) {
					$clean_sub_field['file_type'] = sanitize_text_field( $sub_field['file_type'] );
				}

				// Only add if it has required fields
				if ( ! empty( $clean_sub_field['key'] ) && ! empty( $clean_sub_field['type'] ) ) {
					$sanitized[] = $clean_sub_field;
				}
			}

			return $sanitized;
		}

		/**
		 * Save field group to database
		 *
		 * @param string $group_key Group key
		 * @param string $group_title Group title
		 * @param array $config Field group config
		 */
		private function save_to_database( string $group_key, string $group_title, array $config ): void {
			global $wpdb;
			$table = $wpdb->prefix . 'onemeta_field_groups';

			// Check if exists
			$exists = $wpdb->get_var(
				$wpdb->prepare( "SELECT id FROM $table WHERE group_key = %s", $group_key )
			);

			if ( $exists ) {
				// Update
				$result = $wpdb->update(
					$table,
					[
						'title'  => $group_title,
						'config' => wp_json_encode( $config ),
					],
					[ 'group_key' => $group_key ],
					[ '%s', '%s' ],
					[ '%s' ]
				);
			} else {
				// Insert
				$result = $wpdb->insert(
					$table,
					[
						'group_key' => $group_key,
						'title'     => $group_title,
						'config'    => wp_json_encode( $config ),
						'status'    => 'active',
					],
					[ '%s', '%s', '%s', '%s' ]
				);
			}

			if ( $result !== false ) {
				wp_send_json_success( [ 'message' => 'Field group saved successfully' ] );
			} else {
				wp_send_json_error( [ 'message' => 'Failed to save field group' ] );
			}
		}
	}