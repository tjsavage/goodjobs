from django.shortcuts import render_to_response
from django.template import RequestContext

def splash(request):
	return render_to_response('splash/launch.html', 
							{},
							context_instance=RequestContext(request))