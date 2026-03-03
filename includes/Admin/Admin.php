<?php
/**
 * Admin Interface
 * Main admin class that orchestrates admin functionality
 *
 * @package OneMeta
 */

namespace OneMeta\Admin;

if (!defined('ABSPATH')) {
  exit;
}

/**
 * Admin Class
 */
class Admin {

  /**
   * Instance
   *
   * @var Admin|null
   */
  private static ?Admin $instance = null;

  /**
   * Get instance
   *
   * @return Admin|null
   */
  public static function instance(): ?Admin {
    if (null === self::$instance) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  /**
   * Constructor
   */
  private function __construct() {
    // Initialize admin components
    AdminMenu::instance();
    AdminAssets::instance();
    AdminAjax::instance();
  }
}