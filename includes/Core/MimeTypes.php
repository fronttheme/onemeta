<?php
	/**
	 * Mime Types
	 * Registers additional allowed file types for upload
	 *
	 * @package OneMeta
	 */

	namespace OneMeta\Core;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	class MimeTypes {

		private static ?MimeTypes $instance = null;

		public static function instance(): ?MimeTypes {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		private function __construct() {
			add_filter( 'upload_mimes', [ $this, 'add_mime_types' ] );
			add_filter( 'wp_check_filetype_and_ext', [ $this, 'fix_mime_check' ], 10, 4 );
		}

		public function add_mime_types( array $mimes ): array {
			$mimes['woff']  = 'font/woff';
			$mimes['woff2'] = 'font/woff2';
			$mimes['ttf']   = 'font/ttf';
			$mimes['otf']   = 'font/otf';

			return $mimes;
		}

		public function fix_mime_check( array $data, string $file, string $filename, ?array $mimes ): array {
			$ext = pathinfo( $filename, PATHINFO_EXTENSION );
			if ( in_array( $ext, [ 'woff', 'woff2', 'ttf', 'otf' ], true ) ) {
				$data['ext']  = $ext;
				$data['type'] = 'font/' . $ext;
			}

			return $data;
		}
	}