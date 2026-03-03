<?php
/**
 * REST API
 * Handles REST API endpoints for OneMeta
 *
 * @package OneMeta
 */

namespace OneMeta\API;

use WP_REST_Request;
use WP_REST_Response;

if (!defined('ABSPATH')) {
  exit;
}

/**
 * RestAPI Class
 */
class RestAPI {

  /**
   * Instance
   *
   * @var RestAPI|null
   */
  private static ?RestAPI $instance = null;

  /**
   * Namespace
   *
   * @var string
   */
  private string $namespace = 'onemeta/v1';

  /**
   * Get instance
   *
   * @return RestAPI|null
   */
  public static function instance(): ?RestAPI {
    if (null === self::$instance) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  /**
   * Constructor
   */
  private function __construct() {
    add_action('rest_api_init', [$this, 'register_routes']);
  }

  /**
   * Register REST API routes
   */
  public function register_routes(): void {
    // Get all field groups
    register_rest_route($this->namespace, '/field-groups', [
      'methods'             => 'GET',
      'callback'            => [$this, 'get_field_groups'],
      'permission_callback' => [$this, 'check_permissions'],
    ]);

    // Get single field group
    register_rest_route($this->namespace, '/field-groups/(?P<id>[\w-]+)', [
      'methods'             => 'GET',
      'callback'            => [$this, 'get_field_group'],
      'permission_callback' => [$this, 'check_permissions'],
      'args'                => [
        'id' => [
          'required'          => true,
          'sanitize_callback' => 'sanitize_text_field',
        ],
      ],
    ]);

    // Create field group
    register_rest_route($this->namespace, '/field-groups', [
      'methods'             => 'POST',
      'callback'            => [$this, 'create_field_group'],
      'permission_callback' => [$this, 'check_permissions'],
    ]);

    // Update field group
    register_rest_route($this->namespace, '/field-groups/(?P<id>[\w-]+)', [
      'methods'             => 'PUT',
      'callback'            => [$this, 'update_field_group'],
      'permission_callback' => [$this, 'check_permissions'],
      'args'                => [
        'id' => [
          'required'          => true,
          'sanitize_callback' => 'sanitize_text_field',
        ],
      ],
    ]);

    // Delete field group
    register_rest_route($this->namespace, '/field-groups/(?P<id>[\w-]+)', [
      'methods'             => 'DELETE',
      'callback'            => [$this, 'delete_field_group'],
      'permission_callback' => [$this, 'check_permissions'],
      'args'                => [
        'id' => [
          'required'          => true,
          'sanitize_callback' => 'sanitize_text_field',
        ],
      ],
    ]);

    // Toggle field group status
    register_rest_route($this->namespace, '/field-groups/(?P<id>[\w-]+)/toggle', [
      'methods'             => 'POST',
      'callback'            => [$this, 'toggle_field_group'],
      'permission_callback' => [$this, 'check_permissions'],
      'args'                => [
        'id' => [
          'required'          => true,
          'sanitize_callback' => 'sanitize_text_field',
        ],
      ],
    ]);

    // Add endpoint to fetch field type schemas via AJAX
    register_rest_route('onemeta/v1', '/field-schemas', [
      'methods'             => 'GET',
      'callback'            => [$this, 'get_field_schemas'],
      'permission_callback' => function () {
        return current_user_can('manage_options');
      }
    ]);

  }

  /**
   * Check permissions
   *
   * @return bool
   */
  public function check_permissions(): bool {
    return current_user_can('manage_options');
  }

  /**
   * Get all field groups
   *
   * @return WP_REST_Response
   */
  public function get_field_groups() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'onemeta_field_groups';

    $results = $wpdb->get_results(
      "SELECT * FROM $table_name ORDER BY created_at DESC",
      ARRAY_A
    );

    $field_groups = [];
    foreach ($results as $row) {
      $config = json_decode($row['config'], true);
      $field_groups[] = [
        'id'         => $row['group_key'],
        'title'      => $row['title'],
        'config'     => $config,
        'status'     => $row['status'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
      ];
    }

    return new WP_REST_Response($field_groups, 200);
  }

  /**
   * Get single field group
   *
   * @param WP_REST_Request $request Request object
   * @return WP_REST_Response
   */
  public function get_field_group($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'onemeta_field_groups';
    $group_id = $request->get_param('id');

    $result = $wpdb->get_row(
      $wpdb->prepare("SELECT * FROM $table_name WHERE group_key = %s", $group_id),
      ARRAY_A
    );

    if (!$result) {
      return new WP_REST_Response(['error' => __('Field group not found', 'onemeta')], 404);
    }

    $config = json_decode($result['config'], true);

    return new WP_REST_Response([
      'id'         => $result['group_key'],
      'title'      => $result['title'],
      'config'     => $config,
      'status'     => $result['status'],
      'created_at' => $result['created_at'],
      'updated_at' => $result['updated_at'],
    ], 200);
  }

  /**
   * Create field group
   *
   * @param WP_REST_Request $request Request object
   * @return WP_REST_Response
   */
  public function create_field_group($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'onemeta_field_groups';

    $data = $request->get_json_params();

    // Validate required fields
    if (empty($data['group_key']) || empty($data['title']) || empty($data['config'])) {
      return new WP_REST_Response([
        'error' => __('Missing required fields', 'onemeta')
      ], 400);
    }

    // Check if group_key already exists
    $exists = $wpdb->get_var(
      $wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE group_key = %s", $data['group_key'])
    );

    if ($exists) {
      return new WP_REST_Response([
        'error' => __('A field group with this key already exists', 'onemeta')
      ], 400);
    }

    // Insert new field group
    $result = $wpdb->insert(
      $table_name,
      [
        'group_key' => sanitize_key($data['group_key']),
        'title'     => sanitize_text_field($data['title']),
        'config'    => wp_json_encode($data['config']),
        'status'    => 'active',
      ],
      ['%s', '%s', '%s', '%s']
    );

    if ($result === false) {
      return new WP_REST_Response([
        'error' => __('Failed to create field group', 'onemeta')
      ], 500);
    }

    return new WP_REST_Response([
      'success' => true,
      'message' => __('Field group created successfully', 'onemeta'),
      'id'      => $data['group_key'],
    ], 201);
  }

  /**
   * Update field group
   *
   * @param WP_REST_Request $request Request object
   * @return WP_REST_Response
   */
  public function update_field_group($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'onemeta_field_groups';
    $group_id = $request->get_param('id');
    $data = $request->get_json_params();

    // Validate required fields
    if (empty($data['title']) || empty($data['config'])) {
      return new WP_REST_Response([
        'error' => __('Missing required fields', 'onemeta')
      ], 400);
    }

    // Update field group
    $result = $wpdb->update(
      $table_name,
      [
        'title'  => sanitize_text_field($data['title']),
        'config' => wp_json_encode($data['config']),
      ],
      ['group_key' => $group_id],
      ['%s', '%s'],
      ['%s']
    );

    if ($result === false) {
      return new WP_REST_Response([
        'error' => __('Failed to update field group', 'onemeta')
      ], 500);
    }

    return new WP_REST_Response([
      'success' => true,
      'message' => __('Field group updated successfully', 'onemeta'),
    ], 200);
  }

  /**
   * Delete field group
   *
   * @param WP_REST_Request $request Request object
   * @return WP_REST_Response
   */
  public function delete_field_group($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'onemeta_field_groups';
    $group_id = $request->get_param('id');

    $result = $wpdb->delete(
      $table_name,
      ['group_key' => $group_id],
      ['%s']
    );

    if ($result === false) {
      return new WP_REST_Response([
        'error' => __('Failed to delete field group', 'onemeta')
      ], 500);
    }

    return new WP_REST_Response([
      'success' => true,
      'message' => __('Field group deleted successfully', 'onemeta'),
    ], 200);
  }

  /**
   * Toggle field group status
   *
   * @param WP_REST_Request $request Request object
   * @return WP_REST_Response
   */
  public function toggle_field_group($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'onemeta_field_groups';
    $group_id = $request->get_param('id');

    // Get current status
    $current_status = $wpdb->get_var(
      $wpdb->prepare("SELECT status FROM $table_name WHERE group_key = %s", $group_id)
    );

    if (!$current_status) {
      return new WP_REST_Response([
        'error' => __('Field group not found', 'onemeta')
      ], 404);
    }

    // Toggle status
    $new_status = ($current_status === 'active') ? 'inactive' : 'active';

    $result = $wpdb->update(
      $table_name,
      ['status' => $new_status],
      ['group_key' => $group_id],
      ['%s'],
      ['%s']
    );

    if ($result === false) {
      return new WP_REST_Response([
        'error' => __('Failed to toggle field group status', 'onemeta')
      ], 500);
    }

    return new WP_REST_Response([
      'success' => true,
      'status'  => $new_status,
      'message' => __('Field group status updated', 'onemeta'),
    ], 200);
  }
}