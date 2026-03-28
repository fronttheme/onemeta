<?php
  /**
   * Field Renderer
   * Handles rendering of individual fields and repeater fields
   *
   * @package OneMeta
   */

  namespace OneMeta\Core;

  if ( ! defined( 'ABSPATH' ) ) {
    exit;
  }

  /**
   * FieldRenderer Class
   */
  class FieldRenderer {

    /**
     * Render single field
     *
     * @param int $post_id Post ID
     * @param string $group_id Group ID
     * @param string $field_id Field ID
     * @param array $field Field configuration
     */
    public static function render_field( int $post_id, string $group_id, string $field_id, array $field ): void {
      // Ensure field is an array
      if ( ! is_array( $field ) ) {
        return;
      }

      $field_name = 'onemeta_' . $field_id;
      $value      = get_post_meta( $post_id, $field_name, true );

      // Get raw meta to check if it exists
      $meta_exists = metadata_exists( 'post', $post_id, $field_name );

      // Get field type, default to 'text'
      $type = $field['type'] ?? 'text';

      // Ensure default is in correct format for checkbox fields
      if ( $type === 'checkbox' && isset( $field['default'] ) ) {
        $field['default'] = self::normalize_checkbox_default( $field['default'] );
      }

      // Only use default if meta was NEVER saved
      if ( ! $meta_exists && isset( $field['default'] ) ) {
        $value = $field['default'];
      }

      // Handle repeater fields separately
      if ( $type === 'repeater' ) {
        self::render_repeater_field( $post_id, $field_id, $field, $value );

        return;
      }

      // Render regular field
      $args = self::prepare_field_args( $field_name, $group_id, $field_id, $field, $value, $type );
      echo Renderer::instance()->render( $args );
    }

    /**
     * Prepare field arguments for rendering
     *
     * @param string $field_name Field name
     * @param string $group_id Group ID
     * @param string $field_id Field ID
     * @param array $field Field config
     * @param mixed $value Field value
     * @param string $type Field type
     *
     * @return array Field arguments
     */
    private static function prepare_field_args( string $field_name, string $group_id, string $field_id, array $field, mixed $value, string $type ): array {
      $args = [
          'id'          => $field_name,
          'name'        => 'onemeta_meta[' . $group_id . '][' . $field_id . ']',
          'value'       => $value,
          'label'       => $field['label'] ?? '',
          'description' => $field['description'] ?? '',
          'placeholder' => $field['placeholder'] ?? '',
          'class'       => $field['class'] ?? 'widefat',
          'type'        => $type,
      ];

      // Pass conditional logic to renderer
      if ( ! empty( $field['conditional'] ) ) {
        $args['conditional'] = $field['conditional'];
      }

      // Add field-specific options
      $optional_keys = [
          'choices',
          'on_text',
          'off_text',
          'button_text',
          'file_type',
          'instructions',
          'layout',
          'rows',
          'tag',
          'separator',
      ];
      foreach ( $optional_keys as $key ) {
        if ( isset( $field[ $key ] ) ) {
          $args[ $key ] = $field[ $key ];
        }
      }

      return $args;
    }

    /**
     * Normalize checkbox default value to array
     *
     * @param mixed $default Default value
     *
     * @return array Normalized array
     */
    private static function normalize_checkbox_default( mixed $default ): array {
      // Convert string default to array if needed
      if ( is_string( $default ) && ! empty( $default ) ) {
        $default = array_map( 'trim', explode( ',', $default ) );
        $default = array_filter( $default, function ( $v ) {
          return $v !== '';
        } );

        return $default;
      }

      return is_array( $default ) ? $default : [];
    }

    /**
     * Render repeater field
     *
     * @param int $post_id Post ID
     * @param string $field_id Field ID
     * @param array $field Field configuration
     * @param mixed $value Field value
     */
    private static function render_repeater_field( int $post_id, string $field_id, array $field, mixed $value ): void {
      $items = ! empty( $value ) ? $value : [];
      ?>
      <div class="onemeta-field-wrap">
        <?php if ( ! empty( $field['label'] ) ): ?>
          <label><?php echo esc_html( $field['label'] ); ?></label>
        <?php endif; ?>

        <div class="onemeta-repeater-field">
          <div class="onemeta-repeater-items" data-field="<?php echo esc_attr( $field_id ); ?>">
            <?php if ( ! empty( $items ) ): ?>
              <?php foreach ( $items as $index => $item ): ?>
                <?php self::render_repeater_row( $field_id, $field, $index, $item ); ?>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
          <button type="button" class="onemeta-btn onemeta-add-repeater-row" data-field="<?php echo esc_attr( $field_id ); ?>">
            <span class="dashicons dashicons-plus-alt2"></span> <?php echo esc_html( $field['button_text'] ?? __( 'Add Row', 'onemeta' ) ); ?>
          </button>
        </div>

        <script type="text/html" id="onemeta-repeater-template-<?php echo esc_attr( $field_id ); ?>">
          <?php self::render_repeater_row( $field_id, $field, '{{INDEX}}', [] ); ?>
        </script>
      </div>
      <?php
    }

    /**
     * Render repeater row
     *
     * @param string $field_id Field ID
     * @param array $field Field configuration
     * @param int|string $index Row index
     * @param array $data Row data
     */
    private static function render_repeater_row( string $field_id, array $field, int|string $index, array $data ): void {
      // Ensure sub_fields exists
      if ( ! isset( $field['sub_fields'] ) || ! is_array( $field['sub_fields'] ) ) {
        echo '<p>' . esc_html__( 'No sub-fields defined for this repeater.', 'onemeta' ) . '</p>';

        return;
      }

      ?>
      <div class="onemeta-repeater-row" data-index="<?php echo esc_attr( $index ); ?>">
        <div class="onemeta-repeater-row-handle">
          <span class="dashicons dashicons-move"></span>
        </div>
        <button type="button" class="onemeta-remove-repeater-row">
          <span class="dashicons dashicons-no-alt"></span>
        </button>
        <div class="onemeta-repeater-row-content">
          <?php foreach ( $field['sub_fields'] as $sub_field_config ): ?>
            <?php
            // Sub-field is the config itself, not keyed array
            if ( ! is_array( $sub_field_config ) || ! isset( $sub_field_config['key'] ) ) {
              continue;
            }

            $sub_id    = $sub_field_config['key'];
            $sub_value = $data[ $sub_id ] ?? ( $sub_field_config['default'] ?? '' );
            $sub_type  = $sub_field_config['type'] ?? 'text';

            // Normalize checkbox defaults
            if ( $sub_type === 'checkbox' && isset( $sub_field_config['default'] ) ) {
              $sub_field_config['default'] = self::normalize_checkbox_default( $sub_field_config['default'] );
              // Also normalize existing value
              if ( is_string( $sub_value ) ) {
                $sub_value = self::normalize_checkbox_default( $sub_value );
              }
            }

            $sub_args = [
                'id'          => $field_id . '_' . $index . '_' . $sub_id,
                'name'        => 'onemeta_repeater[' . $field_id . '][' . $index . '][' . $sub_id . ']',
                'value'       => $sub_value,
                'label'       => $sub_field_config['label'] ?? '',
                'description' => $sub_field_config['description'] ?? '',
                'placeholder' => $sub_field_config['placeholder'] ?? '',
                'class'       => 'widefat',
                'type'        => $sub_type,
            ];

            // Pass choices for select/checkbox/radio/button_group
            if ( isset( $sub_field_config['choices'] ) ) {
              $sub_args['choices'] = $sub_field_config['choices'];
            }

            // Pass toggle field text labels
            if ( $sub_type === 'toggle' ) {
              if ( isset( $sub_field_config['on_text'] ) ) {
                $sub_args['on_text'] = $sub_field_config['on_text'];
              }
              if ( isset( $sub_field_config['off_text'] ) ) {
                $sub_args['off_text'] = $sub_field_config['off_text'];
              }
            }

            // Pass layout for checkbox/radio
            if ( isset( $sub_field_config['layout'] ) ) {
              $sub_args['layout'] = $sub_field_config['layout'];
            }

            echo Renderer::instance()->render( $sub_args );
            ?>
          <?php endforeach; ?>
        </div>
      </div>
      <?php
    }
  }