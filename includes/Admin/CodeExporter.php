<?php
	/**
	 * Code Exporter
	 * Generates exportable PHP code from field group configurations
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Admin;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * CodeExporter Class
	 */
	class CodeExporter {

		/**
		 * Generate PHP code from field group config
		 *
		 * @param string $group_id Group ID
		 * @param array $config Field group configuration
		 *
		 * @return string Generated PHP code
		 */
		public static function generate_php_code( string $group_id, array $config ): string {
			$title = $config['title'] ?? 'Field Group';
			$date  = date( 'Y-m-d H:i:s' );

			// Build PHP code as string
			$php = "<?php\n";
			$php .= "/**\n";
			$php .= " * OneMeta Field Group: " . esc_html( $title ) . "\n";
			$php .= " * Generated on: " . $date . "\n";
			$php .= " *\n";
			$php .= " * @package OneMeta\n";
			$php .= " */\n\n";
			$php .= "if (!defined('ABSPATH')) {\n";
			$php .= "    exit;\n";
			$php .= "}\n\n";
			$php .= "add_filter('onemeta_field_groups', function(\$groups) {\n\n";

			// Generate array with proper indentation
			$array_php = self::array_to_php_code( $config, 2 );

			// Remove 4 spaces from start of each line
			$array_php = str_replace( "\n        ", "\n    ", $array_php );

			$php .= "    \$groups['" . esc_attr( $group_id ) . "'] = " . $array_php . ";\n\n";

			$php .= "    return \$groups;\n";
			$php .= "});\n";

			return $php;
		}

		/**
		 * Convert array to formatted PHP code
		 *
		 * @param array $array Array to convert
		 * @param int $indent Indentation level
		 *
		 * @return string Formatted PHP array code
		 */
		private static function array_to_php_code( array $array, int $indent = 0 ): string {
			$indent_str = str_repeat( '    ', $indent );
			$is_assoc   = self::is_assoc( $array );

			if ( empty( $array ) ) {
				return '[]';
			}

			$items = [];
			foreach ( $array as $key => $value ) {
				$key_str = $is_assoc ? self::export_value( $key ) . ' => ' : '';

				if ( is_array( $value ) ) {
					$value_str = self::array_to_php_code( $value, $indent + 1 );
				} else {
					$value_str = self::export_value( $value );
				}

				$items[] = $indent_str . '    ' . $key_str . $value_str;
			}

			return "[\n" . implode( ",\n", $items ) . "\n" . $indent_str . "]";
		}

		/**
		 * Check if array is associative
		 *
		 * @param array $array Array to check
		 *
		 * @return bool True if associative, false otherwise
		 */
		private static function is_assoc( array $array ): bool {
			if ( empty( $array ) ) {
				return false;
			}

			return array_keys( $array ) !== range( 0, count( $array ) - 1 );
		}

		/**
		 * Export a single value to PHP code
		 *
		 * @param mixed $value Value to export
		 *
		 * @return string PHP code representation
		 */
		private static function export_value( mixed $value ): string {
			// Handle arrays (for checkbox defaults, etc.)
			if ( is_array( $value ) ) {
				// For simple indexed arrays (like checkbox defaults), use inline format
				if ( ! self::is_assoc( $value ) ) {
					$items = array_map( function ( $item ) {
						return self::export_value( $item );
					}, $value );

					return '[' . implode( ', ', $items ) . ']';
				}

				// For associative arrays, use multi-line format
				return self::array_to_php_code( $value, 0 );
			}

			if ( is_string( $value ) ) {
				return "'" . addcslashes( $value, "'\\" ) . "'";
			} elseif ( is_bool( $value ) ) {
				return $value ? 'true' : 'false';
			} elseif ( is_null( $value ) ) {
				return 'null';
			} elseif ( is_numeric( $value ) ) {
				return $value;
			} else {
				return var_export( $value, true );
			}
		}

		/**
		 * Generate JSON export of field group
		 *
		 * @param array $config Field group configuration
		 *
		 * @return string JSON string
		 */
		public static function generate_json_export( array $config ): string {
			return wp_json_encode( $config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
		}

		/**
		 * Generate array export (for debugging)
		 *
		 * @param array $config Field group configuration
		 *
		 * @return string Array representation
		 */
		public static function generate_array_export( array $config ): string {
			return var_export( $config, true );
		}
	}