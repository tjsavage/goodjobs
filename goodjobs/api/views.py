from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.utils import simplejson


@login_required
def my_path(request):
    path = {
            "real": True,
            "firstName": "Taylor",
            "lastName": "Savage",
            "nodes" : [
                    {
                        "type": "experience",
                        "start_date": "2013-04-14 22:59:04.605744+00:00",
                        "industry": "Computer Science",
                        "organization": "Stanford University",
                        "position": "Graduate"
                    }, 
                    {
                        "type": "experience",
                        "start_date": "2014-04-14 22:59:04.605744+00:00",
                        "industry": "Technology",
                        "organization": "Google",
                        "position": "APM"
                    }
                ]
            }
    return HttpResponse(simplejson.dumps(path))

def child(request):
    child = {
            "start_date": "2015-04-14 22:59:04.605744+00:00",
            "industry": "Technology",
            "organization": "US Government",
            "position": "Child"
        }

    return HttpResponse(simplejson.dumps(child))

"""
Takes a root node and returns a list of path suggestions
"""
def suggestions(request):
    paths = [
        {
            "real": True,
            "firstName": "Jim",
            "lastName": "Beam",
            "nodes" : [
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
                }
            ]
            
        }
        ,
        {
            "real": False,
            "nodes": [
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
                }
            ]
        }
    ]
    return HttpResponse(simplejson.dumps(paths))