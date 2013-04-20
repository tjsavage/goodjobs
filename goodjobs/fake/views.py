import random

from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.template import RequestContext

from goodjobs.fake.forms import OrganizationForm, UserProfileForm, ExperienceForm, TagForm
from goodjobs.linkedin.models import UserProfile, Organization, Experience

def index(request):
    users = UserProfile.objects.all()
    organizations = Organization.objects.all()
    experiences = Experience.objects.all()

    return render_to_response("fake/index.html", {"users": users, "organizations": organizations, "experiences": experiences})

def organization(request):
    org = None
    if request.method == 'POST':
        if request.POST.get("org_id", None):
            form = OrganizationForm(request.POST, instance=Organization.objects.get(pk=int(request.POST.get("org_id"))))
        else:
            form = OrganizationForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("Saved!")

    else:
        if request.GET.get("org_id", None):
            org = Organization.objects.get(pk=int(request.GET.get("org_id")))
            form = OrganizationForm(instance=org)
        else:
            form = OrganizationForm()

    return render_to_response("fake/form.html", {"form": form, "model": "organization", "organization": org}, context_instance=RequestContext(request))

def userprofile(request):
    user = None
    if request.method == 'POST':
        if request.POST.get("id", None):
            form = UserProfileForm(request.POST, instance=UserProfile.objects.get(pk=int(request.POST.get("id"))))
        else:
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
        if request.GET.get("id", None):
            user = UserProfile.objects.get(pk=int(request.GET.get("id")))
            form = UserProfileForm(instance=user)
        else:
            form = UserProfileForm()

    return render_to_response("fake/form.html", {"form": form, "model": "userprofile", "user":user}, context_instance=RequestContext(request))

def experience(request):
    experience = None
    if request.method == 'POST':
        if request.POST.get("experience_id", None):
            form = ExperienceForm(request.POST, instance=Experience.objects.get(pk=int(request.POST.get("experience_id"))))
        else:
            form = ExperienceForm(request.POST)
        if form.is_valid():
            experience = form.save()
            return HttpResponse("%s" % experience)
    else:
        if request.GET.get("experience_id", None):
            experience = Experience.objects.get(pk=int(request.GET.get("id")))
            form = ExperienceForm(instance=experience)
        else:
            form = ExperienceForm()

    return render_to_response("fake/form.html", {"form": form, "model": "experience", "experience": experience}, context_instance=RequestContext(request))

def tag(request):
    if request.method == 'POST':
        form = TagForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse("Saved!")

    else:
        form = Tag()

    return render_to_response("fake/form.html", {"form": form, "model": "tag"}, context_instance=RequestContext(request))
