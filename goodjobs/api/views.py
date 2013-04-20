from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.utils import simplejson
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

import random

from goodjobs.linkedin.models import Tag, UserProfile, Organization, Experience

@csrf_exempt
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
@csrf_exempt
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
@csrf_exempt
@login_required
def suggestions(request):
    user = request.user
    my_tags = user.tags.all()
    my_organzations = Organization.objects.filter(user=user)
    last_organization_id = request.GET.get("organization_id")
    my_last_organization = Organization.objects.get(pk=last_organization_id)





    while True: 
        other_user = UserProfile.objects.all().order_by("?")[0]
        for tag in my_tags:
            if tag in other_user.tags.all():
                return HttpResponse(simplejson.dumps(user.path_json_dict()))









@login_required
@csrf_exempt
def user_tags(request, user_id):
    if not str(request.user.pk) == str(user_id):
        return HttpResponse(user_id, status=403)

    if request.method == 'GET':
        tags = user.tags.all()
        json_data = [tag.json_dict() for tag in tags]

        return HttpResponse(simplejson.dumps(json_data))
    elif request.method == 'POST':
        data = simplejson.loads(request.raw_post_data)
        tag = get_object_or_404(Tag, pk=data["id"])
        request.user.tags.add(tag)
        request.user.save()

        return HttpResponse(status=201)
    elif request.method == 'DELETE':
        data = simplejson.loads(request.raw_post_data)
        tag = get_object_or_404(Tag, pk=data["id"])
        request.user.tags.remove(tag)
        request.user.save()

        return HttpResponse(status=200)
    return HttpResponse(status=400)

@csrf_exempt
def tags_suggestions(request):
    num = request.GET.get("num", 30)
    name = request.GET.get("name")

    tags = Tag.objects.all().order_by("?")[:num]
    data = [tag.json_dict() for tag in tags]

    return HttpResponse(simplejson.dumps(data))

@csrf_exempt
def tags_initial(request):
    num = request.GET.get("num", 40)
    tags = Tag.objects.all()[:num]

    data = [tag.json_dict() for tag in tags]

    return HttpResponse(simplejson.dumps(data))