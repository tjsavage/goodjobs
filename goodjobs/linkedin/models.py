from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.ForeignKey(User)
    oauth_token = models.CharField(max_length=200)
    date_joined = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
    	return "%s" % self.user


