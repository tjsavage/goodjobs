from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = patterns('goodjobs.linkedin.views',
    url(r'connect/$', 'connect'),
)