from goodjobs.settings.common import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

INSTALLED_APPS += (
	'gunicorn',
)