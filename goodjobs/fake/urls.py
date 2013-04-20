from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = patterns('goodjobs.fake.views',
    url(r'organization/$', 'organization'),
    url(r'experience/$', 'experience'),
    url(r'userprofile/$', 'userprofile'),
    url(r'tag/$', 'tag'),
    url(r'$', 'index'),

)
