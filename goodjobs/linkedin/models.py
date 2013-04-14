from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


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

    objects = LinkedInUserManager()

    USERNAME_FIELD = 'linkedin_id'
    REQUIRED_FIELDS = ['oauth_code']

    def __unicode__(self):
        return "%s %s" % (self.first_name, self.last_name)
