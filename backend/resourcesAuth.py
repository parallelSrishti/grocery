from flask_restful import Resource,reqparse
from .models import db
from .sec import datastore
from werkzeug.security import generate_password_hash,check_password_hash
import uuid


loginParser = reqparse.RequestParser()
loginParser.add_argument('email',type=str,required=True,help='Email field is missing!')
loginParser.add_argument('password',type=str,required=True,help='Password field cannot be empty!')

class Login(Resource):
    def post(self):
        try:
            args = loginParser.parse_args()
            email = args['email']
            password = args['password']

            user = datastore.find_user(email=email)

            if not user:
                return {"message":"User not Found"},404
        
            if user.active == False:
                return {"message":"You are not authorized yet!"},401
        
            if check_password_hash(user.password,password):
                return {
                    "token":user.get_auth_token(),
                    "email":user.email,
                    "role":user.roles[0].name,
                    "username":user.username
                    },200
            else:
                return {"message":"Authentication failed"},400
        except Exception as e:
            print(e)
            return {"message":"Internal server error"},500



signupParser = reqparse.RequestParser()
signupParser.add_argument('username',type=str,required=True,help='Username field is missing!')
signupParser.add_argument('email',type=str,required=True,help='Email field is missing!')
signupParser.add_argument('password',type=str,required=True,help='Both Password field cannot be empty!')
signupParser.add_argument('confirmPassword',type=str,required=True,help='Both Password field cannot be empty!')

class UserSignUp(Resource):
    def post(self):
        try:
            args = signupParser.parse_args()
            username = args['username']
            email = args['email']
            password = args['password']
            confirm_password = args['confirmPassword']
            
            if password != confirm_password:
                return {"message":"Password doesn't match"},400

            if not datastore.find_user(email=email):
                datastore.create_user(
                    username=username,
                    email=email,
                    password=generate_password_hash(password),
                    fs_uniquifier=str(uuid.uuid4()),
                    roles=['user']
                    )
                db.session.commit()

            else:
                return {"message":"This email has been registered"},404
        except Exception as e:
            print(e)
            return {"message":"Internal server error"},500
        

class ManagerSignUp(Resource):
    def post(self):
        try:
            args = signupParser.parse_args()
            username = args['username']
            email = args['email']
            password = args['password']
            confirm_password = args['confirmPassword']
            
            if password != confirm_password:
                return {"message":"Password doesn't match"},400

            if not datastore.find_user(email=email):
                datastore.create_user(
                    username=username,
                    email=email,
                    password=generate_password_hash(password),
                    fs_uniquifier=str(uuid.uuid4()),
                    roles=['manager'],
                    active=False
                    )
                db.session.commit()

            else:
                return {"message":"This email has been registered"},404
        except Exception as e:
            print(e)
            return {"message":"Internal server error"},500