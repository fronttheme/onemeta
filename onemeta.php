<?php
	/**
	 * Plugin Name: OneMeta - Custom Meta Fields Made Simple
	 * Plugin URI: https://fronttheme.com/products/onemeta
	 * Description: Build powerful custom fields with a visual builder. Export as PHP code or use directly in WordPress.
	 * Version: 1.0.0
	 * Author: Faruk Ahmed
	 * Author URI: https://fronttheme.com
	 * Text Domain: onemeta
	 * Domain Path: /languages
	 * Requires at least: 6.8
	 * Requires PHP: 8.2
	 * License: GPL v2 or later
	 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
	 *
	 * @package OneMeta
	 */

	use OneMeta\Admin\Admin;
	use OneMeta\API\RestAPI;
	use OneMeta\Core\Engine;
	use OneMeta\Core\Renderer;
	use OneMeta\Core\Sanitizer;

	if ( ! defined( 'ABSPATH' ) ) {
		exit; // Exit if accessed directly
	}

	// Define plugin constants
	define( 'ONEMETA_VERSION', '1.0.0' );
	define( 'ONEMETA_PLUGIN_FILE', __FILE__ );
	define( 'ONEMETA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
	define( 'ONEMETA_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
	define( 'ONEMETA_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

	/**
	 * PSR-4 Autoloader for OneMeta
	 */
	spl_autoload_register( function ( $class ) {
		$prefix   = 'OneMeta\\';
		$base_dir = ONEMETA_PLUGIN_DIR . 'includes/';

		$len = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}

		$relative_class = substr( $class, $len );
		$file           = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';

		if ( file_exists( $file ) ) {
			require $file;
		}
	} );

	/**
	 * Main OneMeta Plugin Class
	 */
	final class OneMeta {

		/**
		 * Plugin instance
		 *
		 * @var OneMeta|null
		 */
		private static ?OneMeta $instance = null;

		/**
		 * Get plugin instance
		 *
		 * @return OneMeta|null
		 */
		public static function instance(): ?OneMeta {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			$this->init_hooks();
		}

		/**
		 * Initialize hooks
		 */
		private function init_hooks(): void {
			register_activation_hook( ONEMETA_PLUGIN_FILE, [ $this, 'activate' ] );
			register_deactivation_hook( ONEMETA_PLUGIN_FILE, [ $this, 'deactivate' ] );

			add_action( 'plugins_loaded', [ $this, 'init' ] );
			add_action( 'init', [ $this, 'load_textdomain' ] );
		}

		/**
		 * Plugin activation
		 */
		public function activate(): void {
			// Create database tables if needed
			$this->create_tables();

			// Set default options
			if ( ! get_option( 'onemeta_version' ) ) {
				update_option( 'onemeta_version', ONEMETA_VERSION );
			}

			// Flush rewrite rules
			flush_rewrite_rules();
		}

		/**
		 * Plugin deactivation
		 */
		public function deactivate(): void {
			flush_rewrite_rules();
		}

		/**
		 * Create database tables
		 */
		private function create_tables(): void {
			global $wpdb;

			$charset_collate = $wpdb->get_charset_collate();
			$table_name      = $wpdb->prefix . 'onemeta_field_groups';

			$sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            group_key varchar(100) NOT NULL,
            title varchar(255) NOT NULL,
            config longtext NOT NULL,
            status varchar(20) DEFAULT 'active',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY group_key (group_key)
        ) $charset_collate;";

			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
			dbDelta( $sql );
		}

		/**
		 * Initialize plugin
		 */
		public function init(): void {
			// Initialize core components
			Renderer::instance();
			Sanitizer::instance();
			Engine::instance();
			Admin::instance();
			RestAPI::instance();
		}

		/**
		 * Load plugin text domain
		 */
		public function load_textdomain(): void {
			load_plugin_textdomain(
				'onemeta',
				false,
				dirname( ONEMETA_PLUGIN_BASENAME ) . '/languages'
			);
		}
	}

	/**
	 * Initialize OneMeta
	 */
	function onemeta(): ?OneMeta {
		return OneMeta::instance();
	}

	onemeta();

	/**
	 * Helper function to get post meta value
	 *
	 * @param int $post_id Post ID
	 * @param string $key Meta key (without onemeta_ prefix)
	 * @param mixed $default Default value if meta doesn't exist
	 *
	 * @return mixed Meta value or default
	 */
	function onemeta_get_meta( int $post_id, string $key, mixed $default = '' ): mixed {
		$meta_key = 'onemeta_' . $key;

		// Check if meta exists first
		if ( ! metadata_exists( 'post', $post_id, $meta_key ) ) {
			return $default;
		}

		$value = get_post_meta( $post_id, $meta_key, true );

		// Return value even if it's 0, false, or empty array
		// Only return default if value is truly empty string or null
		return ( $value !== '' && $value !== null ) ? $value : $default;
	}

	/**
	 * Helper function to get user meta value
	 *
	 * @param int $user_id User ID
	 * @param string $key Meta key (without onemeta_ prefix)
	 * @param mixed $default Default value if meta doesn't exist
	 *
	 * @return mixed Meta value or default
	 */
	function onemeta_get_user_meta( int $user_id, string $key, mixed $default = '' ): mixed {
		$meta_key = 'onemeta_' . $key;

		// Check if meta exists first
		if ( ! metadata_exists( 'user', $user_id, $meta_key ) ) {
			return $default;
		}

		$value = get_user_meta( $user_id, $meta_key, true );

		// Return value even if it's 0, false, or empty array
		return ( $value !== '' && $value !== null ) ? $value : $default;
	}

	/**
	 * Helper function to update post meta value
	 *
	 * @param int $post_id Post ID
	 * @param string $key Meta key (without onemeta_ prefix)
	 * @param mixed $value Value to update
	 *
	 * @return int|bool Meta ID on success, false on failure
	 */
	function onemeta_update_meta( int $post_id, string $key, mixed $value ): bool|int {
		return update_post_meta( $post_id, 'onemeta_' . $key, $value );
	}

	/**
	 * Helper function to update user meta value
	 *
	 * @param int $user_id User ID
	 * @param string $key Meta key (without onemeta_ prefix)
	 * @param mixed $value Value to update
	 *
	 * @return int|bool Meta ID on success, false on failure
	 */
	function onemeta_update_user_meta( int $user_id, string $key, mixed $value ): bool|int {
		return update_user_meta( $user_id, 'onemeta_' . $key, $value );
	}

	/**
	 * Helper function to delete post meta value
	 *
	 * @param int $post_id Post ID
	 * @param string $key Meta key (without onemeta_ prefix)
	 *
	 * @return bool True on success, false on failure
	 */
	function onemeta_delete_meta( int $post_id, string $key ): bool {
		return delete_post_meta( $post_id, 'onemeta_' . $key );
	}

	/**
	 * Helper function to delete user meta value
	 *
	 * @param int $user_id User ID
	 * @param string $key Meta key (without onemeta_ prefix)
	 *
	 * @return bool True on success, false on failure
	 */
	function onemeta_delete_user_meta( int $user_id, string $key ): bool {
		return delete_user_meta( $user_id, 'onemeta_' . $key );
	}