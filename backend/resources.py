from flask_restful import Resource,Api,fields,marshal,reqparse
from flask_security import auth_required
from .models import db,Category,Product
from .resourcesAuth import Login,UserSignUp,ManagerSignUp
from .resourcesAdmin import CategoryAdmin,ManagerApproval,CreateCategoryApproval,UpdateCategoryApproval,DeleteCategoryApproval
from .resourcesManager import CategoryManager,ManagerProduct
from .resourcesUser import UserAddToCart,BuyProducts
from .instances import cache

api = Api()

product_fields = {
    'id': fields.Integer,
    'product_name': fields.String,
    'product_unit': fields.String(attribute=lambda x: x.product_unit[3:]), 
    'rate_per_unit': fields.Integer,
    'product_quantity': fields.Integer,
    'manufactured_date': fields.DateTime(dt_format='iso8601'),
    'expiry_date': fields.DateTime(dt_format='iso8601')
}

searchFilterParser = reqparse.RequestParser()
searchFilterParser.add_argument('displayType',type=str,required=True,help='displayType field is missing!')
searchFilterParser.add_argument('searchQuery',type=str,required=True,help='searchQuery field is missing!')


class CategoriesWithProducts(Resource):
    @cache.cached(timeout=60,key_prefix="CategoriesWithProducts")
    @auth_required('token')
    def get(self):
        try:
            output = []
            categories = Category.query.filter_by(is_approved=True).all()
            for category in categories:
                products = Product.query.filter_by(categoryId=category.id).all()
                data = {
                    'id':category.id,
                    'category_name':category.category_name,
                    'products':[marshal(product,product_fields) for product in products]
                }
                output.append(data)

            return {"categories":output},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    def post(self):
        try:
            args = searchFilterParser.parse_args()
            displayType = args['displayType']
            searchQuery = args['searchQuery'].replace(" ","")
            output = []

            if displayType == 'Cateogry':
                categories = Category.query.filter(
                    (Category.is_approved == True) & 
                    (Category.category_name.like(f'%{searchQuery}%'))
                    ).all()
            
            else:
                categories = Category.query.filter_by(is_approved=True).all()

            for category in categories:

                if displayType == 'Product':
                    products = Product.query.filter(
                        (Product.categoryId == category.id) & 
                        (Product.product_name.like(f'%{searchQuery}%'))
                        ).all()
                    
                elif displayType == 'Price' and searchQuery.isnumeric():
                    products = Product.query.filter(
                        (Product.categoryId == category.id) & 
                        (Product.rate_per_unit <= int(searchQuery))
                        ).all()
                    
                else:
                    products = Product.query.filter_by(categoryId=category.id).all()

                data = {
                    'id':category.id,
                    'category_name':category.category_name,
                    'products':[marshal(product,product_fields) for product in products]
                }
                output.append(data)

            return {"categories":output},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
      

    
api.add_resource(CategoriesWithProducts,'/display')
api.add_resource(Login,'/user-login')
api.add_resource(UserSignUp,'/user-register')
api.add_resource(ManagerSignUp,'/manager-register')
api.add_resource(CategoryAdmin,'/admin-category')
api.add_resource(ManagerApproval,'/admin-approval-manager')
api.add_resource(CategoryManager,'/manager-category')
api.add_resource(ManagerProduct,'/manager-product')
api.add_resource(CreateCategoryApproval,'/create-category-approval')
api.add_resource(UpdateCategoryApproval,'/update-category-approval')
api.add_resource(DeleteCategoryApproval,'/delete-category-approval')
api.add_resource(UserAddToCart,'/add-to-cart')
api.add_resource(BuyProducts,'/buy')
