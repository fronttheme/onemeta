# Contributing to OneMeta

Thank you for your interest in contributing to OneMeta! This guide will help you get started.

## Code of Conduct

Be respectful and constructive. This is an open-source project maintained in good faith — treat everyone accordingly.

---

## Ways to Contribute

- **Bug reports** — Found something broken? [Open an issue](https://github.com/fronttheme/onemeta/issues/new?template=bug_report.md)
- **Feature requests** — Have an idea? [Request a feature](https://github.com/fronttheme/onemeta/issues/new?template=feature_request.md)
- **Pull requests** — Fix a bug or build a feature
- **Documentation** — Improve clarity, fix typos, add examples
- **Testing** — Test on different WordPress/PHP versions and report results

---

## Development Setup

### Prerequisites

- PHP 8.2+
- WordPress 6.8+ (local install, e.g. [LocalWP](https://localwp.com/))
- Node.js 18+
- npm

### Setup

```bash
# Clone the repository into your WordPress plugins directory
cd wp-content/plugins
git clone https://github.com/fronttheme/onemeta.git
cd onemeta

# Install JS dependencies
npm install

# Start development build with watch mode
npm run dev
```

Then activate the plugin from your WordPress admin under **Plugins**.

### Build Commands

```bash
npm run dev       # Development server with HMR
npm run build     # Production build
npm run watch     # Watch mode (rebuild on file change)
npm run pot       # Generate translation .pot file
npm run package   # Package for distribution
```

---

## Submitting a Pull Request

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b fix/your-bug-description
   # or
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes** thoroughly on a local WordPress install

4. **Run the build** to make sure nothing is broken:
   ```bash
   npm run build
   ```

5. **Commit** with a clear, descriptive message:
   ```bash
   git commit -m "Fix: toggle field not saving correctly on user profile"
   # or
   git commit -m "Add: new color picker field type"
   ```

6. **Push** your branch and open a Pull Request against `main`

7. **Fill in the PR template** — describe what changed and why

---

## Coding Standards

### PHP

- Follow [WordPress PHP Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
- All output must be properly escaped (`esc_html()`, `esc_url()`, `esc_attr()`, `wp_kses_post()`)
- All input must be sanitized (`sanitize_text_field()`, `absint()`, `sanitize_key()`, etc.)
- Use nonces for all form submissions and AJAX requests
- Follow the existing PSR-4 namespace structure: `OneMeta\Core\`, `OneMeta\Admin\`, `OneMeta\API\`
- Use the existing singleton pattern for new classes

### JavaScript

- Vanilla ES Modules only — no jQuery, no additional frameworks
- Follow the existing modular architecture in `src/js/`
- Use `async/await` for asynchronous operations
- Always handle errors with `try/catch`

### SCSS

- Follow the existing 7-1 SCSS architecture in `src/scss/`
- Use existing variables from `abstracts/_variables.scss`
- Use existing mixins from `abstracts/_mixins.scss`
- Use the `onemeta-` prefix for all CSS class names

---

## Adding a New Field Type

If you want to contribute a new field type, it needs to be implemented in several places:

1. **`includes/Core/FieldRenderer.php`** — render the field HTML
2. **`includes/Core/Sanitizer.php`** — sanitize the saved value
3. **`includes/Admin/FieldTypeSchemas.php`** — define the field's settings schema
4. **`src/js/admin/pages/docs.js`** — add usage documentation
5. **`includes/Admin/views/docs.php`** — add to the field types array
6. **`includes/Admin/views/builder.php`** — add to the field type `<select>`
7. **Frontend JS** in `src/js/frontend/fields/` if the field needs client-side behaviour

Please open an issue first to discuss new field types before building them — this avoids wasted effort if the type doesn't fit the project's scope.

---

## Reporting Bugs

Please use the [bug report template](https://github.com/fronttheme/onemeta/issues/new?template=bug_report.md) and include:

- WordPress version
- PHP version
- OneMeta version
- Steps to reproduce
- Expected vs actual behaviour
- Any error messages from the browser console or PHP error log

---

## Questions?

Open a [GitHub Discussion](https://github.com/fronttheme/onemeta/discussions) or email [hellofronttheme@gmail.com](mailto:hellofronttheme@gmail.com).