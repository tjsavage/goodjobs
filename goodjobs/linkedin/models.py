from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import simplejson

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
    linkedin_id = models.CharField(max_length=200, unique=True)
    oauth_token = models.CharField(max_length=200)
    oauth_code = models.CharField(max_length=200)
    date_joined = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    picture_url = models.CharField(max_length=100, blank=True, null=True)
    headline = models.CharField(max_length=300, blank=True, null=True)
    tags = models.ManyToManyField("Tag")

    objects = LinkedInUserManager()

    USERNAME_FIELD = 'linkedin_id'
    REQUIRED_FIELDS = ['oauth_code']

    def __unicode__(self):
        return "%s %s" % (self.first_name, self.last_name)

class Experience(models.Model):
    organization = models.ForeignKey("Organization")
    startDate = models.DateField()
    endDate = models.DateField(null=True)
    summary = models.TextField()
    title = models.CharField(max_length=100)
    user = models.ForeignKey("UserProfile")

    def __unicode__(self):
        return "%s from %s" % (self.organization, self.startDate)

class Organization(models.Model):
    linkedin_id = models.CharField(max_length=200)
    industry = models.ForeignKey("Industry")
    name = models.CharField(max_length=200)
    size = models.CharField(max_length=50, null=True, blank=True)
    company_type = models.CharField(max_length=100)
    tags = models.ManyToManyField("Tag")

    def __unicode__(self):
        return "%s" % self.name

class Industry(models.Model):
    name = models.CharField(max_length=100)

    def __unicode__(self):
        return "%s" % self.name

class Tag(models.Model):
    name = models.CharField(max_length=100)

    def __unicode__(self):
        return "%s" % self.name
