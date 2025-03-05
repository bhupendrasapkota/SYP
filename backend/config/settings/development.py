from .base import *
from decouple import config
import os

# Debug Mode
DEBUG = config('DEBUG', default=True, cast=bool)

# Allowed Hosts
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

# Static Files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static'] if os.path.exists(BASE_DIR / 'static') else []

# Email Backend for Development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
