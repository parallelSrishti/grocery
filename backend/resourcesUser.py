from flask_restful import reqparse,Resource
from .models import db,Category,Product,Cart,Order
from flask_security import auth_required,current_user
from .instances import cache
import uuid


addToCartParser = reqparse.RequestParser()
addToCartParser.add_argument('requiredQuantity',type=int,required=True,help='quantity field is missing!')
addToCartParser.add_argument('productID',type=int,required=True,help='product field is missing!')


updateCartParser = reqparse.RequestParser()
updateCartParser.add_argument('itemID',type=int,required=True,help='item field is missing!')


class UserAddToCart(Resource):
    @auth_required('token')
    def post(self):
        try:
            args = addToCartParser.parse_args()
            requiredQuantity = args['requiredQuantity']
            if not requiredQuantity or requiredQuantity < 1 :
                return {"error":"enter a valid quantity"},400
            productID = args['productID']
            product = Product.query.filter_by(id = productID).first()
            if not product:
                return {"error":"Give a valid product"},404
            if product.product_quantity < int(requiredQuantity):
                return {"error":"Out of stock!"},404
            
            existing = Cart.query.filter_by(productId =productID ).first()
            if existing:
                if product.product_quantity < (existing.quantity_req + requiredQuantity):
                    return {"error":"Out of stock!"},404
                
                existing.quantity_req += requiredQuantity
                db.session.commit()
                return {"message":"item added to cart successfully"},200
            
            cart = Cart(
                quantity_req=requiredQuantity,
                productId=productID,
                userId = current_user.id)
            
            db.session.add(cart)
            db.session.commit()
            return {"message":"item added to cart successfully"},200
            
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    def get(self):
        try:
            output = []
            total_amount = 0
            cartItems = Cart.query.filter_by(userId=current_user.id).all()
            for item in cartItems:
                product = Product.query.filter_by(id=item.productId).first()
                category = Category.query.filter_by(id = product.categoryId).first()
                cart = {
                    "id":item.id,
                    "Quantity_required":item.quantity_req,
                    "product":{
                        "product_name":product.product_name,
                        "rate_per_unit":product.rate_per_unit,
                        "product_unit":product.product_unit
                    },
                    "category_name":category.category_name,
                    "user_id":current_user.id
                }
                output.append(cart)
                total_amount += item.quantity_req * product.rate_per_unit

            return {"cart":output,"total_amount":total_amount},200

        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    def put(self):
        try:
            args = updateCartParser.parse_args()
            itemID = args['itemID']
            cart = Cart.query.filter_by(id = itemID).first()
            if not cart:
                return {"error":"cart id not found"},404
            product =  Product.query.filter_by(id = cart.productId).first()
            if cart.quantity_req + 1 > product.product_quantity:
                return {"error":"Out of stock!"},404
            cart.quantity_req += 1
            db.session.commit()
            return {"message":"quantity added successfully"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
        
    @auth_required('token')
    def delete(self):
        try:
            args = updateCartParser.parse_args()
            itemID = args['itemID']
            cart = Cart.query.filter_by(id = itemID).first()
            if not cart:
                return {"error":"cart id not found"},404
            if cart.quantity_req -1 > 0:
                cart.quantity_req -= 1
                db.session.commit()
                return {"message":"quantity added successfully"},200
            return {"error":"Out of stock!"},404
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500



class BuyProducts(Resource):
    def delete(self):
        try:
            args = updateCartParser.parse_args()
            itemID = args['itemID']
            cart_item = Cart.query.filter_by(id = itemID).first()
            if not cart_item :
                return {"error":"Item not found"},404
            db.session.delete(cart_item)
            db.session.commit()

            return {"message":"item removed successfully"},200
        
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500

    def post(self):
        try:
            transaction_ID = str(uuid.uuid4())+str(current_user.username[0:2])+str(current_user.id)
            cart = Cart.query.filter_by(userId = current_user.id).all()
            if not cart:
                return {"error":"Cart is empty add some products"},404
            for item in cart:
                product = Product.query.filter_by(id=item.productId).first()
                if not product:
                    return {"error":"Product is not there might be sold out"},404
                if product.product_quantity < item.quantity_req:
                    return {"error":'Out of stock!!'},404
                order = Order(
                    transaction_id = transaction_ID,
                    userId = current_user.id,
                    productId = product.id,
                    quantity = item.quantity_req
                )
                db.session.add(order)
                product.product_quantity -= item.quantity_req
                db.session.delete(item)

            db.session.commit()
            cache.delete("CategoriesWithProducts")
            return {"message":"Order commited successfully"},200
        except Exception as e:
            print(e)
            return {"error":"Internal server error"},500
