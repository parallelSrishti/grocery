from application import app
from backend.models import db
from backend.sec import datastore
from werkzeug.security import generate_password_hash
import uuid


with app.app_context():
    db.create_all()


    datastore.find_or_create_role(name='admin',description='User is a Admin')
    db.session.commit()

    if not datastore.find_user(email='admin@email.com'):
        datastore.create_user(username='admin',email='admin@email.com',password=generate_password_hash('admin'),fs_uniquifier=str(uuid.uuid4()),roles=['admin'])


    datastore.find_or_create_role(name='manager',description='User is a Manager')
    
    datastore.find_or_create_role(name='user',description='User is a customer')
    db.session.commit()

    try:
        db.session.commit()
    except:
        pass
