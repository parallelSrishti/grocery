from flask_restful import reqparse,Resource
from .models import db,Category,User
from flask_security import auth_required,roles_required
from .instances import cache


categoryParser = reqparse.RequestParser()
categoryParser.add_argument('category_name',type=str,required=True,help='Category field is missing!')

categoryUpdateParser = reqparse.RequestParser()
categoryUpdateParser.add_argument('categoryID',type=int,required=True,help='Category id missing!')
categoryUpdateParser.add_argument('new_name',type=str,required=True,help='Category id missing!')

categoryDeleteParser = reqparse.RequestParser()
categoryDeleteParser.add_argument('categoryID',type=int,required=True,help='Category id missing!')

class CategoryAdmin(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        try:
            args = categoryParser.parse_args()
            name = args['category_name'].lower()
            check = name.strip()

            if not check:
                return {"error":"Category name can't be empty"},400
            existing = Category.query.filter_by(category_name=name).first()
            if existing:
                return {"error":"Category name already exists"},400
            category = Category(category_name=name,is_approved=True)
            db.session.add(category)
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":"Category created successfully!!"},200

        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    @roles_required('admin')
    def put(self):
        try:
            args = categoryUpdateParser.parse_args()
            categoryId = args['categoryID']
            new_name = args['new_name'].lower()
            check = new_name.strip()
            
            if not check:
                return {"error":"Category name can't be empty"},400
            
            toUpdate = Category.query.filter_by(id=categoryId,is_approved=True).first()
            if not toUpdate:
                return {"error":"Category doesn't exists"},400
            
            existing = Category.query.filter_by(category_name=new_name,is_approved=True).first()
            if existing and existing.id != toUpdate.id:
                return {"error":"Category name already exists"},400
            
            toUpdate.category_name = new_name
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":"Category name updated successfully"},200
            
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    @roles_required('admin')
    def delete(self):
        try:
            args = categoryDeleteParser.parse_args()
            categoryId = args['categoryID']
            toDelete = Category.query.filter_by(id=categoryId,is_approved=True).first()
            if not toDelete:
                return {"error":"Category doesn't exists"},400
            for product in toDelete.products:
                db.session.delete(product)
            db.session.delete(toDelete)
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":f"Category {toDelete.category_name} deleted successfully"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500



managerIdParser = reqparse.RequestParser()
managerIdParser.add_argument('managerID',type=int,required=True,help='Manager id missing!')

class ManagerApproval(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        try:
            managers = User.query.filter_by(active=False).all()
            if not managers:
                return {"message":"No pending requests found!"},200
            
            manager_data=[]
            for manager in managers:
                data = {
                    'managerId':manager.id,
                    'manager_name':manager.username,
                    'manager_email':manager.email
                }
                manager_data.append(data)
            return {"managers":manager_data},200

        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    @roles_required('admin')
    def put(self):
        try:
            args = managerIdParser.parse_args()
            managerID = args['managerID']
            manager = User.query.filter_by(id = managerID,active=False).first()

            if not manager:
                return {"error":"manager doesn't exists"},404
            
            manager.active = True
            db.session.commit()
            
            return {"message":f"{manager.username} got approved"},200
            
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self):
        try:
            args = managerIdParser.parse_args()
            managerID = args['managerID']
            manager = User.query.filter_by(id = managerID,active=False).first()

            if not manager:
                return {"error":"manager doesn't exists"},404
            
            db.session.delete(manager)
            db.session.commit()
            
            return {"message":f"{manager.username} got deleted"},200
            
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
    


categoryIdParser = reqparse.RequestParser()
categoryIdParser.add_argument('categoryID',type=int,required=True,help='Category id missing!')



class CreateCategoryApproval(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        try:
            categories = Category.query.filter_by(is_approved=False).all()
            if not categories:
                return {"message":"No requests found"},200
            
            create_category_data = []
            for category in categories:
                data = {
                    'categoryId':category.id,
                    'category_name':category.category_name
                }
                create_category_data.append(data)
            return {"output":create_category_data},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
    
    @auth_required('token')
    @roles_required('admin')
    def put(self):
        try:
            args = categoryIdParser.parse_args()
            print("hi")
            categoryID = args['categoryID']
            category = Category.query.filter_by(id = categoryID,is_approved=False).first()
            if not category:
                return {"error":"No matching found"},404
            category.is_approved = True
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":"Approved"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    @roles_required('admin')
    def delete(self):
        try:
            args = categoryIdParser.parse_args()
            categoryID = args['categoryID']
            category = Category.query.filter_by(id = categoryID,is_approved=False).first()
            if not category:
                return {"error":"No matching found"},404
            db.session.delete(category)
            db.session.commit()
            
            return {"message":"Rejected"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500


class UpdateCategoryApproval(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        try:
            categories = Category.query.filter_by(has_update_req=True).all()
            if not categories:
                return {"message":"No requests found"},200
            
            create_category_data = []
            for category in categories:
                data = {
                    'categoryId':category.id,
                    'category_name':category.category_name,
                    'category_new_name':category.new_name
                }
                create_category_data.append(data)
            return {"output":create_category_data},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
    
    @auth_required('token')
    @roles_required('admin')
    def put(self):
        try:
            args = categoryUpdateParser.parse_args()
            categoryId = args['categoryID']
            new_name = args['new_name'].lower()
            check = new_name.strip()
            
            if not check:
                return {"error":"Category name can't be empty"},400
            
            toUpdate = Category.query.filter_by(id=categoryId,is_approved=True,has_update_req=True).first()
            if not toUpdate:
                return {"error":"Category doesn't exists"},400
            
            existing = Category.query.filter_by(category_name=new_name,is_approved=True).first()
            if existing and existing.id != toUpdate.id:
                return {"error":"Category name already exists"},400
            
            toUpdate.category_name = new_name
            toUpdate.new_name = None
            toUpdate.has_update_req = False
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":"Category name updated successfully"},200
            
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    @roles_required('admin')
    def delete(self):
        try:
            args = categoryIdParser.parse_args()
            categoryID = args['categoryID']
            category = Category.query.filter_by(id = categoryID,has_update_req=True).first()
            print(category)
            if not category:
                return {"error":"Category doesn't exists"},400
            category.new_name = None
            category.has_update_req = False
            db.session.commit()
            
            return {"message":"Category rejected successfully"},200

        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        

class DeleteCategoryApproval(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        try:
            categories = Category.query.filter_by(has_delete_req=True).all()
            if not categories:
                return {"message":"No requests found"},200
            
            create_category_data = []
            for category in categories:
                data = {
                    'categoryId':category.id,
                    'category_name':category.category_name
                }
                create_category_data.append(data)
            
            return {"output":create_category_data},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
    
    @auth_required('token')
    @roles_required('admin')
    def put(self):
        try:
            args = categoryIdParser.parse_args()
            categoryID = args['categoryID']
            category = Category.query.filter_by(id = categoryID,has_delete_req=True).first()
            if not category:
                return {"error":"Category doesn't exists"},400
            category.has_delete_req = False
            db.session.commit()
            
            return {"message":"Category delete request rejected successfully"},200

        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    @roles_required('admin')
    def delete(self):
        try:
            args = categoryDeleteParser.parse_args()
            categoryId = args['categoryID']
            toDelete = Category.query.filter_by(id=categoryId,has_delete_req=True).first()
            if not toDelete:
                return {"error":"Category doesn't exists"},400
            for product in toDelete.products:
                db.session.delete(product)
            db.session.delete(toDelete)
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":f"Category {toDelete.category_name} deleted successfully"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500