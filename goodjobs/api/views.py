from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.utils import simplejson

from goodjobs.linkedin.models import Tag

def tags(request):
    if request.method == 'GET':
        tags = Tag.objects.all()
        tag_names = [tag for tag in tags]
        return HttpResponse(simplejson.dumps(tag_names))
    elif request.method == 'POST':
        tagName = request.POST.get("name").lower()
        tag, created = Tag.objects.get_or_create(name="name")
        if created:
            return HttpResponse(simplejson.dumps(tag), status=201)
        else:
            return HttpResponse(simplejson.dumps(tag), status=202)
    

@login_required
def my_path(request):
    user = request.user

    return HttpResponse(simplejson.dumps(user.path_json_dict()))

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