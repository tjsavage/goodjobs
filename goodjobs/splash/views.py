from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required

def splash(request):
	return render_to_response('splash/launch.html', 
							{},
							context_instance=RequestContext(request))

@login_required
def registered(request):
    user = request.user

    return render_to_response("splash/registered.html", {"user": user})

@login_required
def choose_tags(request):
    user = request.user

    return render_to_response('splash/choose_tags.html',
                            {},
                            context_instance=RequestContext(request))