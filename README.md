<div align="center">

<img src="assets/images/logo/onemeta-logo-dark.svg" alt="OneMeta" height="60" />

# OneMeta — Custom Meta Fields Made Simple

**A free, open-source, lightweight alternative to ACF for WordPress.**
Build powerful custom fields with a beautiful visual builder — no bloat, no paywalls.

[![WordPress](https://img.shields.io/badge/WordPress-6.8%2B-blue?logo=wordpress)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?logo=php)](https://php.net)
[![License](https://img.shields.io/badge/License-GPL--2.0--or--later-green)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange)](https://github.com/fronttheme/onemeta/releases)

[Features](#-features) · [Field Types](#-field-types) · [Installation](#-installation) · [Usage](#-usage) · [Export](#-export-as-php) · [Contributing](#-contributing)

</div>

---

## ✨ Features

- 🎨 **Visual Drag & Drop Builder** — Build field groups with an intuitive interface
- ⚡ **Live PHP Code Preview** — See generated PHP code update in real time as you build
- 📦 **Export as PHP Code** — Export field groups to use in your theme or plugin without OneMeta installed
- 🔁 **Repeater Fields** — Create repeatable sub-field groups for complex data structures
- 🔀 **Conditional Logic** — Show or hide fields based on the value of other fields
- 🌐 **REST API Support** — Access your field data via the WordPress REST API
- 🪶 **Zero Dependencies** — No jQuery, no bloat — built with vanilla JS and modern tooling (Vite)
- 🎯 **14 Field Types** — Everything you need, nothing you don't
- 💅 **Modern UI** — Clean, polished admin interface that feels native to WordPress

---

## 🧩 Field Types

| Category | Fields |
|---|---|
| **Basic** | Text, Textarea, URL, Email, Date |
| **Choice** | Toggle, Select, Radio, Button Group |
| **Multiple** | Checkbox |
| **Media** | Image, File, Gallery |
| **Advanced** | Repeater |

---

## 📋 Requirements

| Requirement | Version |
|---|---|
| WordPress | 6.8 or higher |
| PHP | 8.2 or higher |

---

## 🚀 Installation

### Option 1 — Download ZIP (Recommended for most users)

1. Go to [Releases](https://github.com/fronttheme/onemeta/releases)
2. Download the latest `onemeta.zip`
3. In your WordPress admin go to **Plugins → Add New → Upload Plugin**
4. Upload the ZIP and click **Activate**

### Option 2 — Clone via Git

```bash
cd wp-content/plugins
git clone https://github.com/fronttheme/onemeta.git
```

Then activate the plugin from **Plugins** in your WordPress admin.

### Option 3 — WordPress.org *(coming soon)*

OneMeta will be available in the official WordPress plugin directory soon.

---

## 🛠️ Usage

### 1. Create a Field Group

Go to **OneMeta → Add New** in your WordPress admin. Give your field group a key and title, then select whether it applies to **Post/Page Meta** or **User Meta**.

### 2. Add Fields

Click **Add Field** or drag a field type from the sidebar. Configure each field's label, key, description, placeholder, and any advanced options (choices, conditional logic, repeater sub-fields).

### 3. Use in Your Theme

Use the built-in helper functions to retrieve field values:

```php
// Get a post/page meta value
$value = onemeta_get_meta( get_the_ID(), 'field_key' );

// Get a user meta value
$value = onemeta_get_user_meta( $user_id, 'field_key' );

// With a default fallback
$value = onemeta_get_meta( get_the_ID(), 'field_key', 'Default Value' );
```

> **Note:** Do not include the `onemeta_` prefix in your field key — it is added automatically.

---

## 📖 Helper Functions

### Post / Page Meta

```php
// Get
$value = onemeta_get_meta( $post_id, 'field_key', 'default' );

// Update
onemeta_update_meta( $post_id, 'field_key', $value );

// Delete
onemeta_delete_meta( $post_id, 'field_key' );
```

### User Meta

```php
// Get
$value = onemeta_get_user_meta( $user_id, 'field_key', 'default' );

// Update
onemeta_update_user_meta( $user_id, 'field_key', $value );

// Delete
onemeta_delete_user_meta( $user_id, 'field_key' );
```

### Field Return Types Reference

| Field Type | Returns | Example |
|---|---|---|
| Text, Textarea, URL, Email, Date | `string` | `"Hello World"` |
| Toggle | `string` | `"0"` or `"1"` |
| Select, Radio, Button Group | `string` | `"option_value"` |
| Checkbox | `array` | `["val1", "val2"]` |
| Image, File | `int` | `123` (attachment ID) |
| Gallery | `array` | `[123, 456, 789]` |
| Repeater | `array` | `[["title" => "Item 1"], ...]` |

---

## 🧩 Field Type Usage

### Text

```php
$text = onemeta_get_meta( get_the_ID(), 'custom_title' );
echo '<h2>' . esc_html( $text ) . '</h2>';
```

### Textarea

```php
$content = onemeta_get_meta( get_the_ID(), 'field_description' );
// Preserve line breaks and escape
echo wp_kses_post( wpautop( $content ) );
```

### URL

```php
$url = onemeta_get_meta( get_the_ID(), 'field_website' );
if ( $url ) {
    echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">Visit Website</a>';
}
```

### Email

```php
$email = onemeta_get_meta( get_the_ID(), 'field_email' );
if ( $email ) {
    echo '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>';
}
```

### Date

```php
$date = onemeta_get_meta( get_the_ID(), 'field_event_date' );
if ( $date ) {
    // Returns Y-m-d format — convert to any display format
    echo '<time datetime="' . esc_attr( $date ) . '">';
    echo date_i18n( get_option( 'date_format' ), strtotime( $date ) );
    echo '</time>';
}
```

### Toggle

```php
// Returns "1" for on, empty string for off — not boolean
$is_featured = onemeta_get_meta( get_the_ID(), 'is_featured' );
if ( $is_featured === '1' ) {
    echo '<span class="badge">⭐ Featured</span>';
}
```

### Select / Radio / Button Group

```php
// All return the selected value as a string
$layout = onemeta_get_meta( get_the_ID(), 'field_layout' );
echo '<div class="layout-' . esc_attr( $layout ) . '">';

// Map values to labels
$choices = [ 'grid' => 'Grid View', 'list' => 'List View' ];
echo esc_html( $choices[ $layout ] ?? $layout );
```

### Checkbox

```php
// Returns array of selected values
$features = onemeta_get_meta( get_the_ID(), 'field_features' );
if ( is_array( $features ) && ! empty( $features ) ) {
    foreach ( $features as $feature ) {
        echo '<span class="badge">' . esc_html( $feature ) . '</span>';
    }
}

// Check if a specific value is selected
if ( in_array( 'wifi', $features, true ) ) {
    echo '📶 WiFi Available';
}
```

### Image

```php
// Returns attachment ID (integer)
$image_id = onemeta_get_meta( get_the_ID(), 'featured_image' );
if ( $image_id ) {
    // Recommended: use wp_get_attachment_image() for srcset, lazy loading, etc.
    echo wp_get_attachment_image( $image_id, 'large', false, [
        'class' => 'featured-image',
        'alt'   => get_the_title(),
    ] );
}
```

### File

```php
// Returns attachment ID (integer)
$file_id = onemeta_get_meta( get_the_ID(), 'field_document' );
if ( $file_id ) {
    $file_url  = wp_get_attachment_url( $file_id );
    $file_name = basename( get_attached_file( $file_id ) );
    $file_size = size_format( filesize( get_attached_file( $file_id ) ) );
    echo '<a href="' . esc_url( $file_url ) . '" download>';
    echo esc_html( $file_name ) . ' (' . $file_size . ')';
    echo '</a>';
}
```

### Gallery

```php
// Returns array of attachment IDs
$gallery = onemeta_get_meta( get_the_ID(), 'field_gallery' );
if ( is_array( $gallery ) && ! empty( $gallery ) ) {
    echo '<div class="gallery">';
    foreach ( $gallery as $image_id ) {
        echo wp_get_attachment_image( $image_id, 'medium', false, [
            'class' => 'gallery-item',
        ] );
    }
    echo '</div>';
}
```

### Repeater

```php
// Returns array of row arrays — each row contains your sub-field values
$team = onemeta_get_meta( get_the_ID(), 'field_team_members' );
if ( is_array( $team ) && ! empty( $team ) ) {
    echo '<div class="team-grid">';
    foreach ( $team as $member ) {
        echo '<div class="team-member">';
        if ( ! empty( $member['member_avatar'] ) ) {
            echo wp_get_attachment_image( $member['member_avatar'], 'thumbnail', false, [
                'alt' => esc_attr( $member['member_name'] ?? '' ),
            ] );
        }
        echo '<h3>' . esc_html( $member['member_name'] ?? '' ) . '</h3>';
        echo wp_kses_post( wpautop( $member['member_bio'] ?? '' ) );
        echo '</div>';
    }
    echo '</div>';
}
```

---

## 🔀 Conditional Logic

Show or hide fields dynamically based on the value of another field:

```php
'my_field' => [
    'type'        => 'text',
    'label'       => 'My Text Field',
    'conditional' => [
        'field'    => 'my_other_field',
        'operator' => '!=',
        'value'    => '',
    ],
],
```

**Supported operators:**

| Operator | Description |
|---|---|
| `==` | Equal to |
| `!=` | Not equal to |
| `contains` | Contains text (case-insensitive) |
| `!contains` | Does not contain text (case-insensitive) |

---

## 📤 Export as PHP

OneMeta lets you export any field group as clean PHP code. This means you can:

- **Bundle field groups into your theme or plugin** without requiring OneMeta to be installed
- **Version control** your field configurations alongside your code
- **Share field structures** with other developers

Click **Export PHP** in the builder or visit **OneMeta → Documentation → Export Field Groups**.

---

## 🔌 REST API

OneMeta field data is accessible via the WordPress REST API. Field values are exposed on their respective post or user endpoints.

---

## 👩‍💻 Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/fronttheme/onemeta.git
cd onemeta
npm install
```

### Commands

```bash
# Start development with HMR
npm run dev

# Build for production
npm run build

# Watch mode
npm run watch

# Generate translation POT file
npm run pot

# Package for distribution
npm run package
```

### Tech Stack

- **Build Tool:** Vite 5
- **CSS:** SCSS (modular architecture)
- **JS:** Vanilla ES Modules (no jQuery)
- **PHP:** PSR-4 autoloaded, singleton pattern
- **Database:** Custom `wp_onemeta_field_groups` table

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow WordPress coding standards for PHP and keep JS changes consistent with the existing modular architecture.

---

## 📄 License

OneMeta is licensed under the [GPL-2.0-or-later](LICENSE) license — the same license as WordPress itself. You are free to use, modify, and distribute this plugin.

---

## 👤 Author

**Faruk Ahmed**
- Website: [farukdesign.com](https://farukdesign.com)
- Brand: [fronttheme.com](https://fronttheme.com)
- GitHub: [@fronttheme](https://github.com/fronttheme)

---

<div align="center">

Made with ❤️ for the WordPress community · [fronttheme.com](https://fronttheme.com)

</div>