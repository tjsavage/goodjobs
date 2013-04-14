import logging

from django.shortcuts import render_to_response
from django.http import HttpResponse

from goodjobs.linkedin.tasks import add

logger = logging.getLogger(__name__)

def connect(request):
	if request.GET.get("code"):
		code = request.GET.get("code")
	else:
		code = None
	add.delay(2,3)
	return HttpResponse(code)
