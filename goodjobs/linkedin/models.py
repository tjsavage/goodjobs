from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import simplejson
from django.core import serializers

class LinkedInUserManager(BaseUserManager):
    def create(self, linkedin_id, oauth_code):
        if not linkedin_id or not oauth_code:
            raise ValueError("Users must be created with a linkedin in and an oauth code")

        user = self.model(
            linkedin_id=linkedin_id,
            oauth_code=oauth_code
        )

        user.set_password("a")

        user.save(using=self._db)
        return user

    def get_or_create(self, linkedin_id, oauth_code):
        try:
            user = self.get(linkedin_id=linkedin_id)
            user.oauth_code = oauth_code
            user.save()
            return user
        except:
            return self.create(linkedin_id, oauth_code)


class UserProfile(AbstractBaseUser):
    linkedin_id = models.CharField(max_length=255, unique=True)
    oauth_token = models.CharField(max_length=255)
    oauth_code = models.CharField(max_length=255)
    date_joined = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    picture_url = models.CharField(max_length=255, blank=True, null=True)
    headline = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    tags = models.ManyToManyField("Tag")

    objects = LinkedInUserManager()

    USERNAME_FIELD = 'linkedin_id'
    REQUIRED_FIELDS = ['oauth_code']

    def __unicode__(self):
        return "%s %s" % (self.first_name, self.last_name)

    def path_json_dict(self):
        d = {}

        d["linkedin_id"] = self.linkedin_id
        d["first_name"] = self.first_name
        d["last_name"] = self.last_name
        d["picture_url"] = self.picture_url
        d["experiences"] = []

        for e in Experience.objects.filter(user=self):
            d["experiences"].append(e.json_dict())

        return d

class Experience(models.Model):
    linkedin_id = models.CharField(max_length=50, null=True, default=None)
    organization = models.ForeignKey("Organization", null=True)
    start_year = models.IntegerField(null=True)
    start_month = models.IntegerField(null=True)
    end_year = models.IntegerField(null=True)
    end_month = models.IntegerField(null=True)
    summary = models.TextField(blank=True)
    title = models.CharField(max_length=100)
    user = models.ForeignKey("UserProfile")

    def __unicode__(self):
        return "%s from %s" % (self.organization, self.start_year)

    def json_dict(self):
        d = {}
        d["linkedin_id"] = self.linkedin_id
        if self.start_year:
            d["start_year"] = self.start_year
        if self.start_month:
            d["start_month"] = self.start_month
        if self.end_year:
            d["end_year"] = self.end_year
        if self.end_month:
            d["end_month"] = self.end_month
        if self.summary:
            d["summary"] = self.summary
        if self.title :
            d["title"] = self.title
        if self.organization:
            d["organization"] = self.organization.json_dict()
        
        return d

class Organization(models.Model):
    linkedin_id = models.CharField(max_length=200, null=True, default=None)
    industry = models.ForeignKey("Industry", null=True)
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    website_url = models.CharField(max_length=255, null=True, blank=True)
    logo_url = models.CharField(max_length=255, null=True, blank=True)
    locations_description = models.TextField(null=True, blank=True)
    employee_count_range = models.CharField(max_length=255, null=True, blank=True)

    company_type = models.CharField(max_length=100)
    tags = models.ManyToManyField("Tag")

    def __unicode__(self):
        return "%s" % self.name

    def json_dict(self):
        d = {}
        if self.linkedin_id:
            d["linkedin_id"] = self.linkedin_id
        if self.name:
            d["name"] = self.name
        if self.size:
            d["size"] = self.size
        if self.company_type:
            d["company_type"] = self.company_type
        if self.industry:
            d["industry"] = self.industry.name

        return d

class Industry(models.Model):
    name = models.CharField(max_length=100)

    def __unicode__(self):
        return "%s" % self.name

class Tag(models.Model):
    name = models.CharField(max_length=100)

    def __unicode__(self):
        return "%s" % self.name

    def json_dict(self):
        d = {}
        d["name"] = self.name
        d["id"] = self.pk

        return d