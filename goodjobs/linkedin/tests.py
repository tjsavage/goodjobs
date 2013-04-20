"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TestCase
from django.utils import simplejson
import os, sys

from goodjobs.linkedin.tasks import parse_user_data
from goodjobs.linkedin.models import UserProfile, Experience, Organization

import logging
logging.basicConfig( 
    stream=sys.stdout, 
    level=logging.DEBUG, 
    format='"%(asctime)s %(levelname)8s %(name)s - %(message)s"', 
    datefmt='%H:%M:%S' 
) 

logger = logging.getLogger(__file__)

class ParseTest(TestCase):
    def test_parse_profile(self):
        user = UserProfile(linkedin_id="sKH-8eGqP9")
        user.save()
        json_data = simplejson.load(open(os.path.join(os.path.dirname(__file__), 'linkedin_profile.json')))

        parse_user_data(user, json_data)

        self.assertEquals(user.first_name, "Taylor")

        experiences = Experience.objects.filter(user=user)

        self.assertEquals(experiences.count(), 8)
        self.assertEquals(experiences.filter(organization__name="BlackRock").count(), 1)
        self.assertEquals(experiences.get(organization__name="BlackRock").start_year, 2012)

        self.assertEquals(Organization.objects.all().count(), 8)
        self.assertEquals(Organization.objects.filter(name="Pivotal Labs").count(), 1)

        self.assertEquals(user.last_experience.organization.name, "Stanford Student Enterprises")
        
class JSONTest(TestCase):
    def setUp(self):
        user = UserProfile(linkedin_id="sKH-8eGqP9")
        user.save()
        json_data = simplejson.load(open(os.path.join(os.path.dirname(__file__), 'linkedin_profile.json')))

        parse_user_data(user, json_data)

    def test_path_json(self):
        u = UserProfile.objects.all()[0]
        json_data = simplejson.loads(u.path_json())
        logger.debug(json_data)

        self.assertEquals("Taylor", json_data["first_name"])
        self.assertEquals(8, len(json_data["experiences"]))

        e = json_data["experiences"][1]
        logger.error(e["start_year"])

        self.assertEquals(2012, e["start_year"])

        o = e["organization"]
        self.assertEquals("BlackRock", o["name"])
        self.assertEquals("Financial Services", o["industry"])
