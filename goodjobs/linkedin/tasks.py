from celery import task
from linkedin import linkedin as linkedin_api

import requests

from django.conf import settings

from goodjobs.linkedin.models import UserProfile

import logging, sys

logger = logging.getLogger(__name__)

@task()
def received_code(auth_code):
    pass


    