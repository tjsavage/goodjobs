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
    for individual_position_data in positions_data:
        experience = Experience.objects.get_or_create(linkedin_id=individual_position_data["id"])
        update_experience(experience, individual_position_data)
    experience.user = user
    

def update_experience(experience, individual_position_data):
    experience.linkedin_id = individual_position_data["id"]
    experience.startDate = individual_position_data["startDate"]
    if "endDate" in individual_position_data:
        experiences.endDate = individual_position_data[""]
    experience.summary = individual_position_data["summary"]  
    experience.title = individual_position_data["title"]
    experience.organization = parse_organization(experience, individual_position_data["company"])
    experience.save()


def parse_organization(experience, individual_company_data):
    organization = Organization.objects.get_or_create(linkedin_id=individual_company_data["id"])
    update_organization(organization, individual_company_data)
    return organization

def update_organization(organization, individual_company_data):
    organization.linkedin_id = individual_company_data["id"]
    organization.name = individual_company_data["name"]
    organization.size = individual_company_data["size"]
    organization.company_type = individual_company_data["type"]
    organization.industry = parse_industry(organization, individual_company_data["industry"])
    organization.save()


def parse_industry(organization, individual_industry_data):
    industry = Industry.objects.get_or_create(linkedin_id=individual_industry_data["name"])
    update_industry(industry, individual_industry_data)
    return industry


def update_industry(industry, individual_industry_data):
    industry.name = individual_industry_data["name"]
    industry.save()
>>>>>>> b295e9da3b69129f4fa80506f22899174217b1c6
