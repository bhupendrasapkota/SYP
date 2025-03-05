from .base import *

DEBUG = False

ALLOWED_HOSTS = ['afterproduction-domain.com']

# Security
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Static Files
STATIC_ROOT = BASE_DIR / 'staticfiles'
