import logging

import requests

from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.conf import settings
from django.contrib.auth import login
from django.contrib import auth

from goodjobs.linkedin import tasks, models
from goodjobs.linkedin.lib import linkedin_api

logger = logging.getLogger(__name__)

def connect(request):
    if request.GET.get("code"):
        code = request.GET.get("code")
        token = linkedin_api.get_auth_token(code, "http://%s/linkedin/connect" % request.get_host())
        profile_info = linkedin_api.get_profile(token)

        user = models.UserProfile.objects.get_or_create(profile_info['id'], code)
        user = auth.authenticate(username=str(user.linkedin_id), password="a")
        login(request, user)

        user.first_name = profile_info['firstName']
        user.last_name = profile_info['lastName']
        user.save()

        return HttpResponseRedirect('/splash/registered/')
    else:
        return HttpResponse(status=404)


def authenticate(request):
    url = linkedin_api.get_auth_code_url("http://%s/linkedin/connect" % request.get_host())
        
    logger.debug("Redirecting to: %s" % url)
    return HttpResponseRedirect(url)