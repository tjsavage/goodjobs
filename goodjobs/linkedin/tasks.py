from celery import task

import requests

from django.conf import settings

from goodjobs.linkedin.models import UserProfile

import logging, sys

logger = logging.getLogger(__name__)

@task()
def crawl_linkedin(user):
    pass


    