<?php
	/**
	 * Field Type Schemas
	 * Defines what settings each field type needs
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Admin;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	class FieldTypeSchemas {

		/**
		 * Get schema for a field type
		 *
		 * @param string $type Field type
		 *
		 * @return array Settings schema
		 */
		public static function get_schema( string $type ): array {
			$schemas = self::get_all_schemas();

			return $schemas[ $type ] ?? [];
		}

		/**
		 * Get all field type schemas
		 *
		 * @return array
		 */
		public static function get_all_schemas(): array {
			$schemas = [
				// Basic Fields
				'text' => [
					'default'   => [
						'type'        => 'text',
						'label'       => __( 'Default Value', 'onemeta' ),
						'placeholder' => __( 'Enter default value', 'onemeta' ),
					],
					'maxlength' => [
						'type'        => 'number',
						'label'       => __( 'Max Length', 'onemeta' ),
						'placeholder' => '255',
					],
				],

				'textarea' => [
					'default'   => [
						'type'  => 'textarea',
						'label' => __( 'Default Value', 'onemeta' ),
						'rows'  => 3,
					],
					'rows'      => [
						'type'    => 'number',
						'label'   => __( 'Rows', 'onemeta' ),
						'default' => '4',
					],
					'maxlength' => [
						'type'        => 'number',
						'label'       => __( 'Max Length', 'onemeta' ),
						'placeholder' => '1000',
					],
				],

				'url' => [
					'default' => [
						'type'        => 'url',
						'label'       => __( 'Default Value', 'onemeta' ),
						'placeholder' => 'https://example.com',
					],
				],

				'email' => [
					'default' => [
						'type'        => 'email',
						'label'       => __( 'Default Value', 'onemeta' ),
						'placeholder' => 'email@example.com',
					],
				],

				'date'   => [
					'default' => [
						'type'  => 'date',
						'label' => __( 'Default Value', 'onemeta' ),
					],
				],

				// Choice Fields
				'toggle' => [
					'default'  => [
						'type'    => 'toggle',
						'label'   => __( 'Default State', 'onemeta' ),
						'choices' => [
							'0' => __( 'Off', 'onemeta' ),
							'1' => __( 'On', 'onemeta' ),
						],
						'default' => '0',
					],
					'on_text'  => [
						'type'    => 'text',
						'label'   => __( 'On Text', 'onemeta' ),
						'default' => __( 'On', 'onemeta' ),
					],
					'off_text' => [
						'type'    => 'text',
						'label'   => __( 'Off Text', 'onemeta' ),
						'default' => __( 'Off', 'onemeta' ),
					],
				],

				'checkbox' => [
					'choices'     => [
						'type'         => 'choices',
						'label'        => __( 'Choices', 'onemeta' ),
						'instructions' => __( 'Enter each choice on a new row (key : Label)', 'onemeta' ),
					],
					'default'     => [
						'type'         => 'text',
						'label'        => __( 'Default Values (Enter comma-separated values (e.g., red, green))', 'onemeta' ),
						'instructions' => __( 'Enter comma-separated values (e.g., red, green)', 'onemeta' ),
					],
					'layout'      => [
						'type'    => 'select',
						'label'   => __( 'Layout', 'onemeta' ),
						'choices' => [
							'vertical'   => __( 'Vertical', 'onemeta' ),
							'horizontal' => __( 'Horizontal', 'onemeta' ),
						],
						'default' => 'vertical',
					],
					'conditional' => [
						'type'         => 'conditional_logic',
						'label'        => __( 'Conditional Logic', 'onemeta' ),
						'instructions' => __( 'Control when this field is visible', 'onemeta' ),
					],
				],

				'select' => [
					'choices'    => [
						'type'         => 'choices',
						'label'        => __( 'Choices', 'onemeta' ),
						'instructions' => __( 'Enter each choice on a new line. Use format: value : Label', 'onemeta' ),
					],
					'default'    => [
						'type'  => 'text',
						'label' => __( 'Default Value', 'onemeta' ),
					],
					'allow_null' => [
						'type'    => 'toggle',
						'label'   => __( 'Allow Null', 'onemeta' ),
						'default' => '0',
					],
				],

				'radio' => [
					'choices' => [
						'type'         => 'choices',
						'label'        => __( 'Choices', 'onemeta' ),
						'instructions' => __( 'Enter each choice on a new line. Use format: value : Label', 'onemeta' ),
					],
					'default' => [
						'type'  => 'text',
						'label' => __( 'Default Value', 'onemeta' ),
					],
					'layout'  => [
						'type'    => 'select',
						'label'   => __( 'Layout', 'onemeta' ),
						'choices' => [
							'vertical'   => __( 'Vertical', 'onemeta' ),
							'horizontal' => __( 'Horizontal', 'onemeta' ),
						],
						'default' => 'vertical',
					],
				],

				'button_group' => [
					'choices' => [
						'type'         => 'choices',
						'label'        => __( 'Choices', 'onemeta' ),
						'instructions' => __( 'Enter each choice on a new line. Use format: value : Label', 'onemeta' ),
					],
					'default' => [
						'type'  => 'text',
						'label' => __( 'Default Value', 'onemeta' ),
					],
				],

				// Media Fields
				'image'        => [
					'return_format' => [
						'type'    => 'select',
						'label'   => __( 'Return Format', 'onemeta' ),
						'choices' => [
							'id'    => __( 'Image ID', 'onemeta' ),
							'url'   => __( 'Image URL', 'onemeta' ),
							'array' => __( 'Image Array', 'onemeta' ),
						],
						'default' => 'id',
					],
					'preview_size'  => [
						'type'    => 'select',
						'label'   => __( 'Preview Size', 'onemeta' ),
						'choices' => [
							'thumbnail' => __( 'Thumbnail', 'onemeta' ),
							'medium'    => __( 'Medium', 'onemeta' ),
							'large'     => __( 'Large', 'onemeta' ),
						],
						'default' => 'medium',
					],
				],

				'file' => [
					'button_text'   => [
						'type'    => 'text',
						'label'   => __( 'Button Text', 'onemeta' ),
						'default' => __( 'Select File', 'onemeta' ),
					],
					'file_type'     => [
						'type'    => 'select',
						'label'   => __( 'File Type', 'onemeta' ),
						'choices' => [
							'any'         => __( 'Any', 'onemeta' ),
							'video'       => __( 'Video (MP4, WEBM, OGV, MOV)', 'onemeta' ),
							'audio'       => __( 'Audio (MP3, WAV, OGG)', 'onemeta' ),
							'document'    => __( 'Document (PDF, DOC, DOCX, TXT)', 'onemeta' ),
							'archive'     => __( 'Archive (ZIP, RAR, 7Z)', 'onemeta' ),
							'font'        => __( 'Font (WOFF, WOFF2, TTF, OTF)', 'onemeta' ),
							'spreadsheet' => __( 'Spreadsheet (XLS, XLSX, CSV)', 'onemeta' ),
						],
						'default' => 'any',
					],
					'return_format' => [
						'type'    => 'select',
						'label'   => __( 'Return Format', 'onemeta' ),
						'choices' => [
							'id'    => __( 'File ID', 'onemeta' ),
							'url'   => __( 'File URL', 'onemeta' ),
							'array' => __( 'File Array', 'onemeta' ),
						],
						'default' => 'id',
					],
				],

				'gallery' => [
					'button_text'   => [
						'type'    => 'text',
						'label'   => __( 'Button Text', 'onemeta' ),
						'default' => __( 'Add Images', 'onemeta' ),
					],
					'min'           => [
						'type'        => 'number',
						'label'       => __( 'Minimum Images', 'onemeta' ),
						'placeholder' => '0',
					],
					'max'           => [
						'type'        => 'number',
						'label'       => __( 'Maximum Images', 'onemeta' ),
						'placeholder' => __( 'Unlimited', 'onemeta' ),
					],
					'return_format' => [
						'type'    => 'select',
						'label'   => __( 'Return Format', 'onemeta' ),
						'choices' => [
							'ids'   => __( 'Image IDs', 'onemeta' ),
							'urls'  => __( 'Image URLs', 'onemeta' ),
							'array' => __( 'Image Arrays', 'onemeta' ),
						],
						'default' => 'ids',
					],
				],

				'repeater' => [
					'button_text' => [
						'type'        => 'text',
						'label'       => __( 'Button Text', 'onemeta' ),
						'placeholder' => __( 'Add Item', 'onemeta' ),
						'default'     => __( 'Add Item', 'onemeta' ),
					],
					'min_rows'    => [
						'type'        => 'number',
						'label'       => __( 'Minimum Rows', 'onemeta' ),
						'placeholder' => '0',
						'default'     => 0,
					],
					'max_rows'    => [
						'type'        => 'number',
						'label'       => __( 'Maximum Rows', 'onemeta' ),
						'placeholder' => __( 'No limit', 'onemeta' ),
					],
					'sub_fields'  => [
						'type'         => 'repeater_sub_fields',
						'label'        => __( 'Sub Fields', 'onemeta' ),
						'instructions' => __( 'Add fields that will appear in each row', 'onemeta' ),
					],
					'conditional' => [
						'type'         => 'conditional_logic',
						'label'        => __( 'Conditional Logic', 'onemeta' ),
						'instructions' => __( 'Control when this field is visible', 'onemeta' ),
					],
				],

			];

			// Add conditional logic to all field types
			return self::add_conditional_to_all( $schemas );
		}

		/**
		 * Get field type groups for UI
		 *
		 * @return array
		 */
		public static function get_field_type_groups(): array {
			return [
				'Basic'    => [
					'text'     => __( 'Text', 'onemeta' ),
					'textarea' => __( 'Textarea', 'onemeta' ),
					'url'      => __( 'URL', 'onemeta' ),
					'email'    => __( 'Email', 'onemeta' ),
					'date'     => __( 'Date', 'onemeta' ),
				],
				'Choice'   => [
					'toggle'       => __( 'Toggle', 'onemeta' ),
					'select'       => __( 'Select', 'onemeta' ),
					'radio'        => __( 'Radio', 'onemeta' ),
					'button_group' => __( 'Button Group', 'onemeta' ),
					'checkbox'     => __( 'Checkbox', 'onemeta' ),
				],
				'Media'    => [
					'image'   => __( 'Image', 'onemeta' ),
					'file'    => __( 'File', 'onemeta' ),
					'gallery' => __( 'Gallery', 'onemeta' ),
				],
				'Advanced' => [
					'repeater' => __( 'Repeater', 'onemeta' ),
				],
			];
		}

		/**
		 * Get all field types as flat array
		 *
		 * @return array
		 */
		public static function get_all_field_types(): array {
			$groups = self::get_field_type_groups();
			$types  = [];

			foreach ( $groups as $group => $group_types ) {
				$types = array_merge( $types, $group_types );
			}

			return $types;
		}

		/**
		 * Add conditional logic to all field types
		 */
		private static function add_conditional_to_all( $schemas ): array {
			$conditional_setting = [
				'type'         => 'conditional_logic',
				'label'        => __( 'Conditional Logic', 'onemeta' ),
				'instructions' => __( 'Control when this field is visible', 'onemeta' ),
			];

			foreach ( $schemas as $type => $settings ) {
				$schemas[ $type ]['conditional'] = $conditional_setting;
			}

			return $schemas;
		}

	}