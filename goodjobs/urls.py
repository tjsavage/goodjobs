from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'goodjobs.splash.views.splash'),
    url(r'^linkedin/', include('goodjobs.linkedin.urls')),
    url(r'^splash/', include('goodjobs.splash.urls')),
    url(r'^ark/', include('goodjobs.ark.urls')),
    url(r'api/', include('goodjobs.api.urls')),
    url(r'fake/', include('goodjobs.fake.urls')),


    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)