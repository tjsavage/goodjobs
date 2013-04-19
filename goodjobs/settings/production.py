from goodjobs.settings.common import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

INSTALLED_APPS += (
	'gunicorn',
)

ALLOWED_HOSTS = ['67.228.172.86', 'arkk.herokuapp.com', 'arkk.co', 'www.arkk.co']

BROKER_POOL_LIMIT = 1
BROKER_URL = 'amqp://mphawjwv:qEocrL3mWtNGM2e3yO__g2fMyqkPWvLQ@tiger.cloudamqp.com/mphawjwv'
BROKER_HOST = 'tiger.cloudamqp.com'
BROKER_USER = "mphawjwv"
BROKER_PASSWORD = "qEocrL3mWtNGM2e3yO__g2fMyqkPWvLQ"
BROKER_VHOST = "mphawjwv"

CELERYD_LOG_LEVEL  = 'DEBUG'
CELERY_RESULT_BACKEND = "redis"
CELERY_TASK_RESULT_EXPIRES = 150000
CELERYD_CONCURRENCY = 1
CELERYD_MAX_TASKS_PER_CHILD = 1