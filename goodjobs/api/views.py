from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.utils import simplejson

import random

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

def tags_suggestions(request):
    name = request.GET.get("name")

    industries = ["accounting", "airlines", "animation", "apparel & fashion", "architecture & plannning",
                "automotive", "banking", "biotechnology", "chemicals", "civil engineering", "computers"]

    similar_tags = [{"id": 1, "name": industries[random.randint(0, len(industries) - 1)]} for i in range(3)]

    return HttpResponse(simplejson.dumps(similar_tags))

def tags_initial(request):
    initial_tags = [
        {"name": "oil refining",
        "id": 4},
        {"name": "swimming",
        "id": 5},
        {"name": "forestry",
        "id": 6}]

    return HttpResponse(simplejson.dumps(initial_tags))