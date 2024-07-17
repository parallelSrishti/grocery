import os
from flask import Flask, send_from_directory
from flask_security import Security
from backend.models import db
from configuration import DevelopmentConfig
from backend.resources import api
from backend.sec import datastore
from backend.worker import celery_init_app
from celery.schedules import crontab
from backend.tasks import remainder_message,report_message
from backend.instances import cache


def create_app():
    app = Flask(__name__,static_folder='/home/srishti/grocery_full/static')
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    app.security = Security(app,datastore)
    cache.init_app(app)
    with app.app_context():
        import backend.views
    return app

app = create_app()
celery_app = celery_init_app(app)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),'favicon.ico', mimetype='image/vnd.microsoft.icon')

@celery_app.on_after_configure.connect
def daily_email(sender,**kwargs):
    sender.add_periodic_task(
        crontab(hour=13,minute=27),
        remainder_message.s()
    )

@celery_app.on_after_configure.connect
def monthly_email(sender,**kwargs):
    sender.add_periodic_task(
        crontab(hour=19,minute=27,day_of_month=2),
        report_message.s()
    )

if __name__ == '__main__':
    app.run(debug=True)