from django.forms import ModelForm

from goodjobs.linkedin.models import UserProfile, Organization, Experience, Tag

class OrganizationForm(ModelForm):
    class Meta:
        model = Organization
        exclude = ('linkedin_id',)

class UserProfileForm(ModelForm):
    class Meta:
        model = UserProfile
        exclude = ('password', 'last_login', 'linkedin_id', 'oauth_token', 'oauth_code', 'email', 'headline',)


class ExperienceForm(ModelForm):
    class Meta:
        model = Experience
        exclude = ('linkedin_id', )

class TagForm(ModelForm):
    class Meta:
        model = Tag