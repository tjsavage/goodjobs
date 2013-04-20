from celery import task
import datetime

import requests

from django.conf import settings

from goodjobs.linkedin.models import UserProfile, Experience, Organization, Industry, Tag

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
    experience = None
    for individual_position_data in positions_data:
        if individual_position_data == positions_data[0]:
            user.last_experience = parse_experience(user, individual_position_data)
        else
            parse_experience(user, individual_position_data)
    user.save()

def parse_experience(user, individual_position_data):
    experience, created = Experience.objects.get_or_create(linkedin_id=individual_position_data["id"],
                                                                user=user)
    experience.linkedin_id = individual_position_data["id"]
    if "startDate" in individual_position_data:
        if "year" in individual_position_data["startDate"]:
            experience.start_year = individual_position_data["startDate"]["year"]
        if "month" in individual_position_data["startDate"]:
            experience.start_month = individual_position_data["startDate"]["month"]
    if "endDate" in individual_position_data:
        experience.end_year = individual_position_data["endDate"]["year"]
        if "month" in individual_position_data["endDate"]:
            experience.end_month = individual_position_data["endDate"]["month"]
    if "summary" in individual_position_data:
        experience.summary = individual_position_data["summary"]
    if "title" in individual_position_data:
        experience.title = individual_position_data["title"]
    if "company" in individual_position_data:
        experience.organization = parse_organization(experience, individual_position_data["company"])
    
    experience.save()

    update_organization.apply_async((experience.organization, user.oauth_token, ))

    return experience

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

@task()
def update_organization(organization, token):
    fields = ['id', 'name', 'description', 'logo-url', 'employee-count-range', 'specialties', 'industries']
    org_json = linkedin_api.get_company(token, organization.linkedin_id, fields=fields)

    if not org_json:
        return
        
    if "description" in org_json:
        organization.description = org_json["description"]
    if "employeeCountRange" in org_json:
        organization.employee_count_range = org_json["employeeCountRange"]["name"]
    if "industries" in org_json:
        for industry_json in org_json["industries"]["values"]:
            industry_name = industry_json["name"]
            industry_name = industry_name.lower()
            tag, created = Tag.objects.get_or_create(name=industry_name)

            organization.tags.add(tag)
    if "specialties" in org_json:
        for specialty in org_json["specialties"]["values"]:
            specialty = specialty.lower()
            tag, created = Tag.objects.get_or_create(name=specialty)

            organization.tags.add(tag)
    organization.save()


def parse_industry(organization, industry_name):
    industry, created = Industry.objects.get_or_create(name=industry_name)
    return industry
