from flask_restful import reqparse,Resource
from .models import db,Category,Product
from flask_security import auth_required,roles_required
from datetime import datetime
from .instances import cache


CategoryManagerParser = reqparse.RequestParser()
CategoryManagerParser.add_argument('categoryID',type=int,required=True,help='Category id required')
CategoryManagerParser.add_argument('new_name',type=str,required=True,help='New name required!!')

createCategoryManagerParser = reqparse.RequestParser()
createCategoryManagerParser.add_argument('category_name',type=str,required=True,help='Category field is missing!')


deleteCategoryManagerParser = reqparse.RequestParser()
deleteCategoryManagerParser.add_argument('categoryID',type=int,required=True,help='Category id missing!')


class CategoryManager(Resource):
    @auth_required('token')
    @roles_required('manager')
    def put(self):
        try:
            args = CategoryManagerParser.parse_args()
            categoryID = args['categoryID']
            check = args['new_name'].strip()

            if not check :
                return {"error":"Category name can't be empty"},400
            
            new_name = args['new_name'].lower()

            toUpdate = Category.query.filter_by(id=categoryID,is_approved=True).first()

            if not toUpdate:
                return {"error":"Category doesn't exists"},400
            
            existing = Category.query.filter_by(category_name=new_name,is_approved=True).first()
            if existing and existing.id != toUpdate.id:
                return {"error":"Category name already exists"},400
            
            toUpdate.new_name = new_name
            toUpdate.has_update_req = True
            db.session.commit()
            
            return {"message":"Category name update request submitted successfully"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        

    @auth_required('token')
    @roles_required('manager')
    def post(self):
        try:
            args = createCategoryManagerParser.parse_args()
            name = args['category_name'].lower()
            check = name.strip()

            if not check:
                return {"error":"Category name can't be empty"},400
            
            existing = Category.query.filter_by(category_name=name).first()
            if existing:
                return {"error":"Category name already exists"},400
            
            category = Category(category_name=name,is_approved=False)
            db.session.add(category)
            db.session.commit()
            
            return {"message":"Category requested successfully!!"},200

        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    @roles_required('manager')
    def delete(self):
        try:
            args = deleteCategoryManagerParser.parse_args()
            categoryId = args['categoryID']

            toDelete = Category.query.filter_by(id=categoryId,is_approved=True).first()
            if not toDelete:
                return {"error":"Category doesn't exists"},400
            
            toDelete.has_delete_req = True
            db.session.commit()
            
            return {"message":f"Category {toDelete.category_name} delete request submitted successfully"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500


createProductParser = reqparse.RequestParser()
createProductParser.add_argument('product_name',type=str,required=True,help='Product name is missing!')
createProductParser.add_argument('product_unit',type=str,required=True,help='Product unit is missing!')
createProductParser.add_argument('product_rate_per_unit',type=int,required=True,help='Product rate per unit is not valid')
createProductParser.add_argument('product_quantity',type=int,required=True,help='Product quantity is missing!')
createProductParser.add_argument('product_manufactured_date',type=str,required=True,help='Product manufactured date is missing!')
createProductParser.add_argument('product_expiry_date',type=str,required=True,help='Product expiry date is missing!')
createProductParser.add_argument('product_category_name',type=str,required=True,help='Category name required')



updateProductParser = reqparse.RequestParser()
updateProductParser.add_argument('productID',required=True,type=int,help='Product id is missing!')
updateProductParser.add_argument('new_name',type=str,help='Product name is missing!')
updateProductParser.add_argument('new_unit',type=str,help='Product unit is missing!')
updateProductParser.add_argument('new_rate',type=int,help='Product rate per unit is not valid')
updateProductParser.add_argument('new_quantity',type=int,help='Product quantity is missing!')
updateProductParser.add_argument('new_manufactured_date',type=str,help='Product manufactured date is missing!')
updateProductParser.add_argument('new_expiry_date',type=str,help='Product expiry date is missing!')
updateProductParser.add_argument('new_category_name',type=str,help='Category name required')

deleteteProductParser = reqparse.RequestParser()
deleteteProductParser.add_argument('deleteID',required=True,type=int,help='Product id is missing!')



class ManagerProduct(Resource):
    @auth_required('token')
    @roles_required('manager')
    def post(self):
        units = ["Rs/kg","Rs/gram","Rs/packet","Rs/Litre","Rs/piece","Rs/dozen"]
        try:
            args = createProductParser.parse_args()

            product_name = args['product_name'].lower()
            if not product_name.strip():
                return {"error":"Product name can't be empty"},400
            
            product_unit = args['product_unit']
            if product_unit not in units:
                return {"error":"Provide a valid unit"},400
            
            product_rate_per_unit = args['product_rate_per_unit']
            product_quantity = args['product_quantity']
            product_manufactured_date = args['product_manufactured_date']
            product_expiry_date = args['product_expiry_date']
            product_category_name = args['product_category_name']

            existingCat = Category.query.filter_by(category_name = product_category_name).first()
            if not existingCat:
                return {"error":"Category name doesn't exists"},404
            
            existingProd = Product.query.filter_by(product_name = product_name).first()
            if existingProd:
                return {"error":"Product already exists"},400
            
            product = Product(
                product_name = product_name,
                product_unit = product_unit,
                rate_per_unit = product_rate_per_unit,
                product_quantity = product_quantity,
                manufactured_date = datetime.strptime(product_manufactured_date, "%Y-%m-%d").date(),
                expiry_date = datetime.strptime(product_expiry_date, "%Y-%m-%d").date(),
                categoryId = existingCat.id,
            )
            db.session.add(product)
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":"Product added successfully"},200

        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500 


    @auth_required('token')
    @roles_required('manager')
    def put(self):
        units = ["Rs/kg","Rs/gram","Rs/packet","Rs/Litre","Rs/piece","Rs/dozen"]
        try:
            args = updateProductParser.parse_args()

            oldProductId = args['productID']
            productToUpdate = Product.query.filter_by(id = oldProductId).first()
            if not productToUpdate:
                return {"error":"Give a valid product to update"},404 

            new_name = args['new_name']
            if new_name and new_name.strip():
                new_name = new_name.lower()
                existingProduct = Product.query.filter_by(product_name = new_name).first()
                if existingProduct and existingProduct.id != oldProductId:
                    return {"error":"Product name already exists"},400
                
                productToUpdate.product_name = new_name
            
            new_unit = args['new_unit']
            if new_unit:
                if new_unit not in units:
                    return {"error":"Provide a valid unit"},400
                else:
                    productToUpdate.product_unit = new_unit
            
            product_rate = args['new_rate']
            if product_rate:
                productToUpdate.rate_per_unit = product_rate
            
            new_quantity = args['new_quantity']
            if new_quantity:
                productToUpdate.product_quantity = new_quantity

            new_manufactured_date = args['new_manufactured_date']
            if new_manufactured_date:
                productToUpdate.manufactured_date = datetime.strptime(new_manufactured_date, "%Y-%m-%d").date()

            new_expiry_date = args['new_expiry_date']
            if new_expiry_date:
                productToUpdate.expiry_date = datetime.strptime(new_expiry_date, "%Y-%m-%d").date()
            
            new_category_name = args['new_category_name']
            if new_category_name:
                category = Category.query.filter_by(category_name = new_category_name).first()
                if category:
                    productToUpdate.categoryId = category.id
                
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":f"Product update for {productToUpdate.product_name} is successfull"},200

        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500 


    @auth_required('token')
    @roles_required('manager')
    def delete(self):
        try:
            args = deleteteProductParser.parse_args()
            deleteId = args['deleteID']
            product = Product.query.filter_by(id = deleteId).first()
            if not product:
                return {"error":"Select a valid Product to delete"},404
            db.session.delete(product)
            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":f"{product.product_name} deleted successfully"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500    


   
  


