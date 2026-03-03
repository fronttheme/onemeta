<?php
	/**
	 * Admin Menu
	 * Handles WordPress admin menu registration and page rendering
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Admin;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	/**
	 * AdminMenu Class
	 */
	class AdminMenu {

		/**
		 * Instance
		 *
		 * @var AdminMenu|null
		 */
		private static ?AdminMenu $instance = null;

		/**
		 * Get instance
		 *
		 * @return AdminMenu|null
		 */
		public static function instance(): ?AdminMenu {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
			add_action( 'load-admin_page_onemeta-edit', [ $this, 'set_edit_page_title' ] );
		}

		/**
		 * Set title for edit page before admin header loads
		 */
		public function set_edit_page_title(): void {
			global $title;
			$title = __( 'Edit Field Group', 'onemeta' );
		}

		/**
		 * Add admin menu
		 */
		public function add_admin_menu(): void {
			// OneMeta SVG icon (Recommended size: 20x20)
			$svg_icon = 'data:image/svg+xml;base64,' . base64_encode(
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
                <path d="M25,0C11.19,0,0,11.19,0,25s11.19,25,25,25,25-11.19,25-25S38.81,0,25,0ZM43.19,37.26c-.79,1.16-1.69,2.26-2.68,3.25-.99.99-2.09,1.9-3.25,2.68-1.17.79-2.43,1.47-3.73,2.02-2.7,1.14-5.58,1.72-8.54,1.72s-5.84-.58-8.54-1.72c-1.3-.55-2.55-1.23-3.73-2.02-1.16-.79-2.26-1.69-3.25-2.68-.99-.99-1.9-2.09-2.68-3.25-.79-1.17-1.47-2.43-2.02-3.73-1.14-2.7-1.72-5.58-1.72-8.54s.58-5.84,1.72-8.54c.55-1.3,1.23-2.55,2.02-3.73.79-1.16,1.69-2.26,2.68-3.25.99-.99,2.09-1.9,3.25-2.68,1.17-.79,2.43-1.47,3.73-2.02,2.7-1.14,5.58-1.72,8.54-1.72s5.84.58,8.54,1.72c1.3.55,2.55,1.23,3.73,2.02,1.16.79,2.26,1.69,3.25,2.68.99.99,1.9,2.09,2.68,3.25.79,1.17,1.47,2.43,2.02,3.73,1.14,2.7,1.72,5.58,1.72,8.54s-.58,5.84-1.72,8.54c-.55,1.3-1.23,2.55-2.02,3.73ZM17.24,31.03c0,2.63-2.14,4.77-4.77,4.77s-4.77-2.14-4.77-4.77,2.14-4.77,4.77-4.77,4.77,2.14,4.77,4.77ZM29.77,31.03c0,2.63-2.14,4.77-4.77,4.77s-4.77-2.14-4.77-4.77,2.14-4.77,4.77-4.77,4.77,2.14,4.77,4.77ZM42.31,31.03c0,2.63-2.14,4.77-4.77,4.77s-4.77-2.14-4.77-4.77,2.14-4.77,4.77-4.77,4.77,2.14,4.77,4.77Z" fill="currentColor"/>
        </svg>'
				);

			add_menu_page(
				__( 'OneMeta', 'onemeta' ),
				__( 'OneMeta', 'onemeta' ),
				'manage_options',
				'onemeta',
				[ $this, 'render_dashboard' ],
				$svg_icon,
				30
			);

			add_submenu_page(
				'onemeta',
				__( 'Field Groups', 'onemeta' ),
				__( 'Field Groups', 'onemeta' ),
				'manage_options',
				'onemeta',
				[ $this, 'render_dashboard' ]
			);

			add_submenu_page(
				'onemeta',
				__( 'Add New', 'onemeta' ),
				__( 'Add New', 'onemeta' ),
				'manage_options',
				'onemeta-new',
				[ $this, 'render_builder' ]
			);

			// Edit page (hidden from menu)
			add_submenu_page(
				'',  // Hidden from menu
				__( 'Edit Field Group', 'onemeta' ),
				__( 'Edit Field Group', 'onemeta' ),
				'manage_options',
				'onemeta-edit',
				[ $this, 'render_builder' ]
			);

			add_submenu_page(
				'onemeta',
				__( 'About', 'onemeta' ),
				__( 'About', 'onemeta' ),
				'manage_options',
				'onemeta-about',
				[ $this, 'render_about' ]
			);

			add_submenu_page(
				'onemeta',
				__( 'Documentation', 'onemeta' ),
				__( 'Documentation', 'onemeta' ),
				'manage_options',
				'onemeta-docs',
				[ $this, 'render_docs' ]
			);
		}

		/**
		 * Render dashboard
		 */
		public function render_dashboard(): void {
			include ONEMETA_PLUGIN_DIR . 'includes/Admin/views/dashboard.php';
		}

		/**
		 * Render builder
		 */
		public function render_builder(): void {
			include ONEMETA_PLUGIN_DIR . 'includes/Admin/views/builder.php';
		}

		/**
		 * Render about
		 */
		public function render_about(): void {
			include ONEMETA_PLUGIN_DIR . 'includes/Admin/views/about.php';
		}

		/**
		 * Render documentation page
		 */
		public function render_docs(): void {
			include ONEMETA_PLUGIN_DIR . 'includes/Admin/views/docs.php';
		}
	}