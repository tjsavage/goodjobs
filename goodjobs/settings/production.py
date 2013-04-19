from goodjobs.settings.common import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

INSTALLED_APPS += (
	'gunicorn',
)

ALLOWED_HOSTS = ['67.228.172.86']

BROKER_HOST = 'tiger.cloudamqp.com'
BROKER_USER = "mphawjwv"
BROKER_PASSWORD = "qEocrL3mWtNGM2e3yO__g2fMyqkPWvLQ"
BROKER_VHOST = "mphawjwv"