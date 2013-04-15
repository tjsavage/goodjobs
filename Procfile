web: .heroku/python/bin/python manage.py run_gunicorn -b "0.0.0.0:$PORT" --settings=goodjobs.settings.production
worker: .heroku/python/bin/python manage.py celeryd -E -B --loglevel=INFO --settings=goodjobs.settings.production
