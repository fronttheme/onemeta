# Changelog

All notable changes to OneMeta will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-06

### Added
- Initial release of OneMeta
- 14 field types: Text, Textarea, URL, Email, Date, Toggle, Select, Checkbox, Radio, Button Group, Image, File, Gallery, Repeater
- Visual drag-and-drop field builder with live PHP code preview
- Export field groups as clean PHP code via `onemeta_field_groups` filter hook
- Repeater fields with support for all field types as sub-fields
- Conditional logic with `==`, `!=`, `contains`, and `!contains` operators
- Full REST API (`onemeta/v1`) with CRUD endpoints for field groups
- Post/Page meta support for all public post types
- User meta support for WordPress user profiles
- Helper functions: `onemeta_get_meta()`, `onemeta_update_meta()`, `onemeta_delete_meta()`
- Helper functions: `onemeta_get_user_meta()`, `onemeta_update_user_meta()`, `onemeta_delete_user_meta()`
- Dashboard with stats (total groups, active groups, total fields)
- Field group status toggle (active/inactive)
- PSR-4 autoloaded PHP architecture with singleton pattern
- Custom database table `wp_onemeta_field_groups`
- Vite 5 build system with modular SCSS and vanilla JS ES modules
- FontAwesome icons (self-hosted, no external requests)
- Full i18n/l10n support with `.pot` file generation
- WordPress.org and GitHub distribution packaging

---

[1.0.0]: https://github.com/fronttheme/onemeta/releases/tag/v1.0.0