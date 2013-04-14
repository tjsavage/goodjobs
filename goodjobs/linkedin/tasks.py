from celery import task
from goodjobs.linkedin.models import UserProfile

@task()
def received_code(auth_code):
