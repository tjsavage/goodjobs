from goodjobs.settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG

INSTALLED_APPS += (
	'gunicorn',
)

ALLOWED_HOSTS = ['67.228.172.86']