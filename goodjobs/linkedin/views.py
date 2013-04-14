import logging

from django.shortcuts import render_to_response
from django.http import HttpResponse

from goodjobs.linkedin.tasks import received_code

logger = logging.getLogger(__name__)

def connect(request):
	if request.GET.get("code"):
		code = request.GET.get("code")
		received_code.delay(code)
	else:
		code = None
	return render_to_response("splash/registered.html")
