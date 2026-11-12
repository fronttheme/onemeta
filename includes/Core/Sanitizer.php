<?php
/**
 * Field Sanitizer
 * Sanitizes field values before saving
 *
 * @package OneMeta
 */

namespace OneMeta\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sanitizer Class
 */
class Sanitizer {

	/**
	 * Instance
	 *
	 * @var Sanitizer|null
	 */
	private static ?Sanitizer $instance = null;

	/**
	 * Get instance
	 *
	 * @return Sanitizer|null
	 */
	public static function instance(): ?Sanitizer {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Sanitize text field
	 *
	 * @param string $value Value to sanitize
	 *
	 * @return string
	 */
	public function text( string $value ): string {
		return sanitize_text_field( $value );
	}

	/**
	 * Sanitize textarea
	 *
	 * @param string $value Value to sanitize
	 *
	 * @return string
	 */
	public function textarea( string $value ): string {
		return sanitize_textarea_field( $value );
	}

	/**
	 * Sanitize URL
	 *
	 * @param string $value Value to sanitize
	 *
	 * @return string
	 */
	public function url( string $value ): string {
		return esc_url_raw( $value );
	}

	/**
	 * Sanitize email
	 *
	 * @param string $value Value to sanitize
	 *
	 * @return string
	 */
	public function email( string $value ): string {
		return sanitize_email( $value );
	}

	/**
	 * Sanitize toggle (boolean)
	 *
	 * @param mixed $value Value to sanitize
	 *
	 * @return string
	 */
	public function toggle( mixed $value ): string {
		return ( $value == '1' || $value === true ) ? '1' : '0';
	}

	/**
	 * Sanitize integer
	 *
	 * @param mixed $value Value to sanitize
	 *
	 * @return int
	 */
	public function int( mixed $value ): int {
		return absint( $value );
	}

	/**
	 * Sanitize array of integers (for image IDs, etc.)
	 *
	 * @param mixed $value Value to sanitize
	 *
	 * @return array
	 */
	public function int_array( mixed $value ): array {
		if ( ! is_array( $value ) ) {
			$value = explode( ',', $value );
		}

		return array_map( 'absint', array_filter( $value ) );
	}

	/**
	 * Sanitize select field
	 *
	 * @param mixed $value Value to sanitize
	 * @param array $allowed_values Allowed values, as strings
	 *
	 * @return string
	 */
	public function select( mixed $value, array $allowed_values = [] ): string {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		$value = (string) $value;

		if ( empty( $allowed_values ) ) {
			return sanitize_text_field( $value );
		}

		return in_array( $value, $allowed_values, true ) ? $value : '';
	}

	/**
	 * Sanitize checkbox field: keeps only checked values that exist in the choices
	 *
	 * @param mixed $value Posted values
	 * @param array $allowed_values Allowed values, as strings
	 *
	 * @return array
	 */
	public function checkbox( mixed $value, array $allowed_values = [] ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$checked = array_map( 'sanitize_text_field', array_filter( $value, 'is_scalar' ) );

		if ( empty( $allowed_values ) ) {
			return array_values( $checked );
		}

		return array_values( array_intersect( $checked, $allowed_values ) );
	}

	/**
	 * Choice keys from a field config, as strings
	 *
	 * @param array $field_config Field configuration
	 *
	 * @return array
	 */
	private function choice_keys( array $field_config ): array {
		$choices = $field_config['choices'] ?? [];

		if ( ! is_array( $choices ) ) {
			return [];
		}

		return array_map( 'strval', array_keys( $choices ) );
	}

	/**
	 * Sanitize HTML content
	 *
	 * @param string $value Value to sanitize
	 *
	 * @return string
	 */
	public function html( string $value ): string {
		return wp_kses_post( $value );
	}

	/**
	 * Sanitize repeater field data
	 *
	 * @param mixed $data Data to sanitize
	 * @param array $sub_fields_config Sub-fields configuration (optional)
	 *
	 * @return array
	 */
	public function repeater( mixed $data, array $sub_fields_config = [] ): array {
		if ( ! is_array( $data ) ) {
			return [];
		}

		$sanitized = [];
		foreach ( $data as $row ) {
			if ( is_array( $row ) ) {
				$sanitized_row = [];
				foreach ( $row as $key => $value ) {
					$clean_key = sanitize_key( $key );

					// Use sub-field config if available
					if ( ! empty( $sub_fields_config ) ) {
						$sub_field_type              = $this->get_sub_field_type( $clean_key, $sub_fields_config );
						$sanitized_row[ $clean_key ] = $this->sanitize_by_type( $value, $sub_field_type );
					} else {
						// Fallback to generic sanitization
						$sanitized_row[ $clean_key ] = $this->sanitize_value( $value );
					}
				}
				$sanitized[] = $sanitized_row;
			}
		}

		return $sanitized;
	}

	/**
	 * Get sub-field type from config
	 *
	 * @param string $field_key Field key
	 * @param array $sub_fields_config Sub-fields configuration
	 *
	 * @return string Field type
	 */
	private function get_sub_field_type( string $field_key, array $sub_fields_config ): string {
		foreach ( $sub_fields_config as $sub_field ) {
			if ( isset( $sub_field['key'] ) && $sub_field['key'] === $field_key ) {
				return $sub_field['type'] ?? 'text';
			}
		}

		return 'text';
	}

	/**
	 * Sanitize a value based on its type (generic fallback)
	 *
	 * @param mixed $value Value to sanitize
	 *
	 * @return string|array|int
	 */
	public function sanitize_value( mixed $value ): string|array|int {
		// Handle arrays (for checkbox fields)
		if ( is_array( $value ) ) {
			return array_map( 'sanitize_text_field', $value );
		}

		// Check if it's a URL
		if ( filter_var( $value, FILTER_VALIDATE_URL ) ) {
			return $this->url( $value );
		}

		// Check if it's an email
		if ( filter_var( $value, FILTER_VALIDATE_EMAIL ) ) {
			return $this->email( $value );
		}

		// Default to text
		return $this->text( $value );
	}

	/**
	 * Sanitize gallery images
	 *
	 * @param mixed $value Value to sanitize
	 *
	 * @return array
	 */
	public function gallery( mixed $value ): array {
		if ( is_string( $value ) ) {
			$value = explode( ',', $value );
		}

		return $this->int_array( $value );
	}

	/**
	 * Sanitize file URL
	 *
	 * @param string $value Value to sanitize
	 *
	 * @return string
	 */
	public function file( string $value ): string {
		return esc_url_raw( $value );
	}

	/**
	 * Sanitize date
	 *
	 * @param string $value Value to sanitize
	 *
	 * @return string
	 */
	public function date( string $value ): string {
		// Validate date format
		$date = date_create( $value );

		return $date ? date_format( $date, 'Y-m-d' ) : '';
	}

	/**
	 * Sanitize value by field type
	 *
	 * @param $value
	 * @param $type
	 * @param array $field_config
	 *
	 * @return array|int|string
	 */
	public function sanitize_by_type( $value, $type, array $field_config = [] ): array|int|string {
		switch ( $type ) {
			case 'url':
				return $this->url( $value );

			case 'email':
				return $this->email( $value );

			case 'toggle':
				return $this->toggle( $value );

			case 'image':
			case 'file':
				return is_numeric( $value ) ? $this->int( $value ) : $this->file( $value );

			case 'gallery':
				return $this->gallery( $value );

			case 'textarea':
				return $this->textarea( $value );

			case 'select':
			case 'radio':
			case 'button_group':
				return $this->select( $value, $this->choice_keys( $field_config ) );

			case 'checkbox':
				return $this->checkbox( $value, $this->choice_keys( $field_config ) );

			case 'date':
				return $this->date( $value );

			case 'repeater':
				$sub_fields = $field_config['sub_fields'] ?? [];

				return $this->repeater( $value, $sub_fields );

			case 'html':
			case 'wysiwyg':
				return $this->html( $value );

			default:
				return $this->text( $value );
		}
	}
}