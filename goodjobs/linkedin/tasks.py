from celery import task

import requests

from django.conf import settings

from goodjobs.linkedin.models import UserProfile, Experience, Organization, Industry

import logging, sys

from goodjobs.linkedin.lib import linkedin_api

logger = logging.getLogger(__name__)

@task()
def crawl_linkedin(user):
    fields = ["id","first-name","last-name","picture-url","positions","educations"]
    json_data = linkedin_api.get_profile(user.oauth_token, fields)
    update_user(user, json_data)

@task()
def update_user(user, json_data):
    user.linkedin_id = json_data["id"]
    user.first_name = json_data["firstName"]
    user.last_name = json_data["lastName"]
    user.picture_url = json_data["pictureUrl"]

    user.save()

    parse_experiences(user, json_data["positions"]["values"])

def parse_experiences(user, positions_data):
    for position_data in positions_data:
        experience = Experience.objects.get_or_create(linkedin_id=position_data["id"])
        update_experience(experience, position_data)
   
def update_experience(experience, position_data):
    pass