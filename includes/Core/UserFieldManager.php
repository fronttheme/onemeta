<?php
  /**
   * User Field Manager
   * Handles user profile fields rendering and saving
   *
   * @package OneMeta
   */

  namespace OneMeta\Core;

  use WP_User;

  if ( ! defined( 'ABSPATH' ) ) {
    exit;
  }

  /**
   * UserFieldManager Class
   */
  class UserFieldManager {

    /**
     * Instance
     *
     * @var UserFieldManager|null
     */
    private static ?UserFieldManager $instance = null;

    /**
     * Get instance
     *
     * @return UserFieldManager|null
     */
    public static function instance(): ?UserFieldManager {
      if ( null === self::$instance ) {
        self::$instance = new self();
      }

      return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
      add_action( 'show_user_profile', [ $this, 'render_user_fields' ] );
      add_action( 'edit_user_profile', [ $this, 'render_user_fields' ] );
      add_action( 'personal_options_update', [ $this, 'save_user_fields' ] );
      add_action( 'edit_user_profile_update', [ $this, 'save_user_fields' ] );
    }

    /**
     * Render user fields
     *
     * @param WP_User $user User object
     */
    public function render_user_fields( WP_User $user ): void {
      $config = ConfigLoader::instance()->get_config();

      // Check if there are any user fields to render
      $has_user_fields = false;
      foreach ( $config as $group ) {
        if ( isset( $group['type'] ) && $group['type'] === 'user' ) {
          $has_user_fields = true;
          break;
        }
      }

      if ( ! $has_user_fields ) {
        return;
      }

      // Start wrapper
      echo '<div class="onemeta-user-fields-wrapper">';

      foreach ( $config as $group_id => $group ) {
        // Skip if type is not set or not 'user'
        if ( ! isset( $group['type'] ) || $group['type'] !== 'user' ) {
          continue;
        }

        wp_nonce_field( 'onemeta_user_' . $group_id, 'onemeta_user_' . $group_id . '_nonce' );

        echo '<div class="onemeta-field-group" data-group-id="' . esc_attr( $group_id ) . '">';
        echo '<h2 class="onemeta-field-group__title">' . esc_html( $group['title'] ) . '</h2>';
        echo '<div class="onemeta-meta-fields">';

        foreach ( $group['fields'] as $field_id => $field ) {
          $this->render_user_field( $user->ID, $group_id, $field_id, $field );
        }

        echo '</div>'; // .onemeta-meta-fields
        echo '</div>'; // .onemeta-field-group
      }

      echo '</div>'; // .onemeta-user-fields-wrapper
    }

    /**
     * Render single user field
     *
     * @param int $user_id User ID
     * @param string $group_id Group ID
     * @param string $field_id Field ID
     * @param array $field Field config
     */
    private function render_user_field( int $user_id, string $group_id, string $field_id, array $field ): void {
      // Ensure field is an array
      if ( ! is_array( $field ) ) {
        return;
      }

      $field_name = 'onemeta_' . $field_id;
      $value      = get_user_meta( $user_id, $field_name, true );

      // Check if meta exists
      $meta_exists = metadata_exists( 'user', $user_id, $field_name );

      // Get field type, default to 'text'
      $type = $field['type'] ?? 'text';

      // Ensure default is in correct format for checkbox fields
      if ( $type === 'checkbox' && isset( $field['default'] ) ) {
        $field['default'] = $this->normalize_checkbox_default( $field['default'] );
      }

      // Only use default if meta was NEVER saved
      if ( ! $meta_exists && isset( $field['default'] ) ) {
        $value = $field['default'];
      }

      // Handle repeater fields separately
      if ( $type === 'repeater' ) {
        $this->render_repeater_field( $user_id, $group_id, $field_id, $field, $value );

        return;
      }

      // Render regular field
      $args = $this->prepare_field_args( $field_name, $group_id, $field_id, $field, $value, $type );
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
    private function prepare_field_args( string $field_name, string $group_id, string $field_id, array $field, mixed $value, string $type ): array {
      $args = [
          'id'          => $field_name,
          'name'        => 'onemeta_user[' . $group_id . '][' . $field_id . ']',
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
      $optional_keys = [ 'choices', 'on_text', 'off_text', 'button_text', 'file_type', 'layout', 'rows' ];
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
    private function normalize_checkbox_default( mixed $default ): array {
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
     * Render repeater field for user
     *
     * @param int $user_id User ID
     * @param string $group_id Group ID
     * @param string $field_id Field ID
     * @param array $field Field configuration
     * @param mixed $value Field value
     */
    private function render_repeater_field( int $user_id, string $group_id, string $field_id, array $field, mixed $value ): void {
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
                <?php $this->render_repeater_row( $group_id, $field_id, $field, $index, $item ); ?>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
          <button type="button" class="onemeta-btn onemeta-add-repeater-row" data-field="<?php echo esc_attr( $field_id ); ?>">
            <span class="dashicons dashicons-plus-alt2"></span> <?php echo esc_html( $field['button_text'] ?? __( 'Add Row', 'onemeta' ) ); ?>
          </button>
        </div>

        <script type="text/html" id="onemeta-repeater-template-<?php echo esc_attr( $field_id ); ?>">
          <?php $this->render_repeater_row( $group_id, $field_id, $field, '{{INDEX}}', [] ); ?>
        </script>
      </div>
      <?php
    }

    /**
     * Render repeater row for user
     *
     * @param string $group_id Group ID
     * @param string $field_id Field ID
     * @param array $field Field configuration
     * @param int|string $index Row index
     * @param array $data Row data
     */
    private function render_repeater_row( string $group_id, string $field_id, array $field, int|string $index, array $data ): void {
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

            $sub_args = [
                'id'          => $field_id . '_' . $index . '_' . $sub_id,
                'name'        => 'onemeta_user_repeater[' . $group_id . '][' . $field_id . '][' . $index . '][' . $sub_id . ']',
                'value'       => $sub_value,
                'label'       => $sub_field_config['label'] ?? '',
                'description' => $sub_field_config['description'] ?? '',
                'placeholder' => $sub_field_config['placeholder'] ?? '',
                'class'       => 'widefat',
                'type'        => $sub_type,
            ];

            if ( isset( $sub_field_config['choices'] ) ) {
              $sub_args['choices'] = $sub_field_config['choices'];
            }

            echo Renderer::instance()->render( $sub_args );
            ?>
          <?php endforeach; ?>
        </div>
      </div>
      <?php
    }

    /**
     * Save user fields
     *
     * @param int $user_id User ID
     */
    public function save_user_fields( int $user_id ): void {
      if ( ! current_user_can( 'edit_user', $user_id ) ) {
        return;
      }

      $config = ConfigLoader::instance()->get_config();

      foreach ( $config as $group_id => $group ) {
        // Skip if not a user field
        if ( ! isset( $group['type'] ) || $group['type'] !== 'user' ) {
          continue;
        }

        if ( ! $this->verify_user_nonce( $group_id ) ) {
          continue;
        }

        $this->save_user_group_fields( $user_id, $group_id, $group );
      }
    }

    /**
     * Verify nonce for user group
     *
     * @param string $group_id Group ID
     *
     * @return bool True if nonce is valid
     */
    private function verify_user_nonce( string $group_id ): bool {
      if ( ! isset( $_POST[ 'onemeta_user_' . $group_id . '_nonce' ] ) ) {
        return false;
      }

      return wp_verify_nonce( $_POST[ 'onemeta_user_' . $group_id . '_nonce' ], 'onemeta_user_' . $group_id );
    }

    /**
     * Save user group fields
     *
     * @param int $user_id User ID
     * @param string $group_id Group ID
     * @param array $group Group config
     */
    private function save_user_group_fields( int $user_id, string $group_id, array $group ): void {
      $data = $_POST['onemeta_user'][ $group_id ] ?? [];

      foreach ( $group['fields'] as $field_id => $field ) {
        $type = $field['type'] ?? 'text';

        // Handle repeater fields separately
        if ( $type === 'repeater' ) {
          $repeater_data   = $_POST['onemeta_user_repeater'][ $group_id ][ $field_id ] ?? [];
          $sanitized_value = $this->sanitize_repeater_data( $repeater_data, $field );
          update_user_meta( $user_id, 'onemeta_' . $field_id, $sanitized_value );
          continue;
        }

        // Handle toggle fields - if not in POST, set to '0'
        if ( $type === 'toggle' ) {
          $value = isset( $data[ $field_id ] ) ? '1' : '0';
        } else {
          $value = $data[ $field_id ] ?? '';
        }

        $sanitized_value = Sanitizer::instance()->sanitize_by_type( $value, $type, $field );
        update_user_meta( $user_id, 'onemeta_' . $field_id, $sanitized_value );
      }
    }

    /**
     * Sanitize repeater data
     *
     * @param array $data Repeater data
     * @param array $field Field configuration
     *
     * @return array Sanitized data
     */
    private function sanitize_repeater_data( array $data, array $field ): array {
      if ( empty( $data ) || ! isset( $field['sub_fields'] ) ) {
        return [];
      }

      $sanitized = [];

      foreach ( $data as $index => $row ) {
        if ( ! is_array( $row ) ) {
          continue;
        }

        $sanitized_row = [];

        foreach ( $field['sub_fields'] as $sub_field_config ) {
          if ( ! isset( $sub_field_config['key'] ) ) {
            continue;
          }

          $sub_id   = $sub_field_config['key'];
          $sub_type = $sub_field_config['type'] ?? 'text';

          // Handle toggle fields in repeater
          if ( $sub_type === 'toggle' ) {
            $sub_value = isset( $row[ $sub_id ] ) ? '1' : '0';
          } else {
            $sub_value = $row[ $sub_id ] ?? '';
          }

          $sanitized_row[ $sub_id ] = Sanitizer::instance()->sanitize_by_type( $sub_value, $sub_type, $sub_field_config );
        }

        $sanitized[] = $sanitized_row;
      }

      return $sanitized;
    }

  }