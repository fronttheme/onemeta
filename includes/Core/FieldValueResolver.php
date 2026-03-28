<?php
	/**
	 * Field Value Resolver
	 * Resolves stored raw values to their configured return format
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Core;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	class FieldValueResolver {

		private static ?FieldValueResolver $instance = null;

		public static function instance(): ?FieldValueResolver {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Resolve a value based on its field config
		 *
		 * @param mixed $value Raw stored value
		 * @param string $key Field key (without onemeta_ prefix)
		 * @param string $context 'post' or 'user'
		 *
		 * @return mixed
		 */
		public function resolve( mixed $value, string $key, string $context = 'post' ): mixed {
			$field = $this->find_field_config( $key, $context );

			if ( empty( $field ) ) {
				return $value;
			}

			$type = $field['type'] ?? 'text';

			return match ( $type ) {
				'image' => $this->resolve_image( $value, $field ),
				'gallery' => $this->resolve_gallery( $value, $field ),
				'file' => $this->resolve_file( $value, $field ),
				default => $value,
			};
		}

		/**
		 * Resolve image field value
		 */
		private function resolve_image( mixed $value, array $field ): mixed {
			if ( empty( $value ) ) {
				return $value;
			}

			$id            = (int) $value;
			$return_format = $field['return_format'] ?? 'id';

			return match ( $return_format ) {
				'url' => wp_get_attachment_image_url( $id, 'full' ),
				'array' => $this->build_image_array( $id ),
				default => $id, // 'id'
			};
		}

		/**
		 * Resolve gallery field value
		 */
		private function resolve_gallery( mixed $value, array $field ): array {
			if ( empty( $value ) ) {
				return [];
			}

			// Normalize to array of IDs
			$ids = is_array( $value )
				? array_map( 'absint', $value )
				: array_map( 'absint', explode( ',', $value ) );

			$ids           = array_filter( $ids );
			$return_format = $field['return_format'] ?? 'ids';

			return match ( $return_format ) {
				'urls' => array_map( fn( $id ) => wp_get_attachment_image_url( $id, 'full' ), $ids ),
				'array' => array_map( fn( $id ) => $this->build_image_array( $id ), $ids ),
				default => $ids, // 'ids'
			};
		}

		/**
		 * Resolve file field value
		 */
		private function resolve_file( mixed $value, array $field ): mixed {
			if ( empty( $value ) ) {
				return $value;
			}

			$return_format = $field['return_format'] ?? 'id';

			// Could be stored as ID or URL depending on how it was saved
			$is_id = is_numeric( $value );

			return match ( $return_format ) {
				'url' => $is_id ? wp_get_attachment_url( (int) $value ) : $value,
				'array' => $is_id ? $this->build_file_array( (int) $value ) : [ 'url' => $value ],
				default => $is_id ? (int) $value : $value, // 'id'
			};
		}

		/**
		 * Build structured image array
		 */
		private function build_image_array( int $id ): array {
			$metadata = wp_get_attachment_metadata( $id );
			$sizes    = [];

			foreach ( get_intermediate_image_sizes() as $size ) {
				$sizes[ $size ] = wp_get_attachment_image_url( $id, $size );
			}

			return [
				'id'     => $id,
				'url'    => wp_get_attachment_image_url( $id, 'full' ),
				'alt'    => get_post_meta( $id, '_wp_attachment_image_alt', true ) ?: '',
				'title'  => get_the_title( $id ),
				'width'  => $metadata['width'] ?? 0,
				'height' => $metadata['height'] ?? 0,
				'sizes'  => $sizes,
			];
		}

		/**
		 * Build structured file array
		 */
		private function build_file_array( int $id ): array {
			return [
				'id'        => $id,
				'url'       => wp_get_attachment_url( $id ),
				'title'     => get_the_title( $id ),
				'filename'  => basename( get_attached_file( $id ) ),
				'mime_type' => get_post_mime_type( $id ),
			];
		}

		/**
		 * Find field config by key and context
		 */
		private function find_field_config( string $key, string $context ): array {
			$config = ConfigLoader::instance()->get_config();

			foreach ( $config as $group ) {
				// Match context
				$group_type = $group['type'] ?? 'post';
				if ( $group_type !== $context ) {
					continue;
				}

				if ( isset( $group['fields'][ $key ] ) ) {
					return $group['fields'][ $key ];
				}
			}

			return [];
		}
	}