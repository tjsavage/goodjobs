import random

from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.template import RequestContext

from goodjobs.fake.forms import OrganizationForm, UserProfileForm, ExperienceForm, TagForm

def index(request):
    return render_to_response("fake/index.html")

def organization(request):
    if request.method == 'POST':
        form = OrganizationForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("Saved!")

    else:
        form = OrganizationForm()

    return render_to_response("fake/form.html", {"form": form, "model": "organization"}, context_instance=RequestContext(request))

def userprofile(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.password = " "
            user.linkedin_id = "".join([random.choice("abcdefghijklmnop") for i in range(10)])
            user.oauth_token = "".join([random.choice("abcdefghijklmnop") for i in range(10)])
            user.oauth_code = "".join([random.choice("abcdefghijklmnop") for i in range(10)])
            user.save()
            return HttpResponse("Saved!")

    else:
        form = UserProfileForm()

    return render_to_response("fake/form.html", {"form": form, "model": "userprofile"}, context_instance=RequestContext(request))

def experience(request):
    if request.method == 'POST':
        form = ExperienceForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("Saved!")

    else:
        form = ExperienceForm()

    return render_to_response("fake/form.html", {"form": form, "model": "experience"}, context_instance=RequestContext(request))

def tag(request):
    if request.method == 'POST':
        form = TagForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("Saved!")

    else:
        form = Tag()

    return render_to_response("fake/form.html", {"form": form, "model": "tag"}, context_instance=RequestContext(request))
