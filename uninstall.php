<?php
/**
 * Uninstall OneMeta
 *
 * Fires only on full deletion via Plugins → Delete, never on plain
 * deactivation. Removes the plugin's own database table and options.
 *
 * Deliberately does NOT delete post meta or user meta created with the
 * onemeta_ prefix — that's site content, not plugin state, and a
 * reinstall later should find it intact. Same convention ACF and most
 * other meta-field plugins follow.
 *
 * @package OneMeta
 */

// Exit if not triggered by WordPress's own uninstall process.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Remove OneMeta's data for a single site.
 */
function onemeta_uninstall_single_site(): void {
	global $wpdb;

	$table_name = $wpdb->prefix . 'onemeta_field_groups';

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange -- One-time table removal on plugin deletion; no core WP API exists for this.
	$wpdb->query( $wpdb->prepare( 'DROP TABLE IF EXISTS %i', $table_name ) );

	delete_option( 'onemeta_version' );
}

if ( is_multisite() ) {
	$onemeta_site_ids = get_sites( [ 'fields' => 'ids' ] );

	foreach ( $onemeta_site_ids as $onemeta_site_id ) {
		switch_to_blog( $onemeta_site_id );
		onemeta_uninstall_single_site();
		restore_current_blog();
	}
} else {
	onemeta_uninstall_single_site();
}