<?php
	/**
	 * Field Group Editor
	 * Handles field group retrieval and editing operations
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Admin;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * FieldGroupEditor Class
	 */
	class FieldGroupEditor {

		/**
		 * Get field group data for editing
		 *
		 * @param string $group_id Group ID
		 *
		 * @return array Field group data with editing status
		 */
		public static function get_field_group_for_edit( string $group_id = '' ): array {
			if ( empty( $group_id ) ) {
				return [
					'editing'     => false,
					'field_group' => null
				];
			}

			global $wpdb;
			$table  = $wpdb->prefix . 'onemeta_field_groups';
			$result = $wpdb->get_row(
				$wpdb->prepare( "SELECT * FROM $table WHERE group_key = %s", $group_id ),
				ARRAY_A
			);

			if ( $result ) {
				$field_group              = json_decode( $result['config'], true );
				$field_group['group_key'] = $result['group_key'];
				$field_group['status']    = $result['status'];

				return [
					'editing'     => true,
					'field_group' => $field_group
				];
			}

			return [
				'editing'     => false,
				'field_group' => null
			];
		}

		/**
		 * Get all field groups
		 *
		 * @return array List of field groups
		 */
		public static function get_all_field_groups(): array {
			global $wpdb;
			$table = $wpdb->prefix . 'onemeta_field_groups';

			$results = $wpdb->get_results(
				"SELECT * FROM $table ORDER BY created_at DESC",
				ARRAY_A
			);

			return $results ?: [];
		}

		/**
		 * Get field group by key
		 *
		 * @param string $group_key Group key
		 *
		 * @return array|null Field group data or null
		 */
		public static function get_field_group_by_key( string $group_key ): ?array {
			global $wpdb;
			$table = $wpdb->prefix . 'onemeta_field_groups';

			$result = $wpdb->get_row(
				$wpdb->prepare( "SELECT * FROM $table WHERE group_key = %s", $group_key ),
				ARRAY_A
			);

			return $result ?: null;
		}

		/**
		 * Check if field group exists
		 *
		 * @param string $group_key Group key
		 *
		 * @return bool True if exists, false otherwise
		 */
		public static function field_group_exists( string $group_key ): bool {
			global $wpdb;
			$table = $wpdb->prefix . 'onemeta_field_groups';

			$exists = $wpdb->get_var(
				$wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE group_key = %s", $group_key )
			);

			return (int) $exists > 0;
		}
	}