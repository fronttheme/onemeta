# Security Policy

## Supported Versions

Only the latest stable release of OneMeta receives security updates.

| Version | Supported |
|---|---|
| 1.0.x (latest) | ✅ |
| < 1.0.0 | ❌ |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in OneMeta, please report it responsibly by emailing:

📧 **[hellofronttheme@gmail.com](mailto:hellofronttheme@gmail.com)**

Please include the subject line: `[Security] OneMeta Vulnerability Report`

### What to Include

- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Your WordPress and PHP version
- Any proof-of-concept code if applicable

### What to Expect

- **Acknowledgement** within 48 hours
- **Assessment** of severity and scope within 5 business days
- **Fix** released as soon as possible depending on severity
- **Credit** in the changelog if you wish, once the issue is resolved

We appreciate responsible disclosure and will work with you to address the issue promptly.

---

## Security Best Practices When Using OneMeta

- Always keep OneMeta updated to the latest version
- Ensure your WordPress installation and PHP are up to date
- Only grant `manage_options` capability to trusted administrators — the OneMeta REST API and admin interface require this capability
- Always escape output when displaying field values in your theme (use `esc_html()`, `esc_url()`, `wp_kses_post()` etc.)