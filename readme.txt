=== OneMeta - Custom Meta Fields Made Simple ===
Contributors: farukahmed
Tags: custom fields, meta fields, acf alternative, field builder, repeater
Requires at least: 6.8
Tested up to: 6.8
Stable tag: 1.0.0
Requires PHP: 8.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Build powerful custom fields with a visual drag-and-drop builder. Free, lightweight, and a modern alternative to ACF.

== Description ==

**OneMeta** is a free, open-source WordPress plugin for creating and managing custom meta fields — without the complexity or cost of premium alternatives.

Whether you need simple text fields or advanced repeater groups with conditional logic, OneMeta gives you a clean visual builder and clean PHP output.

= ✨ Key Features =

* **Visual Drag & Drop Builder** — Build field groups with a beautiful, intuitive interface
* **Live PHP Code Preview** — See your generated PHP code update in real time as you build
* **Export as PHP Code** — Export field groups to use in your theme or plugin without OneMeta installed
* **Repeater Fields** — Create repeatable sub-field groups for complex data
* **Conditional Logic** — Show or hide fields based on the value of other fields
* **REST API Support** — Access field data via the WordPress REST API
* **Zero Dependencies** — No jQuery, no bloat — built with vanilla JS and Vite
* **14 Field Types** — Everything you need, nothing you don't
* **Modern UI** — Clean, polished admin interface

= 🧩 Field Types =

**Basic:** Text, Textarea, URL, Email, Date

**Choice:** Toggle, Select, Radio, Button Group

**Multiple:** Checkbox

**Media:** Image, File, Gallery

**Advanced:** Repeater

= 📖 Helper Functions =

Use simple helper functions to retrieve field values in your theme:

`$value = onemeta_get_meta( get_the_ID(), 'field_key' );`

`$value = onemeta_get_user_meta( $user_id, 'field_key' );`

= 🔀 Conditional Logic =

Show or hide fields dynamically based on the value of other fields. Supports `==`, `!=`, `contains`, and `!contains` operators.

= 📤 Export as PHP =

Export any field group as clean PHP code to bundle with your theme or plugin — no dependency on OneMeta required.

= 🔗 Links =

* [GitHub Repository](https://github.com/fronttheme/onemeta)
* [Documentation](https://fronttheme.com/docs/onemeta/)
* [FrontTheme](https://fronttheme.com)

== Installation ==

1. Upload the `onemeta` folder to `/wp-content/plugins/`
2. Activate the plugin from the **Plugins** menu in WordPress
3. Go to **OneMeta → Add New** to create your first field group

**Or install via WordPress admin:**

1. Go to **Plugins → Add New**
2. Search for **OneMeta**
3. Click **Install Now** and then **Activate**

== Frequently Asked Questions ==

= Is OneMeta free? =

Yes, OneMeta is 100% free and open-source, licensed under GPL-2.0-or-later.

= Is OneMeta a replacement for ACF? =

OneMeta covers the most commonly used features of ACF — 14 field types, repeaters, conditional logic, and REST API support — all for free. It is designed to be lightweight and modern.

= Can I use OneMeta fields without the plugin installed? =

Yes! Use the Export PHP feature to export your field group as PHP code. You can then register fields directly from your theme or plugin without OneMeta installed.

= What field types are supported? =

Text, Textarea, URL, Email, Date, Toggle, Select, Checkbox, Radio, Button Group, Image, File, Gallery, and Repeater — 14 field types in total.

= Does OneMeta support user profile fields? =

Yes. When creating a field group, select **User Meta** as the type to add fields to user profiles.

= Does OneMeta work with the REST API? =

Yes. Field data is accessible via the WordPress REST API on post and user endpoints.

= What are the minimum requirements? =

WordPress 6.8 or higher and PHP 8.2 or higher.

= How do I get a field value in my theme? =

Use the `onemeta_get_meta()` function for post fields and `onemeta_get_user_meta()` for user fields:

`$value = onemeta_get_meta( get_the_ID(), 'your_field_key' );`

Do not include the `onemeta_` prefix — it is added automatically.

== Screenshots ==

1. The OneMeta field group builder with drag-and-drop interface
2. Live PHP code preview panel while building fields
3. Field type palette sidebar
4. Field group dashboard listing all groups
5. Documentation page with field types reference

== Changelog ==

= 1.0.0 =
* Initial release
* 14 field types: Text, Textarea, URL, Email, Date, Toggle, Select, Checkbox, Radio, Button Group, Image, File, Gallery, Repeater
* Visual drag-and-drop builder
* Live PHP code preview
* Export fields as PHP code
* Repeater fields with sub-fields
* Conditional logic with 4 operators
* REST API support
* Post/page meta and user meta support
* PSR-4 autoloaded PHP architecture

== Upgrade Notice ==

= 1.0.0 =
Initial release of OneMeta.