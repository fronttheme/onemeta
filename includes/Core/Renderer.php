<?php
  /**
   * Field Renderer
   * Renders various field types with consistent markup
   *
   * @package OneMeta
   */

  namespace OneMeta\Core;

  if ( ! defined( 'ABSPATH' ) ) {
    exit;
  }

  /**
   * Renderer Class
   */
  class Renderer {

    /**
     * Instance
     *
     * @var Renderer|null
     */
    private static ?Renderer $instance = null;

    /**
     * Get instance
     *
     * @return Renderer|null
     */
    public static function instance(): ?Renderer {
      if ( null === self::$instance ) {
        self::$instance = new self();
      }

      return self::$instance;
    }

    /**
     * Get conditional data attribute
     */
    private function get_conditional_attr( $args ): string {
      if ( ! empty( $args['conditional'] ) ) {
        $conditional_data = json_encode( $args['conditional'] );

        return ' data-conditional="' . esc_attr( $conditional_data ) . '"';
      }

      return '';
    }

    /**
     * Render field by type
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function render( array $args ): string {
      $type   = $args['type'] ?? 'text';
      $method = str_replace( '-', '_', $type );

      if ( method_exists( $this, $method ) ) {
        return $this->$method( $args );
      }

      return $this->text( $args );
    }

    /**
     * Render heading field (display only, no input)
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function heading( array $args ): string {
      $defaults = [
          'label'       => '',
          'description' => '',
          'tag'         => 'h3',
          'separator'   => '0',
      ];

      $args      = wp_parse_args( $args, $defaults );
      $tag       = in_array( $args['tag'], [ 'h2', 'h3', 'h4', 'h5', 'h6', 'p' ] ) ? $args['tag'] : 'h3';
      $separator = $args['separator'] === '1' || $args['separator'] === true;

      ob_start();
      ?>
      <div class="onemeta-field-wrap onemeta-heading-field">
      <<?php echo $tag; ?> class="onemeta-heading-field__title">
      <?php echo esc_html( $args['label'] ); ?>
      </<?php echo $tag; ?>>
      <?php if ( ! empty( $args['description'] ) ): ?>
        <p class="description onemeta-heading-field__desc">
          <?php echo wp_kses_post( $args['description'] ); ?>
        </p>
      <?php endif; ?>
      <?php if ( $separator ): ?>
        <hr class="onemeta-heading-field__separator">
      <?php endif; ?>
      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render text field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function text( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '',
          'label'       => '',
          'description' => '',
          'placeholder' => '',
          'class'       => 'regular-text',
          'required'    => false,
      ];

      $args = wp_parse_args( $args, $defaults );

      ob_start();
      ?>
      <div class="onemeta-field-wrap" <?php echo $this->get_conditional_attr( $args ); ?>>
        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label for="<?php echo esc_attr( $args['id'] ); ?>">
              <?php echo esc_html( $args['label'] ); ?>
              <?php if ( $args['required'] ): ?>
                <span class="required">*</span>
              <?php endif; ?>
            </label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>
        <input type="text"
               id="<?php echo esc_attr( $args['id'] ); ?>"
               name="<?php echo esc_attr( $args['name'] ); ?>"
               value="<?php echo esc_attr( $args['value'] ); ?>"
               placeholder="<?php echo esc_attr( $args['placeholder'] ); ?>"
               class="<?php echo esc_attr( $args['class'] ); ?>"
            <?php echo $args['required'] ? 'required' : ''; ?> />
      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render URL field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function url( array $args ): string {
      $args['class'] = $args['class'] ?? 'regular-text';
      ob_start();
      ?>
      <div class="onemeta-field-wrap" <?php echo $this->get_conditional_attr( $args ); ?>>
        <div class="onemeta-field-title">
          <?php if ( ! empty( $args['label'] ) ): ?>
            <label for="<?php echo esc_attr( $args['id'] ); ?>">
              <?php echo esc_html( $args['label'] ); ?>
            </label>
          <?php endif; ?>
          <?php if ( ! empty( $args['description'] ) ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>
        <input type="url"
               id="<?php echo esc_attr( $args['id'] ); ?>"
               name="<?php echo esc_attr( $args['name'] ); ?>"
               value="<?php echo esc_url( $args['value'] ); ?>"
               placeholder="<?php echo esc_attr( $args['placeholder'] ?? '' ); ?>"
               class="<?php echo esc_attr( $args['class'] ); ?>"/>
      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render textarea field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function textarea( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '',
          'label'       => '',
          'description' => '',
          'placeholder' => '',
          'rows'        => 4,
          'class'       => 'large-text',
      ];

      $args = wp_parse_args( $args, $defaults );

      ob_start();
      ?>
      <div class="onemeta-field-wrap" <?php echo $this->get_conditional_attr( $args ); ?>>
        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label for="<?php echo esc_attr( $args['id'] ); ?>">
              <?php echo esc_html( $args['label'] ); ?>
            </label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>

        <textarea id="<?php echo esc_attr( $args['id'] ); ?>"
                  name="<?php echo esc_attr( $args['name'] ); ?>"
                  rows="<?php echo esc_attr( $args['rows'] ); ?>"
                  placeholder="<?php echo esc_attr( $args['placeholder'] ); ?>"
                  class="<?php echo esc_attr( $args['class'] ); ?>"><?php echo esc_textarea( $args['value'] ); ?></textarea>
      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render image upload field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function image( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '', // Image ID
          'label'       => '',
          'description' => '',
          'button_text' => __( 'Select Image', 'onemeta' ),
          'remove_text' => __( 'Remove', 'onemeta' ),
      ];

      $args      = wp_parse_args( $args, $defaults );
      $image_id  = $args['value'];
      $image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'medium' ) : '';

      ob_start();
      ?>
      <div class="onemeta-field-wrap onemeta-image-field" <?php echo $this->get_conditional_attr( $args ); ?>>
        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label><?php echo esc_html( $args['label'] ); ?></label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>

        <div class="onemeta-field-content">
          <div class="onemeta-image-preview" <?php echo $image_url ? '' : 'style="display:none;"'; ?>>
            <img src="<?php echo esc_url( $image_url ); ?>" alt=""/>
          </div>

          <div class="onemeta-image-controls">
            <button type="button" class="onemeta-btn onemeta-btn--primary onemeta-upload-image">
              <?php echo esc_html( $args['button_text'] ); ?>
            </button>
            <button type="button" class="onemeta-btn onemeta-btn--danger onemeta-remove-image" <?php echo $image_url ? '' : 'style="display:none;"'; ?>>
              <?php echo esc_html( $args['remove_text'] ); ?>
            </button>
          </div>

          <input type="hidden"
                 id="<?php echo esc_attr( $args['id'] ); ?>"
                 name="<?php echo esc_attr( $args['name'] ); ?>"
                 value="<?php echo esc_attr( $image_id ); ?>"/>
        </div>

      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Get file type configuration
     *
     * @param string $file_type File type
     *
     * @return array
     */
    private function get_file_type_config( string $file_type ): array {
      $configs = [
          'video'       => [
              'title'       => __( 'Select Video', 'onemeta' ),
              'button'      => __( 'Use Video', 'onemeta' ),
              'mime_types'  => [ 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime' ],
              'extensions'  => [ 'mp4', 'webm', 'ogv', 'mov' ],
              'icon'        => 'dashicons-video-alt3',
              'description' => __( 'Supported formats: MP4, WEBM, OGV, MOV', 'onemeta' ),
          ],
          'audio'       => [
              'title'       => __( 'Select Audio', 'onemeta' ),
              'button'      => __( 'Use Audio', 'onemeta' ),
              'mime_types'  => [ 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3' ],
              'extensions'  => [ 'mp3', 'wav', 'ogg' ],
              'icon'        => 'dashicons-format-audio',
              'description' => __( 'Supported formats: MP3, WAV, OGG', 'onemeta' ),
          ],
          'document'    => [
              'title'       => __( 'Select Document', 'onemeta' ),
              'button'      => __( 'Use Document', 'onemeta' ),
              'mime_types'  => [
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'text/plain'
              ],
              'extensions'  => [ 'pdf', 'doc', 'docx', 'txt' ],
              'icon'        => 'dashicons-media-document',
              'description' => __( 'Supported formats: PDF, DOC, DOCX, TXT', 'onemeta' ),
          ],
          'archive'     => [
              'title'       => __( 'Select Archive', 'onemeta' ),
              'button'      => __( 'Use Archive', 'onemeta' ),
              'mime_types'  => [ 'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed' ],
              'extensions'  => [ 'zip', 'rar', '7z' ],
              'icon'        => 'dashicons-archive',
              'description' => __( 'Supported formats: ZIP, RAR, 7Z', 'onemeta' ),
          ],
          'font'        => [
              'title'       => __( 'Select Font', 'onemeta' ),
              'button'      => __( 'Use Font', 'onemeta' ),
              'mime_types'  => [ 'font/woff', 'font/woff2', 'font/ttf', 'font/otf' ],
              'extensions'  => [ 'woff', 'woff2', 'ttf', 'otf' ],
              'icon'        => 'dashicons-editor-textcolor',
              'description' => __( 'Supported formats: WOFF, WOFF2, TTF, OTF', 'onemeta' ),
          ],
          'spreadsheet' => [
              'title'       => __( 'Select Spreadsheet', 'onemeta' ),
              'button'      => __( 'Use Spreadsheet', 'onemeta' ),
              'mime_types'  => [
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'text/csv'
              ],
              'extensions'  => [ 'xls', 'xlsx', 'csv' ],
              'icon'        => 'dashicons-media-spreadsheet',
              'description' => __( 'Supported formats: XLS, XLSX, CSV', 'onemeta' ),
          ],
          'any'         => [
              'title'       => __( 'Select File', 'onemeta' ),
              'button'      => __( 'Use File', 'onemeta' ),
              'mime_types'  => [],
              'extensions'  => [],
              'icon'        => 'dashicons-media-default',
              'description' => __( 'All file types supported', 'onemeta' ),
          ],
      ];

      return $configs[ $file_type ] ?? $configs['any'];
    }

    /**
     * Render file upload field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function file( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '', // File URL
          'label'       => '',
          'description' => '',
          'button_text' => __( 'Select File', 'onemeta' ),
          'remove_text' => __( 'Remove', 'onemeta' ),
          'file_type'   => 'any', // video, audio, document, archive, font, spreadsheet, any
      ];

      $args = wp_parse_args( $args, $defaults );

      // Get file type config
      $file_config = $this->get_file_type_config( $args['file_type'] );

      $file_id   = is_numeric( $args['value'] ) ? (int) $args['value'] : 0;
      $file_url  = $file_id ? wp_get_attachment_url( $file_id ) : $args['value'];
      $file_name = $file_url ? basename( $file_url ) : '';
      $file_ext  = $file_url ? pathinfo( $file_url, PATHINFO_EXTENSION ) : '';

      ob_start();
      ?>
      <div class="onemeta-field-wrap onemeta-file-field" data-file-type="<?php echo esc_attr( $args['file_type'] ); ?>" <?php echo $this->get_conditional_attr( $args ); ?>>

        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label><?php echo esc_html( $args['label'] ); ?></label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>

        <div class="onemeta-field-content">
          <div class="onemeta-file-info" <?php echo $file_url ? '' : 'style="display:none;"'; ?>>
            <span class="dashicons <?php echo esc_attr( $file_config['icon'] ); ?>"></span>
            <span class="onemeta-file-name"><?php echo esc_html( $file_name ); ?></span>
            <?php if ( $file_ext ): ?>
              <span class="onemeta-file-ext">.<?php echo esc_html( strtoupper( $file_ext ) ); ?></span>
            <?php endif; ?>
          </div>

          <div class="onemeta-file-controls">
            <button type="button"
                    class="onemeta-btn onemeta-upload-file"
                    data-title="<?php echo esc_attr( $file_config['title'] ); ?>"
                    data-button-text="<?php echo esc_attr( $file_config['button'] ); ?>"
                    data-mime-types="<?php echo esc_attr( wp_json_encode( $file_config['mime_types'] ) ); ?>">
              <span class="dashicons <?php echo esc_attr( $file_config['icon'] ); ?>"></span>
              <?php echo esc_html( $args['button_text'] ); ?>
            </button>
            <button type="button" class="onemeta-btn onemeta-btn--danger onemeta-remove-file" <?php echo $file_url ? '' : 'style="display:none;"'; ?>>
              <?php echo esc_html( $args['remove_text'] ); ?>
            </button>
          </div>

          <?php if ( $file_config['description'] ): ?>
            <p class="description onemeta-field-file-desc"><?php echo esc_html( $file_config['description'] ); ?></p>
          <?php endif; ?>

          <input type="hidden"
                 id="<?php echo esc_attr( $args['id'] ); ?>"
                 name="<?php echo esc_attr( $args['name'] ); ?>"
                 value="<?php echo esc_attr( $args['value'] ); ?>"/>
        </div>

      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render gallery field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function gallery( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => [], // Array of image IDs
          'label'       => '',
          'description' => '',
          'button_text' => __( 'Add Images', 'onemeta' ),
      ];

      $args = wp_parse_args( $args, $defaults );

      // Handle different value formats
      $image_ids = [];
      if ( ! empty( $args['value'] ) ) {
        if ( is_string( $args['value'] ) ) {
          $image_ids = array_filter( explode( ',', $args['value'] ) );
        } elseif ( is_array( $args['value'] ) ) {
          $image_ids = array_filter( $args['value'] );
        }
      }

      ob_start();
      ?>
      <div class="onemeta-field-wrap onemeta-gallery-field" <?php echo $this->get_conditional_attr( $args ); ?>>

        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label><?php echo esc_html( $args['label'] ); ?></label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>

        <div class="onemeta-field-content">
          <div class="onemeta-gallery-preview">
            <?php if ( ! empty( $image_ids ) ): ?>
              <?php foreach ( $image_ids as $image_id ): ?>
                <?php if ( $image_id ): ?>
                  <div class="onemeta-gallery-item" data-id="<?php echo esc_attr( $image_id ); ?>">
                    <?php
                      $img_url = wp_get_attachment_image_url( $image_id, 'thumbnail' );
                      if ( $img_url ):
                        ?>
                        <img src="<?php echo esc_url( $img_url ); ?>" alt=""/>
                      <?php endif; ?>
                    <button type="button" class="onemeta-btn onemeta-remove-gallery-item">
                      <span class="dashicons dashicons-no-alt"></span></button>
                  </div>
                <?php endif; ?>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>

          <button type="button" class="onemeta-btn onemeta-add-gallery-images">
            <span class="dashicons dashicons-plus-alt2"></span> <?php echo esc_html( $args['button_text'] ); ?>
          </button>

          <input type="hidden"
                 id="<?php echo esc_attr( $args['id'] ); ?>"
                 name="<?php echo esc_attr( $args['name'] ); ?>"
                 value="<?php echo esc_attr( is_array( $image_ids ) ? implode( ',', $image_ids ) : '' ); ?>"/>
        </div>

      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render toggle field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function toggle( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '0',
          'label'       => '',
          'description' => '',
          'on_text'     => __( 'Enable', 'onemeta' ),
          'off_text'    => __( 'Disable', 'onemeta' ),
      ];

      $args    = wp_parse_args( $args, $defaults );
      $checked = ( $args['value'] == '1' || $args['value'] === true );

      ob_start();
      ?>
      <div class="onemeta-field-wrap onemeta-toggle-field" <?php echo $this->get_conditional_attr( $args ); ?>>

        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label class="onemeta-toggle-label" for="<?php echo esc_attr( $args['id'] ); ?>"><span class="onemeta-toggle-title"><?php echo esc_html( $args['label'] ); ?></span></label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>

        <div class="onemeta-toggle-switch">
          <input type="checkbox"
                 id="<?php echo esc_attr( $args['id'] ); ?>"
                 name="<?php echo esc_attr( $args['name'] ); ?>"
                 value="1"
              <?php checked( $checked ); ?> />
          <span class="onemeta-toggle-slider">
            <span class="onemeta-toggle-on"><?php echo esc_html( $args['on_text'] ); ?></span>
            <span class="onemeta-toggle-off"><?php echo esc_html( $args['off_text'] ); ?></span>
          </span>
        </div>

      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render checkbox field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function checkbox( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => [],
          'label'       => '',
          'description' => '',
          'choices'     => [],
          'layout'      => 'vertical',
          'default'     => [],
      ];

      $args = wp_parse_args( $args, $defaults );

      // Normalize value to array
      if ( is_string( $args['value'] ) && ! empty( $args['value'] ) ) {
        $args['value'] = array_map( 'trim', explode( ',', $args['value'] ) );
        $args['value'] = array_filter( $args['value'], function ( $v ) {
          return $v !== '';
        } );
      } elseif ( ! is_array( $args['value'] ) ) {
        $args['value'] = [];
      }

      // Normalize default to array
      if ( is_string( $args['default'] ) && ! empty( $args['default'] ) ) {
        $args['default'] = array_map( 'trim', explode( ',', $args['default'] ) );
        $args['default'] = array_filter( $args['default'], function ( $v ) {
          return $v !== '';
        } );
      } elseif ( ! is_array( $args['default'] ) ) {
        $args['default'] = [];
      }

      // Empty check - value is truly empty if it's an empty array or contains only empty strings
      $value_is_empty = empty( $args['value'] ) ||
                        ( count( $args['value'] ) === 1 && trim( $args['value'][0] ) === '' );

      // Use defaults only if value is truly empty
      if ( $value_is_empty && ! empty( $args['default'] ) ) {
        $args['value'] = $args['default'];
      }

      ob_start();
      ?>
      <div class="onemeta-field-wrap onemeta-checkbox-field"<?php echo $this->get_conditional_attr( $args ); ?>>

        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label><?php echo esc_html( $args['label'] ); ?></label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>

        <div class="onemeta-checkbox-group onemeta-layout-<?php echo esc_attr( $args['layout'] ); ?>">
          <?php if ( ! empty( $args['choices'] ) ): ?>
            <?php foreach ( $args['choices'] as $choice_value => $choice_label ): ?>
              <label class="onemeta-checkbox-option">
                <input type="checkbox"
                       name="<?php echo esc_attr( $args['name'] ); ?>[]"
                       value="<?php echo esc_attr( $choice_value ); ?>"
                    <?php checked( in_array( $choice_value, $args['value'] ) ); ?> />
                <span><?php echo esc_html( $choice_label ); ?></span>
              </label>
            <?php endforeach; ?>
          <?php else: ?>
            <p class="description"><?php _e( 'No choices defined', 'onemeta' ); ?></p>
          <?php endif; ?>
        </div>

      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render select field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function select( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '',
          'label'       => '',
          'description' => '',
          'choices'     => [],
          'class'       => '',
      ];

      $args = wp_parse_args( $args, $defaults );

      ob_start();
      ?>
      <div class="onemeta-field-wrap" <?php echo $this->get_conditional_attr( $args ); ?>>
        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label for="<?php echo esc_attr( $args['id'] ); ?>">
              <?php echo esc_html( $args['label'] ); ?>
            </label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>
        <select id="<?php echo esc_attr( $args['id'] ); ?>"
                name="<?php echo esc_attr( $args['name'] ); ?>"
                class="<?php echo esc_attr( $args['class'] ); ?>">
          <?php foreach ( $args['choices'] as $key => $label ): ?>
            <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $args['value'], $key ); ?>>
              <?php echo esc_html( $label ); ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render button group field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function button_group( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '',
          'label'       => '',
          'description' => '',
          'choices'     => [],
      ];

      $args = wp_parse_args( $args, $defaults );

      ob_start();
      ?>
      <div class="onemeta-field-wrap onemeta-button-group-field" <?php echo $this->get_conditional_attr( $args ); ?>>

        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label><?php echo esc_html( $args['label'] ); ?></label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>

        <div class="onemeta-button-group-type">
          <?php foreach ( $args['choices'] as $key => $label ): ?>
            <label class="onemeta-button-option <?php echo ( $args['value'] == $key ) ? 'active' : ''; ?>">
              <input type="radio"
                     name="<?php echo esc_attr( $args['name'] ); ?>"
                     value="<?php echo esc_attr( $key ); ?>"
                  <?php checked( $args['value'], $key ); ?> />
              <span><?php echo esc_html( $label ); ?></span>
            </label>
          <?php endforeach; ?>
        </div>

      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render radio field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function radio( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '',
          'label'       => '',
          'description' => '',
          'choices'     => [],
          'layout'      => 'horizontal', // horizontal or vertical
      ];

      $args = wp_parse_args( $args, $defaults );

      ob_start();
      ?>
      <div class="onemeta-field-wrap onemeta-radio-field onemeta-radio-<?php echo esc_attr( $args['layout'] ); ?>" <?php echo $this->get_conditional_attr( $args ); ?>>

        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label><?php echo esc_html( $args['label'] ); ?></label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>

        <div class="onemeta-radio-options">
          <?php foreach ( $args['choices'] as $key => $label ): ?>
            <label class="onemeta-radio-option">
              <input type="radio"
                     name="<?php echo esc_attr( $args['name'] ); ?>"
                     value="<?php echo esc_attr( $key ); ?>"
                  <?php checked( $args['value'], $key ); ?> />
              <span class="onemeta-radio-label"><?php echo wp_kses_post( $label ); ?></span>
            </label>
          <?php endforeach; ?>
        </div>

      </div>
      <?php
      return ob_get_clean();
    }

    /**
     * Render date field
     *
     * @param array $args Field arguments
     *
     * @return string
     */
    public function date( array $args ): string {
      $defaults = [
          'id'          => '',
          'name'        => '',
          'value'       => '',
          'label'       => '',
          'description' => '',
          'placeholder' => '',
          'class'       => 'regular-text',
      ];

      $args = wp_parse_args( $args, $defaults );

      ob_start();
      ?>
      <div class="onemeta-field-wrap"<?php echo $this->get_conditional_attr( $args ); ?>>
        <div class="onemeta-field-title">
          <?php if ( $args['label'] ): ?>
            <label for="<?php echo esc_attr( $args['id'] ); ?>">
              <?php echo esc_html( $args['label'] ); ?>
            </label>
          <?php endif; ?>
          <?php if ( $args['description'] ): ?>
            <p class="description"><?php echo wp_kses_post( $args['description'] ); ?></p>
          <?php endif; ?>
        </div>
        <input type="date"
               id="<?php echo esc_attr( $args['id'] ); ?>"
               name="<?php echo esc_attr( $args['name'] ); ?>"
               value="<?php echo esc_attr( $args['value'] ); ?>"
               placeholder="<?php echo esc_attr( $args['placeholder'] ); ?>"
               class="<?php echo esc_attr( $args['class'] ); ?> onemeta-date-field"/>
        <!-- Hidden field to track clearing -->
        <input type="hidden"
               name="<?php echo esc_attr( preg_replace( '/\[([^]]+)]$/', '[\\1_cleared]', $args['name'] ) ); ?>"
               class="onemeta-date-cleared"
               value="0"/>
      </div>
      <?php
      return ob_get_clean();
    }

  }