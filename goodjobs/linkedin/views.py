import logging

from django.shortcuts import render_to_response
from django.http import HttpResponse

logger = logging.getLogger(__name__)

def connect(request):
	if request.GET.get("code"):
		code = request.GET.get("code")
	else:
		code = None
	return HttpResponse(code)