from flask import render_template
from celery import shared_task
from .models import Product,User,Role,Order
from sqlalchemy import extract
from datetime import datetime
from jinja2 import Template
from .mail_sender import daily_remainder_mail_as_plain,monthly_report_email_as_html
import csv
import os
import logging


@shared_task(ignore_result=False)
def export_csv():
    try:
        products  = Product.query.all()
        data = []
        for product in products:
            data.append({
                "Product name":product.product_name,
                "Product unit":product.product_unit,
                "Unit cost":product.rate_per_unit,
                "Quantity Available":product.product_quantity,
                "Manufactured date":product.manufactured_date.strftime('%Y-%m-%d'),
                "Expiry date":product.expiry_date.strftime('%Y-%m-%d'),
                "Category name":product.category.category_name
            })
        
        csv_file = "../output.csv"
        field_names = [
            'Product name',
            'Product unit',
            'Unit cost',
            'Quantity Available',
            'Manufactured date',
            'Expiry date',
            'Category name'
            ] 
        with open(csv_file,'w',newline='') as file:
            writer = csv.DictWriter(file,fieldnames=field_names)
            writer.writeheader()
            writer.writerows(data)

        print(data)
        return csv_file
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return None
    

@shared_task(ignore_result=False)
def remainder_message():
    try:
        users = User.query.join(User.roles).filter(Role.name == 'user').all()
        for user in users:
            message = f"""Dear [{user.username}],
            \nWe are missing your presence!
            \nthere are a lot of products has been added since your last visit,
            \n
            \n Srishti's store"""
            subject = "Just a remainder!"
            daily_remainder_mail_as_plain(user.email,subject,message)
        return "success!"
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return None
    
    

@shared_task(ignore_result=False)
def report_message():
    try:
        customers = User.query.join(User.roles).filter(Role.name == 'user').all()
    
        report_month = datetime.now().strftime('%B')
        report_year = datetime.now().strftime('%Y')

        email_subject = f'Monthly Report for {report_month} {report_year}'
    
        template_directory = os.path.dirname(__file__)
        report_template_file = os.path.join(template_directory, "../templates", 'monthly_report.html')
    
        for customer in customers:
            with open(report_template_file, 'r') as file:
                report_template = Template(file.read())

                customer_orders = Order.query.filter(
                            Order.userId == customer.id,
                            extract('month', Order.orderDate) == datetime.now().month
                         ).all()
                total_cost = 0
                order_details=[]
                if customer_orders:
                    for order in customer_orders:
                        product = Product.query.filter_by(id = order.productId).first()
                        total_cost += order.quantity * product.rate_per_unit 
                
                        order_details.append(
                            (order.id, product.product_name, order.quantity, order.orderDate.strftime('%d/%m/%Y'))
                            )
                    monthly_report_email_as_html(
                        customer.email, 
                        email_subject, 
                        report_template.render(
                            customer=customer, 
                            orders=order_details, 
                            month=report_month, 
                            year=report_year, 
                            total_cost=total_cost
                            )
                        )
        return "success"

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return None