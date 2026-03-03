<?php
	/**
	 * Config Loader
	 * Handles loading field group configurations from database and filters
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Core;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * ConfigLoader Class
	 */
	class ConfigLoader {

		/**
		 * Instance
		 *
		 * @var ConfigLoader|null
		 */
		private static ?ConfigLoader $instance = null;

		/**
		 * Field groups configuration
		 *
		 * @var array
		 */
		private array $config = [];

		/**
		 * Whether config has been loaded
		 *
		 * @var bool
		 */
		private bool $loaded = false;

		/**
		 * Get instance
		 *
		 * @return ConfigLoader|null
		 */
		public static function instance(): ?ConfigLoader {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			// Try loading config at multiple points to ensure it catches theme's functions.php
			add_action( 'after_setup_theme', [ $this, 'load_config' ], 20 );
			add_action( 'init', [ $this, 'load_config' ], 5 );
			add_action( 'wp_loaded', [ $this, 'load_config' ], 5 );
		}

		/**
		 * Load configuration from database and filters
		 */
		public function load_config(): void {
			// Prevent loading multiple times
			if ( $this->loaded ) {
				return;
			}
			$this->loaded = true;

			// Load from database
			$this->load_from_database();

			// Allow external config loading (for config-driven approach)
			$this->config = apply_filters( 'onemeta_field_groups', $this->config );
		}

		/**
		 * Load field groups from database
		 */
		private function load_from_database(): void {
			global $wpdb;
			$table_name = $wpdb->prefix . 'onemeta_field_groups';

			$results = $wpdb->get_results(
				"SELECT * FROM $table_name WHERE status = 'active'",
				ARRAY_A
			);

			if ( $results ) {
				foreach ( $results as $row ) {
					$config = json_decode( $row['config'], true );
					if ( $config ) {
						$this->config[ $row['group_key'] ] = $config;
					}
				}
			}
		}

		/**
		 * Set configuration programmatically
		 *
		 * @param array $config Configuration array
		 */
		public function set_config( array $config ): void {
			$this->config = array_merge( $this->config, $config );
		}

		/**
		 * Get all field groups
		 *
		 * @return array
		 */
		public function get_config(): array {
			return $this->config;
		}

		/**
		 * Get field group by key
		 *
		 * @param string $group_key Group key
		 *
		 * @return array|null Field group config or null
		 */
		public function get_group( string $group_key ): ?array {
			return $this->config[ $group_key ] ?? null;
		}

		/**
		 * Get field groups by type
		 *
		 * @param string $type Type (post, user, etc.)
		 *
		 * @return array Field groups of specified type
		 */
		public function get_groups_by_type( string $type ): array {
			return array_filter( $this->config, function ( $group ) use ( $type ) {
				return ( $group['type'] ?? 'post' ) === $type;
			} );
		}

		/**
		 * Get field groups for specific post type
		 *
		 * @param string $post_type Post type
		 *
		 * @return array Field groups for post type
		 */
		public function get_groups_for_post_type( string $post_type ): array {
			return array_filter( $this->config, function ( $group ) use ( $post_type ) {
				return ( $group['type'] ?? 'post' ) === 'post'
				       && isset( $group['post_type'] )
				       && $group['post_type'] === $post_type;
			} );
		}

		/**
		 * Force reload configuration (for testing/debugging)
		 */
		public function reload(): void {
			$this->loaded = false;
			$this->config = [];
			$this->load_config();
		}
	}