<?php
/**
 * Meta Engine
 * Main orchestrator for config-driven meta fields system
 *
 * @package OneMeta
 */

namespace OneMeta\Core;

if (!defined('ABSPATH')) {
  exit;
}

/**
 * Engine Class
 */
class Engine {

  /**
   * Instance
   *
   * @var Engine|null
   */
  private static ?Engine $instance = null;

  /**
   * Get instance
   *
   * @return Engine|null
   */
  public static function instance(): ?Engine {
    if (null === self::$instance) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  /**
   * Constructor
   */
  private function __construct() {
    // Initialize core components
    ConfigLoader::instance();
    MetaBoxManager::instance();
    MetaSaver::instance();
    UserFieldManager::instance();
    FieldAssets::instance();
  }

  /**
   * Get configuration (proxy to ConfigLoader)
   *
   * @return array
   */
  public function get_config(): array {
    return ConfigLoader::instance()->get_config();
  }

  /**
   * Set configuration (proxy to ConfigLoader)
   *
   * @param array $config Configuration array
   */
  public function set_config(array $config): void {
    ConfigLoader::instance()->set_config($config);
  }

  /**
   * Force reload configuration
   */
  public function load_config(): void {
    ConfigLoader::instance()->load_config();
  }
}