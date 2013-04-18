from celery import task
import datetime

import requests

from django.conf import settings

from goodjobs.linkedin.models import UserProfile, Experience, Organization, Industry

import logging, sys

from goodjobs.linkedin.lib import linkedin_api

logger = logging.getLogger(__name__)

@task()
def crawl_linkedin(user):
    fields = ["id","first-name","last-name","picture-url","positions","educations","email-address"]
    json_data = linkedin_api.get_profile(user.oauth_token, fields)
    parse_user_data(user, json_data)

def parse_user_data(user, json_data):
    update_user(user, json_data)
    user.save()

def update_user(user, json_data):
    user.linkedin_id = json_data["id"]
    user.first_name = json_data["firstName"]

    if 'lastName' in json_data:
        user.last_name = json_data['lastName']

    if 'pictureUrl' in json_data:
        user.picture_url = json_data['pictureUrl']

    if 'emailAddress' in json_data:
        user.email = json_data['emailAddress']

    if 'positions' in json_data:
        if 'values' in json_data['positions']:
            parse_experiences(user, json_data["positions"]["values"])

def parse_experiences(user, positions_data):
    for individual_position_data in positions_data:
        parse_experience(user, individual_position_data)    

def parse_experience(user, individual_position_data):
    experience, created = Experience.objects.get_or_create(linkedin_id=individual_position_data["id"],
                                                                user=user)
    experience.linkedin_id = individual_position_data["id"]
    experience.start_year = individual_position_data["startDate"]["year"]
    if "month" in individual_position_data["startDate"]:
        experience.start_month = individual_position_data["startDate"]["month"]
    if "endDate" in individual_position_data:
        experience.end_year = individual_position_data["endDate"]["year"]
        if "month" in individual_position_data["endDate"]:
            experience.end_month = individual_position_data["endDate"]["month"]
    experience.summary = individual_position_data["summary"]
    experience.title = individual_position_data["title"]
    experience.organization = parse_organization(experience, individual_position_data["company"])
    experience.save()

def parse_organization(organization, individual_company_data):
    organization_linkedin_id = individual_company_data["id"] if "id" in individual_company_data else None
    organization_name = individual_company_data["name"]

    organization, created = Organization.objects.get_or_create(linkedin_id=organization_linkedin_id,
                                                                name=organization_name)
    if "id" in individual_company_data:
        organization.linkedin_id = individual_company_data["id"]
    if "size" in individual_company_data:
        organization.size = individual_company_data["size"]
    if "type" in individual_company_data:
        organization.company_type = individual_company_data["type"]
    if "industry" in individual_company_data:
        organization.industry = parse_industry(organization, individual_company_data["industry"])

    organization.save()
    return organization

def parse_industry(organization, industry_name):
    industry, created = Industry.objects.get_or_create(name=industry_name)
    return industry
