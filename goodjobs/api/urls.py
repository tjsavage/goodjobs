from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = patterns('goodjobs.api.views',
    url(r'path/$', 'my_path'),
    url(r'path/child/$', 'child'),
    url(r'path/suggestions/$', 'suggestions'),
    url(r'tags/$', 'tags'),
)