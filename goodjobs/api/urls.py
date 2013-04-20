from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = patterns('goodjobs.api.views',
    url(r'path/$', 'my_path'),
    url(r'path/child/$', 'child'),
    url(r'path/suggestions/$', 'suggestions'),
    url(r'path/(?P<user_id>\d+)/', 'get_path'),
    url(r'tags/$', 'tags'),
    url(r'tags/suggestions/$', 'tags_suggestions'),
    url(r'tags/initial/$', 'tags_initial'),
    url(r'tags/user/(?P<user_id>\d+)/$', 'user_tags')
)
