from goodjobs.settings.common import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

BROKER_URL = 'amqp://guest:guest@localhost:5672//'

INSTALLED_APPS += (
	'gunicorn',
)