from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.utils import simplejson


@login_required
def my_path(request):
    path = [
        {
            "start_date": "2009-04-14 22:59:04.605744+00:00",
            "industry": "Computer Science",
            "organization": "Stanford University",
            "position": "Student"
        },
        {
            "start_date": "2012-04-14 22:59:04.605744+00:00",
            "industry": "Finance",
            "organization": "BlackRock",
            "position": "Analyst"
        },
        {
            "start_date": "2013-04-14 22:59:04.605744+00:00",
            "industry": "Computer Science",
            "organization": "Stanford University",
            "position": "Graduate"
        }, 
        {
            "start_date": "2014-04-14 22:59:04.605744+00:00",
            "industry": "Technology",
            "organization": "Google",
            "position": "APM"
        }
    ]
    return HttpResponse(simplejson.dumps(path))

def child(request):
    child = {
            "start_date": "2015-04-14 22:59:04.605744+00:00",
            "industry": "Technology",
            "organization": "US Government",
            "position": "Child"
        }

    return HttpResponse(simplejson.dumps(child))