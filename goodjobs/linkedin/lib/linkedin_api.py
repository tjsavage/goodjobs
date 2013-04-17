import requests

import logging

from django.conf import settings

logger = logging.getLogger(__file__)

def get_profile(token, fields=['id', 'first-name', 'last-name']):
    data = {'oauth2_access_token': token,
            'format': 'json'}
    fields_str = ":(" + ",".join(fields) + ")"
    r = requests.get('https://api.linkedin.com/v1/people/~%s' % fields_str, params=data)
    r.raise_for_status()
    
    logger.debug("Profile response: %s" % r.json())

    return r.json()

def get_auth_token(code, redirect_uri):
    data = {'grant_type':'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': settings.LINKEDIN_CLIENT_ID,
            'client_secret': settings.LINKEDIN_SECRET_KEY}
    r = requests.post('https://www.linkedin.com/uas/oauth2/accessToken', params=data)
    response = r.json()

    logger.debug("Response: %s", response)


    return response["access_token"]

def get_auth_code_url(redirect_uri):
    return 'https://www.linkedin.com/uas/oauth2/authorization?response_type=%s&client_id=%s&scope=%s&state=%s&redirect_uri=%s' % (
            'code',
            settings.LINKEDIN_CLIENT_ID,
            'r_fullprofile%20r_basicprofile%20r_emailaddress%20r_network%20r_contactinfo',
            '84hsff98349whSjdflj',
            redirect_uri)